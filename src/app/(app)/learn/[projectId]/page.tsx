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

  const dueCardsRaw = await prisma.card.findMany({
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dueCards: any[] = dueCardsRaw.map(card => ({
    id: card.id,
    stageIndex: card.stageIndex,
    question: {
      id: card.question.id,
      question: card.question.question,
      choices: card.question.choices as string[],
      correctIndex: card.question.correctIndex,
      explanation: card.question.explanation,
      theme: {
        name: card.question.theme.name,
        icon: card.question.theme.icon,
      },
    },
  }))

  const themeIds = project.themes.map(t => t.themeId)
  
  const existingQuestionIds = await prisma.card.findMany({
    where: { projectId },
    select: { questionId: true },
  }).then(cards => cards.map(c => c.questionId))

  const availableQuestionsRaw = await prisma.question.findMany({
    where: {
      themeId: { in: themeIds },
      difficulty: project.difficulty,
      id: { notIn: existingQuestionIds },
    },
    include: { theme: true },
    take: project.dailyGoal * 2,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const availableQuestions: any[] = availableQuestionsRaw.map(q => ({
    id: q.id,
    question: q.question,
    choices: q.choices as string[],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    theme: {
      name: q.theme.name,
      icon: q.theme.icon,
    },
  }))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todaySession = await prisma.dailySession.findFirst({
    where: {
      projectId,
      date: today,
    },
  })

  const newCardsLeft = Math.max(0, project.dailyGoal - (todaySession?.newCardsDone || 0))

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
