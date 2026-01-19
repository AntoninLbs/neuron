// src/app/(app)/learn/[projectId]/actions.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { 
  calculateNextSchedule, 
  calculateXpGained,
  shouldUpdateStreak,
  XP_DAILY_GOAL,
  XP_STREAK_BONUS,
} from '@/lib/spaced-repetition'

interface AnswerCardInput {
  cardId: string
  isCorrect: boolean
}

export async function answerCard(input: AnswerCardInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Non authentifié' }
  }

  const { cardId, isCorrect } = input

  try {
    // Récupérer la carte
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        project: { userId: session.user.id },
      },
    })

    if (!card) {
      return { success: false, error: 'Carte non trouvée' }
    }

    // Calculer le nouveau schedule
    const schedule = calculateNextSchedule(card.stageIndex, isCorrect)
    const xp = calculateXpGained(isCorrect, true)

    // Mettre à jour la carte
    await prisma.card.update({
      where: { id: cardId },
      data: {
        stageIndex: schedule.stageIndex,
        dueDate: schedule.dueDate,
        lastResult: isCorrect,
        lastAnsweredAt: new Date(),
        timesAnswered: { increment: 1 },
        timesCorrect: isCorrect ? { increment: 1 } : undefined,
      },
    })

    // Créer la review
    await prisma.review.create({
      data: {
        cardId,
        isCorrect,
      },
    })

    // Mettre à jour les stats utilisateur
    await prisma.userStats.update({
      where: { userId: session.user.id },
      data: {
        totalXp: { increment: xp },
        totalAnswered: { increment: 1 },
        totalCorrect: isCorrect ? { increment: 1 } : undefined,
        totalReviews: { increment: 1 },
      },
    })

    // Mettre à jour le compteur de cartes maîtrisées si nécessaire
    if (schedule.isMastered && !card.lastResult) {
      await prisma.project.update({
        where: { id: card.projectId },
        data: { masteredCards: { increment: 1 } },
      })
    }

    return { success: true, xp, schedule }
  } catch (error) {
    console.error('Error answering card:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

interface CreateNewCardInput {
  projectId: string
  questionId: string
  isCorrect: boolean
}

export async function createNewCard(input: CreateNewCardInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Non authentifié' }
  }

  const { projectId, questionId, isCorrect } = input

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return { success: false, error: 'Projet non trouvé' }
    }

    // Calculer le schedule initial
    const schedule = calculateNextSchedule(0, isCorrect)
    const xp = calculateXpGained(isCorrect, false)

    // Créer la carte
    const card = await prisma.card.create({
      data: {
        projectId,
        questionId,
        stageIndex: schedule.stageIndex,
        dueDate: schedule.dueDate,
        lastResult: isCorrect,
        lastAnsweredAt: new Date(),
        timesAnswered: 1,
        timesCorrect: isCorrect ? 1 : 0,
      },
    })

    // Créer la review
    await prisma.review.create({
      data: {
        cardId: card.id,
        isCorrect,
      },
    })

    // Mettre à jour le compteur de cartes du projet
    await prisma.project.update({
      where: { id: projectId },
      data: { totalCards: { increment: 1 } },
    })

    // Mettre à jour les stats utilisateur
    await prisma.userStats.update({
      where: { userId: session.user.id },
      data: {
        totalXp: { increment: xp },
        totalAnswered: { increment: 1 },
        totalCorrect: isCorrect ? { increment: 1 } : undefined,
      },
    })

    return { success: true, cardId: card.id, xp, schedule }
  } catch (error) {
    console.error('Error creating card:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

interface CompleteSessionInput {
  projectId: string
  xpEarned: number
  reviewsDone: number
  newCardsDone: number
}

export async function completeSession(input: CompleteSessionInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Non authentifié' }
  }

  const { projectId, xpEarned, reviewsDone, newCardsDone } = input

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Récupérer ou créer la session du jour
    const dailySession = await prisma.dailySession.upsert({
      where: {
        projectId_date: {
          projectId,
          date: today,
        },
      },
      update: {
        reviewsDone: { increment: reviewsDone },
        newCardsDone: { increment: newCardsDone },
        xpEarned: { increment: xpEarned },
        isCompleted: true,
      },
      create: {
        projectId,
        date: today,
        reviewsDone,
        newCardsDone,
        xpEarned,
        isCompleted: true,
      },
    })

    // Gérer le streak
    const userStats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
    })

    if (userStats) {
      const streakUpdate = shouldUpdateStreak(userStats.lastActivityAt)
      
      let newStreak = userStats.currentStreak
      let bonusXp = 0
      
      if (streakUpdate.shouldReset) {
        newStreak = 1
      } else if (streakUpdate.shouldIncrement) {
        newStreak = userStats.currentStreak + 1
        bonusXp = XP_STREAK_BONUS
      }

      // Bonus objectif quotidien atteint
      if (dailySession.isCompleted) {
        bonusXp += XP_DAILY_GOAL
      }

      await prisma.userStats.update({
        where: { userId: session.user.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(userStats.longestStreak, newStreak),
          lastActivityAt: new Date(),
          totalXp: bonusXp > 0 ? { increment: bonusXp } : undefined,
        },
      })
    }

    revalidatePath('/dashboard')
    revalidatePath(`/learn/${projectId}`)

    return { success: true }
  } catch (error) {
    console.error('Error completing session:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
