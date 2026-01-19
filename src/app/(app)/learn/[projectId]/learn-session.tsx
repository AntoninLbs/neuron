// src/app/(app)/learn/[projectId]/learn-session.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Flame,
  ArrowRight,
  Home,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { answerCard, createNewCard, completeSession } from './actions'
import { getNextIntervalLabel } from '@/lib/spaced-repetition'
import type { Difficulty } from '@prisma/client'

interface LearnSessionProps {
  project: {
    id: string
    name: string
    dailyGoal: number
    difficulty: Difficulty
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dueCards: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableQuestions: any[]
  newCardsLeft: number
  userStats: {
    currentStreak: number
    totalXp: number
  }
}

type SessionState = 'ready' | 'question' | 'result' | 'complete'

export function LearnSession({
  project,
  dueCards,
  availableQuestions,
  newCardsLeft: initialNewCardsLeft,
  userStats,
}: LearnSessionProps) {
  const router = useRouter()
  
  // Session state
  const [state, setState] = useState<SessionState>('ready')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [queue, setQueue] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [totalXpSession, setTotalXpSession] = useState(0)
  const [newCardsLeft, setNewCardsLeft] = useState(initialNewCardsLeft)
  
  // Stats de session
  const [correctCount, setCorrectCount] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)

  // Construire la queue initiale
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newQueue: any[] = []
    
    // D'abord les révisions dues
    newQueue.push(...dueCards)
    
    // Ensuite les nouvelles cartes (jusqu'à l'objectif)
    const newCardsToAdd = Math.min(initialNewCardsLeft, availableQuestions.length)
    for (let i = 0; i < newCardsToAdd; i++) {
      newQueue.push({ isNew: true, question: availableQuestions[i] })
    }
    
