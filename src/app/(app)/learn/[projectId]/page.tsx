// src/app/(app)/learn/[projectId]/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { LearnSession } from './learn-session'

interface PageProps {
  params: { projectId: string }
}

export default async function LearnPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const { projectId } = params

  // Récupérer le projet avec les cartes dues et les thèmes
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
    include: {
      themes: {
        include: { theme: true },
      },
    },
  })

  if (!project) notFound()

  // Récupérer les cartes dues pour révision
  const dueCards = await prisma.card.findMany({
    where: {
      projectId,
      dueDate: { lte: new Date() },
    },
    include: {
      question: {
        include: { theme: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  // Récupérer les questions disponibles pour nouvelles cartes
  const themeIds = project.themes.map(t => t.themeId)
  
  // IDs des questions déjà dans le projet
  const existingQuestionIds = await prisma.card.findMany({
    where: { projectId },
    select: { questionId: true },
  }).then(cards => cards.map(c => c.questionId))

  // Questions disponibles (pas encore dans le projet)
  const availableQuestions = await prisma.question.findMany({
    where: {
      themeId: { in: themeIds },
      difficulty: project.difficulty,
      id: { notIn: existingQuestionIds },
    },
    include: { theme: true },
    take: project.dailyGoal * 2, // Prendre un peu plus pour avoir de la marge
  })

  // Stats de la session du jour
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todaySession = await prisma.dailySession.findFirst({
    where: {
      projectId,
      date: today,
    },
  })

  const newCardsLeft = Math.max(0, project.dailyGoal - (todaySession?.newCardsDone || 0))

  // Stats utilisateur
  const userStats = await prisma.userStats.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <LearnSession
      project={{
        id: project.id,
        name: project.name,
        dailyGoal: project.dailyGoal,
        difficulty: project.difficulty,
      }}
      dueCards={dueCards}
      availableQuestions={availableQuestions}
      newCardsLeft={newCardsLeft}
      userStats={{
        currentStreak: userStats?.currentStreak || 0,
        totalXp: userStats?.totalXp || 0,
      }}
    />
  )
}
