// src/app/(app)/learn/[projectId]/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Loader2, Trophy, Sparkles, RotateCcw, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { PRESET_CATEGORIES, type Card as CardType, type Project, type PresetCategoryKey } from '@/types'
import { cn } from '@/lib/utils'

type Phase = 'loading' | 'discovery' | 'retry' | 'complete'

// Mélanger un tableau
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Normaliser une réponse pour comparaison
function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z0-9\s]/g, '') // Garder que lettres/chiffres
    .trim()
}

// Vérifier si les réponses correspondent (tolérant)
function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = normalizeAnswer(userAnswer)
  const normalizedCorrect = normalizeAnswer(correctAnswer)
  
  // Correspondance exacte
  if (normalizedUser === normalizedCorrect) return true
  
  // Tolérance : une contient l'autre si assez long
  if (normalizedCorrect.length >= 4) {
    if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
      return true
    }
  }
  
  return false
}

export default function LearnProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.projectId as string

  // Data
  const [project, setProject] = useState<Project | null>(null)
  const [allCards, setAllCards] = useState<CardType[]>([])
  
  // Session
  const [phase, setPhase] = useState<Phase>('loading')
  const [sessionCards, setSessionCards] = useState<CardType[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wrongCards, setWrongCards] = useState<CardType[]>([])
  const [score, setScore] = useState({ correct: 0, total: 0 })
  
  // Current question state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [directAnswer, setDirectAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  
  // UI
  const [isGenerating, setIsGenerating] = useState(false)

  const currentCard = sessionCards[currentIndex]
  const isQCM = project?.answer_mode === 'qcm'

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

        if (cardsError) throw cardsError
        
        const cards = cardsData || []
        setAllCards(cards)

        // Préparer la session (max 10 cartes)
        if (cards.length > 0) {
          const sessionCards = shuffle(cards).slice(0, projectData.daily_limit || 10)
          setSessionCards(sessionCards)
          setPhase('discovery')
        } else {
          setPhase('complete')
        }
      } catch (error) {
        console.error('Erreur chargement:', error)
        setPhase('complete')
      }
    }

    loadData()
  }, [user, projectId])

  // Gérer la réponse
  const handleAnswer = async (answerIndex?: number) => {
    if (showResult || !currentCard) return

    let correct = false

    if (isQCM && answerIndex !== undefined) {
      // Mode QCM
      setSelectedAnswer(answerIndex)
      correct = answerIndex === currentCard.correct_index
    } else if (!isQCM) {
      // Mode direct
      correct = checkAnswer(directAnswer, currentCard.answer)
    }

    setIsCorrect(correct)
    setShowResult(true)

    // Mettre à jour le score
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))

    // Si faux en phase discovery, ajouter aux cartes à refaire
    if (!correct && phase === 'discovery') {
      setWrongCards(prev => [...prev, currentCard])
    }

    // Mettre à jour la carte dans Supabase
    const now = new Date()
    let nextReview: Date
    let newInterval: number
    let newRepetitions: number
    let newEaseFactor: number
    let newStatus: string

    if (correct) {
      // Augmenter l'intervalle
      newRepetitions = currentCard.repetitions + 1
      newEaseFactor = Math.min(2.5, currentCard.ease_factor + 0.1)
      
      if (newRepetitions === 1) {
        newInterval = 1 // Demain
      } else if (newRepetitions === 2) {
        newInterval = 3 // Dans 3 jours
      } else if (newRepetitions === 3) {
        newInterval = 7 // Dans 1 semaine
      } else {
        newInterval = Math.round(currentCard.interval * newEaseFactor)
      }
      
      newStatus = newRepetitions >= 4 ? 'mastered' : 'review'
      nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
    } else {
      // Reset
      newRepetitions = 0
      newInterval = 0
      newEaseFactor = Math.max(1.3, currentCard.ease_factor - 0.2)
      newStatus = 'learning'
      nextReview = now // Revient immédiatement
    }

    await supabase
      .from('cards')
      .update({
        ease_factor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        next_review: nextReview.toISOString(),
        last_reviewed: now.toISOString(),
        status: newStatus,
        times_correct: currentCard.times_correct + (correct ? 1 : 0),
        times_wrong: currentCard.times_wrong + (correct ? 0 : 1),
      })
      .eq('id', currentCard.id)
  }

  // Passer à la question suivante
  const handleNext = () => {
    if (currentIndex < sessionCards.length - 1) {
      // Question suivante
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setDirectAnswer('')
      setShowResult(false)
    } else if (phase === 'discovery' && wrongCards.length > 0) {
      // Phase retry : refaire les questions ratées
      setSessionCards(shuffle(wrongCards))
      setWrongCards([])
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setDirectAnswer('')
      setShowResult(false)
      setPhase('retry')
    } else {
      // Terminé
      setPhase('complete')
    }
  }

  // Générer plus de questions
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
          answerMode: project.answer_mode,
          count: 10,
        }),
      })

      if (!response.ok) throw new Error('Erreur génération')

      const { questions } = await response.json()

      if (questions && questions.length > 0) {
        const newCards = questions.map((q: any) => ({
          project_id: project.id,
          question: q.question,
          answer: q.answer,
          choices: q.choices || null,
          correct_index: q.correctIndex ?? null,
          explanation: q.explanation,
          category: q.category,
          status: 'new',
        }))

        const { data: insertedCards, error } = await supabase
          .from('cards')
          .insert(newCards)
          .select()

        if (error) throw error

        // Relancer une session
        setSessionCards(shuffle(insertedCards || []))
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setDirectAnswer('')
        setShowResult(false)
        setScore({ correct: 0, total: 0 })
        setWrongCards([])
        setPhase('discovery')
      }
    } catch (error) {
      console.error('Erreur génération:', error)
      alert('Erreur lors de la génération des questions')
    } finally {
      setIsGenerating(false)
    }
  }

  // Loading
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Projet non trouvé
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
  if (phase === 'complete') {
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
            <h1 className="text-xl font-bold truncate">{project.name}</h1>
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
                    <p className="text-yellow-500 font-medium">Bien joué, continue ! 💪</p>
                  )}
                  {percentage < 50 && (
                    <p className="text-muted-foreground">Continue à t'entraîner ! 📚</p>
                  )}
                </>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Rien à réviser !</h2>
                  <p className="text-muted-foreground">
                    Toutes tes cartes sont à jour. Reviens demain ou génère de nouvelles questions !
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
                  Générer 10 nouvelles questions
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
  const getCategoryIcon = (cat: string) => {
    const preset = PRESET_CATEGORIES[cat as PresetCategoryKey]
    return preset?.icon || '📌'
  }

  const getCategoryName = (cat: string) => {
    const preset = PRESET_CATEGORIES[cat as PresetCategoryKey]
    return preset?.name || cat
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <p className="text-sm text-muted-foreground truncate px-2">{project.name}</p>
            <p className="font-medium">
              {currentIndex + 1} / {sessionCards.length}
              {phase === 'retry' && (
                <span className="text-orange-500 ml-2">(Révision)</span>
              )}
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <Progress 
          value={((currentIndex + 1) / sessionCards.length) * 100} 
          className="mb-4 h-2"
        />

        {/* Phase indicator */}
        {phase === 'retry' && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <RotateCcw className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700 dark:text-orange-300">
              Révision des questions ratées
            </span>
          </div>
        )}

        {/* Catégorie */}
        {currentCard && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{getCategoryIcon(currentCard.category)}</span>
            <span className="text-sm text-muted-foreground">
              {getCategoryName(currentCard.category)}
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

        {/* Réponses QCM */}
        {isQCM && currentCard?.choices && (
          <div className="space-y-3 mb-6">
            {currentCard.choices.map((choice, index) => {
              const isSelected = selectedAnswer === index
              const isCorrectChoice = index === currentCard.correct_index
              const showCorrectStyle = showResult && isCorrectChoice
              const showIncorrectStyle = showResult && isSelected && !isCorrectChoice

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                    !showResult && 'hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20',
                    !showResult && isSelected && 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
                    showCorrectStyle && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                    showIncorrectStyle && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                    showResult && !showCorrectStyle && !showIncorrectStyle && 'opacity-50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-medium',
                    showCorrectStyle && 'border-green-500 bg-green-500 text-white',
                    showIncorrectStyle && 'border-red-500 bg-red-500 text-white',
                    !showResult && 'border-muted-foreground'
                  )}>
                    {showCorrectStyle && <Check className="h-4 w-4" />}
                    {showIncorrectStyle && <X className="h-4 w-4" />}
                    {!showResult && String.fromCharCode(65 + index)}
                  </div>
                  <span>{choice}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Réponse directe */}
        {!isQCM && !showResult && (
          <div className="mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Tape ta réponse..."
                value={directAnswer}
                onChange={(e) => setDirectAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && directAnswer.trim()) {
                    handleAnswer()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={() => handleAnswer()}
                disabled={!directAnswer.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Résultat mode direct */}
        {!isQCM && showResult && (
          <Card className={cn(
            'mb-6',
            isCorrect 
              ? 'border-green-200 bg-green-50 dark:bg-green-950/20' 
              : 'border-red-200 bg-red-50 dark:bg-red-950/20'
          )}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
                <span className={cn(
                  'font-medium',
                  isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                )}>
                  {isCorrect ? 'Correct !' : 'Incorrect'}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Ta réponse : </span>
                  <span className="line-through">{directAnswer}</span>
                </p>
              )}
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">Bonne réponse : </span>
                <span className="font-medium">{currentCard?.answer}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Explication */}
        {showResult && currentCard?.explanation && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
                💡 Explication
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
            {currentIndex < sessionCards.length - 1 
              ? 'Question suivante' 
              : phase === 'discovery' && wrongCards.length > 0
                ? `Réviser les ${wrongCards.length} erreur${wrongCards.length > 1 ? 's' : ''}`
                : 'Voir les résultats'
            }
          </Button>
        )}
      </div>
    </div>
  )
}
