// src/app/(app)/learn/[projectId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Loader2, Trophy, RefreshCw, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { CATEGORIES, type Card as CardType, type Project, type CategoryKey } from '@/types'
import { cn } from '@/lib/utils'

export default function LearnProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  // Charger le projet et les cartes
  useEffect(() => {
    async function loadData() {
      if (!user || !projectId) return

      try {
        // Charger le projet
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (projectError) throw projectError
        setProject(projectData)

        // Charger les cartes à réviser (next_review <= maintenant)
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .eq('project_id', projectId)
          .lte('next_review', new Date().toISOString())
          .order('next_review', { ascending: true })
          .limit(10)

        if (cardsError) throw cardsError
        setCards(cardsData || [])
      } catch (error) {
        console.error('Erreur chargement:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, projectId])

  const currentCard = cards[currentIndex]

  const handleAnswer = async (index: number) => {
    if (showResult || !currentCard) return

    setSelectedAnswer(index)
    setShowResult(true)

    const isCorrect = index === currentCard.correct_index

    // Mettre à jour le score
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    // Mettre à jour la carte avec l'algorithme de répétition espacée (SM-2 simplifié)
    const newEaseFactor = Math.max(1.3, currentCard.ease_factor + (isCorrect ? 0.1 : -0.2))
    const newRepetitions = isCorrect ? currentCard.repetitions + 1 : 0
    
    let newInterval: number
    if (!isCorrect) {
      newInterval = 1 // Revoir demain
    } else if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(currentCard.interval * newEaseFactor)
    }

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + newInterval)

    await supabase
      .from('cards')
      .update({
        ease_factor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        next_review: nextReview.toISOString(),
      })
      .eq('id', currentCard.id)

    // Mettre à jour les stats utilisateur (optionnel)
    try {
      await supabase.rpc('increment_user_stats', {
        user_id: user?.id,
        is_correct: isCorrect,
      })
    } catch {
      // Ignorer si la fonction n'existe pas encore
    }
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setSessionComplete(true)
    }
  }

  const generateMoreQuestions = async () => {
    if (!project) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: project.categories,
          difficulty: project.difficulty,
          count: 5,
        }),
      })

      if (!response.ok) throw new Error('Erreur génération')

      const { questions } = await response.json()

      if (questions && questions.length > 0) {
        const newCards = questions.map((q: any) => ({
          project_id: project.id,
          question: q.question,
          choices: q.choices,
          correct_index: q.correctIndex,
          explanation: q.explanation,
          category: q.category,
        }))

        const { data: insertedCards, error } = await supabase
          .from('cards')
          .insert(newCards)
          .select()

        if (error) throw error

        setCards(insertedCards || [])
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setShowResult(false)
        setScore({ correct: 0, total: 0 })
        setSessionComplete(false)
      }
    } catch (error) {
      console.error('Erreur génération:', error)
      alert('Erreur lors de la génération des questions')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Projet non trouvé</p>
        <Link href="/dashboard">
          <Button>Retour au dashboard</Button>
        </Link>
      </div>
    )
  }

  // Session terminée
  if (sessionComplete || cards.length === 0) {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-lg px-4 py-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{project.name}</h1>
          </div>

          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Trophy className="h-10 w-10 text-orange-500" />
              </div>

              {score.total > 0 ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Session terminée !</h2>
                    <p className="text-4xl font-bold text-orange-500">{percentage}%</p>
                    <p className="text-muted-foreground">
                      {score.correct} / {score.total} bonnes réponses
                    </p>
                  </div>

                  {percentage >= 80 && (
                    <p className="text-green-500 font-medium">Excellent travail ! 🎉</p>
                  )}
                  {percentage >= 50 && percentage < 80 && (
                    <p className="text-yellow-500 font-medium">Bien joué, continue comme ça ! 💪</p>
                  )}
                  {percentage < 50 && (
                    <p className="text-muted-foreground">Continue à t'entraîner ! 📚</p>
                  )}
                </>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Rien à réviser !</h2>
                  <p className="text-muted-foreground">
                    Toutes tes cartes sont à jour. Génère de nouvelles questions !
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={generateMoreQuestions}
                  disabled={isGenerating}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Générer de nouvelles questions
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Retour au dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Quiz en cours
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{project.name}</p>
            <p className="font-medium">{currentIndex + 1} / {cards.length}</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <Progress 
          value={((currentIndex + 1) / cards.length) * 100} 
          className="mb-6 h-2"
        />

        {/* Catégorie */}
        {currentCard && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CATEGORIES[currentCard.category as CategoryKey]?.icon}</span>
            <span className="text-sm text-muted-foreground">
              {CATEGORIES[currentCard.category as CategoryKey]?.name}
            </span>
          </div>
        )}

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-lg font-medium leading-relaxed">
              {currentCard?.question}
            </p>
          </CardContent>
        </Card>

        {/* Réponses */}
        <div className="space-y-3 mb-6">
          {currentCard?.choices.map((choice, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentCard.correct_index
            const showCorrect = showResult && isCorrect
            const showIncorrect = showResult && isSelected && !isCorrect

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                  !showResult && 'hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20',
                  !showResult && isSelected && 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
                  showCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                  showIncorrect && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                  showResult && !showCorrect && !showIncorrect && 'opacity-50'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-medium',
                  showCorrect && 'border-green-500 bg-green-500 text-white',
                  showIncorrect && 'border-red-500 bg-red-500 text-white',
                  !showResult && 'border-muted-foreground'
                )}>
                  {showCorrect && <Check className="h-4 w-4" />}
                  {showIncorrect && <X className="h-4 w-4" />}
                  {!showResult && String.fromCharCode(65 + index)}
                </div>
                <span>{choice}</span>
              </button>
            )
          })}
        </div>

        {/* Explication */}
        {showResult && currentCard?.explanation && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
                Explication
              </p>
              <p className="text-sm text-muted-foreground">
                {currentCard.explanation}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bouton suivant */}
        {showResult && (
          <Button
            onClick={handleNext}
            className="w-full bg-orange-500 hover:bg-orange-600"
            size="lg"
          >
            {currentIndex < cards.length - 1 ? 'Question suivante' : 'Voir les résultats'}
          </Button>
        )}
      </div>
    </div>
  )
}