    setQueue(newQueue)
  }, [dueCards, availableQuestions, initialNewCardsLeft])

  const currentItem = queue[currentIndex]
  const isNewCard = currentItem && 'isNew' in currentItem
  const currentQuestion = isNewCard ? currentItem.question : currentItem?.question
  const currentCard = isNewCard ? null : currentItem

  const progress = queue.length > 0 ? ((currentIndex + 1) / queue.length) * 100 : 0
  const reviewsCount = dueCards.length
  const newCount = Math.min(initialNewCardsLeft, availableQuestions.length)

  const handleStart = () => {
    if (queue.length === 0) {
      setState('complete')
    } else {
      setState('question')
    }
  }

  const handleSelectAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return

    setSelectedAnswer(answerIndex)
    const correct = answerIndex === currentQuestion.correctIndex
    setIsCorrect(correct)
    setTotalAnswered(prev => prev + 1)
    if (correct) setCorrectCount(prev => prev + 1)

    // Calculer XP
    const xp = correct ? 10 : 2
    setXpGained(xp)
    setTotalXpSession(prev => prev + xp)

    // Enregistrer la réponse
    if (isNewCard) {
      // Créer la carte
      await createNewCard({
        projectId: project.id,
        questionId: currentQuestion.id,
        isCorrect: correct,
      })
      if (correct) setNewCardsLeft(prev => prev - 1)
    } else if (currentCard) {
      // Mettre à jour la carte existante
      await answerCard({
        cardId: currentCard.id,
        isCorrect: correct,
      })
    }

    setState('result')
  }

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setXpGained(0)
      setState('question')
    } else {
      // Fin de session
      completeSession({
        projectId: project.id,
        xpEarned: totalXpSession,
        reviewsDone: reviewsCount,
        newCardsDone: newCount - newCardsLeft,
      })
      setState('complete')
    }
  }

  // Écran de départ
  if (state === 'ready') {
    return (
      <div className="container max-w-lg px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
          <p className="text-muted-foreground">Session d&apos;apprentissage</p>
        </div>

        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-neuron-500">{reviewsCount}</div>
                <div className="text-sm text-muted-foreground">Révisions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-500">{newCount}</div>
                <div className="text-sm text-muted-foreground">Nouvelles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {queue.length > 0 ? (
          <Button size="lg" className="w-full" onClick={handleStart}>
            Commencer ({queue.length} questions)
          </Button>
        ) : (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tout est à jour !</h2>
            <p className="text-muted-foreground mb-6">
              Reviens demain pour de nouvelles révisions
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Retour au tableau de bord
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Écran de fin
  if (state === 'complete') {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0
    
    return (
      <div className="container max-w-lg px-4 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-neuron-400 to-neuron-600 flex items-center justify-center"
            >
              <Sparkles className="h-12 w-12 text-white" />
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Session terminée !</h1>
          <p className="text-muted-foreground mb-8">Excellent travail 🎉</p>

          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{totalAnswered}</div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Précision</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neuron-500">+{totalXpSession}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {userStats.currentStreak > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 text-neuron-500">
              <Flame className="h-6 w-6" fill="currentColor" />
              <span className="text-lg font-bold">{userStats.currentStreak} jours de streak</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/dashboard')}
            >
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
            <Button
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Rejouer
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Question / Résultat
  return (
    <div className="container max-w-lg px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {queue.length}
        </span>
        <div className="flex items-center gap-1 text-neuron-500">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">+{totalXpSession}</span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2 mb-6" />

      {/* Badge nouveau/révision */}
      <div className="flex items-center gap-2 mb-4">
        {currentQuestion?.theme?.icon && (
          <span className="text-lg">{currentQuestion.theme.icon}</span>
        )}
        <span className="text-sm text-muted-foreground">
          {currentQuestion?.theme?.name}
        </span>
        <span className={cn(
          'ml-auto text-xs px-2 py-1 rounded-full',
          isNewCard
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        )}>
          {isNewCard ? 'Nouvelle' : 'Révision'}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h2 className="text-xl font-semibold mb-6">
            {currentQuestion?.question}
          </h2>

          {/* Choix */}
          <div className="space-y-3">
            {currentQuestion?.choices?.map((choice: string, index: number) => {
              const isSelected = selectedAnswer === index
              const isCorrectAnswer = index === currentQuestion.correctIndex
              const showResult = state === 'result'
              
              let variant: 'answer' | 'answer-selected' | 'answer-correct' | 'answer-incorrect' = 'answer'
              
              if (showResult) {
                if (isCorrectAnswer) {
                  variant = 'answer-correct'
                } else if (isSelected && !isCorrect) {
                  variant = 'answer-incorrect'
                }
              } else if (isSelected) {
                variant = 'answer-selected'
              }

              return (
                <Button
                  key={index}
                  variant={variant}
                  size="lg"
                  className={cn(
                    'w-full justify-start text-left h-auto py-4 px-5',
                    showResult && isCorrectAnswer && 'animate-correct'
                  )}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={state === 'result'}
                >
                  <span className="flex-1">{choice}</span>
                  {showResult && isCorrectAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                </Button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Résultat */}
      <AnimatePresence>
        {state === 'result' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg"
          >
            <div className="container max-w-lg mx-auto">
              {/* Feedback */}
              <div className={cn(
                'flex items-center gap-3 mb-4 p-3 rounded-xl',
                isCorrect
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              )}>
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                )}
                <div className="flex-1">
                  <div className={cn(
                    'font-semibold',
                    isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  )}>
                    {isCorrect ? 'Correct !' : 'Incorrect'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isCorrect
                      ? getNextIntervalLabel(currentCard?.stageIndex || 0, true)
                      : 'Revient demain'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-neuron-500">+{xpGained}</span>
                  <span className="text-sm text-muted-foreground"> XP</span>
                </div>
              </div>

              {/* Explication */}
              {currentQuestion?.explanation && (
                <p className="text-sm text-muted-foreground mb-4">
                  💡 {currentQuestion.explanation}
                </p>
              )}

              {/* Bouton suivant */}
              <Button size="lg" className="w-full" onClick={handleNext}>
                {currentIndex < queue.length - 1 ? (
                  <>
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Terminer
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
