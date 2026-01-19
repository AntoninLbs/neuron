// src/app/(app)/learn/[projectId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Loader2, Star, Sparkles, Send, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { OctopusMascot } from '@/components/mascot/octopus'
import { 
  PRESET_CATEGORIES, 
  calculateAdaptation,
  calculateStars,
  calculateGemsReward,
  getRandomMessage,
  type Card as CardType, 
  type Project, 
  type PresetCategoryKey,
  type MascotMood,
} from '@/types'
import { cn } from '@/lib/utils'

type Phase = 'loading' | 'playing' | 'retry' | 'results'

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function normalizeAnswer(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim()
}

function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const u = normalizeAnswer(userAnswer)
  const c = normalizeAnswer(correctAnswer)
  if (u === c) return true
  if (c.length >= 4 && (u.includes(c) || c.includes(u))) return true
  return false
}

export default function LearnProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.projectId as string

  // Data
  const [project, setProject] = useState<Project | null>(null)
  const [sessionCards, setSessionCards] = useState<CardType[]>([])
  
  // Session
  const [phase, setPhase] = useState<Phase>('loading')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wrongCards, setWrongCards] = useState<CardType[]>([])
  const [score, setScore] = useState({ correct: 0, total: 0 })
  
  // Current question
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [directAnswer, setDirectAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  
  // Mascot
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle')
  const [mascotMessage, setMascotMessage] = useState('')
  
  // Results
  const [earnedStars, setEarnedStars] = useState<0 | 1 | 2 | 3>(0)
  const [earnedGems, setEarnedGems] = useState(0)
  const [adaptationMessage, setAdaptationMessage] = useState('')

  const currentCard = sessionCards[currentIndex]
  const isQCM = project?.answer_mode === 'qcm'

  // Charger les données
  useEffect(() => {
    async function loadData() {
      if (!user || !projectId) return

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (projectError) throw projectError
        setProject(projectData)

        // Cartes à réviser
        const { data: cardsData } = await supabase
          .from('cards')
          .select('*')
          .eq('project_id', projectId)
          .lte('next_review', new Date().toISOString())
          .order('next_review', { ascending: true })
          .limit(10)

        const cards = cardsData || []

        if (cards.length > 0) {
          setSessionCards(shuffle(cards))
          setPhase('playing')
          setMascotMood('happy')
          setMascotMessage(getRandomMessage('welcome'))
        } else {
          setPhase('results')
          setMascotMood('idle')
          setMascotMessage("Rien à réviser ! Reviens demain 😊")
        }
      } catch (error) {
        console.error('Erreur chargement:', error)
        setPhase('results')
      }
    }

    loadData()
  }, [user, projectId])

  // Gérer la réponse
  const handleAnswer = async (answerIndex?: number) => {
    if (showResult || !currentCard) return

    let correct = false

    if (isQCM && answerIndex !== undefined) {
      setSelectedAnswer(answerIndex)
      correct = answerIndex === currentCard.correct_index
    } else if (!isQCM) {
      correct = checkAnswer(directAnswer, currentCard.answer)
    }

    setIsCorrect(correct)
    setShowResult(true)
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))

    // Mascotte réagit
    if (correct) {
      setMascotMood('excited')
      setMascotMessage(getRandomMessage('correct'))
    } else {
      setMascotMood('sad')
      setMascotMessage(getRandomMessage('wrong'))
      if (phase === 'playing') {
        setWrongCards(prev => [...prev, currentCard])
      }
    }

    // Mettre à jour la carte (spaced repetition)
    const now = new Date()
    let nextReview: Date
    let newInterval: number
    let newRepetitions: number
    let newEaseFactor: number
    let newStatus: string

    if (correct) {
      newRepetitions = currentCard.repetitions + 1
      newEaseFactor = Math.min(2.5, currentCard.ease_factor + 0.1)
      newInterval = newRepetitions === 1 ? 1 : newRepetitions === 2 ? 3 : newRepetitions === 3 ? 7 : Math.round(currentCard.interval * newEaseFactor)
      newStatus = newRepetitions >= 4 ? 'mastered' : 'review'
      nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
    } else {
      newRepetitions = 0
      newInterval = 0
      newEaseFactor = Math.max(1.3, currentCard.ease_factor - 0.2)
      newStatus = 'learning'
      nextReview = now
    }

    await supabase.from('cards').update({
      ease_factor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      next_review: nextReview.toISOString(),
      last_reviewed: now.toISOString(),
      status: newStatus,
      times_correct: currentCard.times_correct + (correct ? 1 : 0),
      times_wrong: currentCard.times_wrong + (correct ? 0 : 1),
    }).eq('id', currentCard.id)
  }

  // Question suivante
  const handleNext = async () => {
    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setDirectAnswer('')
      setShowResult(false)
      setMascotMood('idle')
      setMascotMessage('')
    } else if (phase === 'playing' && wrongCards.length > 0) {
      // Phase retry
      setSessionCards(shuffle(wrongCards))
      setWrongCards([])
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setDirectAnswer('')
      setShowResult(false)
      setPhase('retry')
      setMascotMood('thinking')
      setMascotMessage("On révise les erreurs ! 💪")
    } else {
      // Fin de session - calculer résultats
      await finishSession()
    }
  }

  // Terminer la session
  const finishSession = async () => {
    if (!project || !user) return

    const scorePercent = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    const stars = calculateStars(scorePercent)
    const gems = calculateGemsReward(stars, true, false)

    setEarnedStars(stars)
    setEarnedGems(gems)

    // Calculer l'adaptation de difficulté
    const adaptation = calculateAdaptation(
      project.current_difficulty as any,
      scorePercent,
      project.consecutive_good_sessions
    )
    setAdaptationMessage(adaptation.message)

    // Mettre à jour le projet
    const newConsecutive = scorePercent >= 70 
      ? project.consecutive_good_sessions + 1 
      : 0

    await supabase.from('projects').update({
      current_difficulty: adaptation.newDifficulty,
      total_sessions: project.total_sessions + 1,
      total_correct: project.total_correct + score.correct,
      total_wrong: project.total_wrong + (score.total - score.correct),
      consecutive_good_sessions: newConsecutive,
      last_session_at: new Date().toISOString(),
    }).eq('id', project.id)

    // Ajouter les gems au profil
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_gems')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_gems: (profile.total_gems || 0) + gems })
          .eq('id', user.id)
      }
    } catch (e) {
      console.error('Erreur mise à jour gems:', e)
    }

    setPhase('results')
    setMascotMood(scorePercent >= 70 ? 'celebrating' : scorePercent >= 40 ? 'happy' : 'thinking')
  }

  // Générer plus de questions
  const generateMoreQuestions = async () => {
    if (!project) return

    setPhase('loading')
    setMascotMessage("Je génère de nouvelles questions... 🧠")

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: project.categories,
          schoolLevel: project.school_level,
          difficulty: project.current_difficulty,
          answerMode: project.answer_mode,
          count: 10,
        }),
      })

      if (!response.ok) throw new Error('Erreur')

      const { questions } = await response.json()

      if (questions?.length > 0) {
        const newCards = questions.map((q: any) => ({
          project_id: project.id,
          question: q.question,
          answer: q.answer,
          choices: q.choices || null,
          correct_index: q.correctIndex ?? null,
          explanation: q.explanation,
          category: q.category,
          difficulty: project.current_difficulty,
          status: 'new',
        }))

        const { data: insertedCards } = await supabase.from('cards').insert(newCards).select()

        setSessionCards(shuffle(insertedCards || []))
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setDirectAnswer('')
        setShowResult(false)
        setScore({ correct: 0, total: 0 })
        setWrongCards([])
        setPhase('playing')
        setMascotMood('happy')
        setMascotMessage("C'est reparti ! 🚀")
      }
    } catch (error) {
      console.error('Erreur génération:', error)
      setMascotMessage("Oups, erreur... Réessaie ! 😅")
      setPhase('results')
    }
  }

  // Loading
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <OctopusMascot mood="thinking" message={mascotMessage} size="lg" />
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Résultats
  if (phase === 'results' && project) {
    const scorePercent = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-lg px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold truncate">{project.name}</h1>
          </div>

          <Card className="text-center py-8">
            <CardContent className="space-y-6">
              <OctopusMascot 
                mood={mascotMood} 
                message={score.total > 0 ? adaptationMessage : mascotMessage}
                size="lg"
                className="mx-auto"
              />

              {score.total > 0 ? (
                <>
                  <div>
                    <p className="text-5xl font-bold text-orange-500">{scorePercent}%</p>
                    <p className="text-muted-foreground">{score.correct}/{score.total} bonnes réponses</p>
                  </div>

                  {/* Étoiles */}
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          'w-10 h-10 transition-all',
                          s <= earnedStars
                            ? 'text-yellow-400 fill-yellow-400 animate-star-pop'
                            : 'text-gray-300'
                        )}
                        style={{ animationDelay: `${s * 0.2}s` }}
                      />
                    ))}
                  </div>

                  {/* Gems gagnées */}
                  {earnedGems > 0 && (
                    <div className="flex items-center justify-center gap-2 text-lg font-bold text-purple-500">
                      <span className="text-2xl">💎</span>
                      +{earnedGems} gems
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <Trophy className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                  <h2 className="text-xl font-bold">Rien à réviser !</h2>
                  <p className="text-muted-foreground">Génère de nouvelles questions ou reviens demain.</p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={generateMoreQuestions} className="bg-orange-500 hover:bg-orange-600">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Nouvelles questions
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">Retour</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Quiz en cours
  const getCategoryInfo = (cat: string) => {
    const preset = PRESET_CATEGORIES[cat as PresetCategoryKey]
    return { icon: preset?.icon || '📌', name: preset?.name || cat }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="text-center flex-1">
            <p className="text-sm text-muted-foreground truncate px-2">{project?.name}</p>
            <p className="font-medium">
              {currentIndex + 1}/{sessionCards.length}
              {phase === 'retry' && <span className="text-orange-500 ml-2">(Révision)</span>}
            </p>
          </div>
          <div className="w-10" />
        </div>

        <Progress value={((currentIndex + 1) / sessionCards.length) * 100} className="mb-4 h-2" />

        {/* Mascotte */}
        <div className="flex justify-center mb-4">
          <OctopusMascot 
            mood={mascotMood} 
            message={mascotMessage}
            size="md"
            showMessage={!!mascotMessage}
          />
        </div>

        {/* Catégorie */}
        {currentCard && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{getCategoryInfo(currentCard.category).icon}</span>
            <span className="text-sm text-muted-foreground">{getCategoryInfo(currentCard.category).name}</span>
          </div>
        )}

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-lg font-medium leading-relaxed">{currentCard?.question}</p>
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
                    !showResult && 'hover:border-orange-300',
                    !showResult && isSelected && 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
                    showCorrectStyle && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                    showIncorrectStyle && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                    showResult && !showCorrectStyle && !showIncorrectStyle && 'opacity-50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium',
                    showCorrectStyle && 'border-green-500 bg-green-500 text-white',
                    showIncorrectStyle && 'border-red-500 bg-red-500 text-white'
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
          <div className="mb-6 flex gap-2">
            <Input
              placeholder="Ta réponse..."
              value={directAnswer}
              onChange={(e) => setDirectAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && directAnswer.trim() && handleAnswer()}
              className="flex-1"
            />
            <Button onClick={() => handleAnswer()} disabled={!directAnswer.trim()} className="bg-orange-500 hover:bg-orange-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Résultat réponse directe */}
        {!isQCM && showResult && (
          <Card className={cn('mb-6', isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50')}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
                <span className={cn('font-medium', isCorrect ? 'text-green-700' : 'text-red-700')}>
                  {isCorrect ? 'Correct !' : 'Incorrect'}
                </span>
              </div>
              {!isCorrect && <p className="text-sm"><span className="text-muted-foreground">Bonne réponse :</span> <strong>{currentCard?.answer}</strong></p>}
            </CardContent>
          </Card>
        )}

        {/* Explication */}
        {showResult && currentCard?.explanation && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">💡 Explication</p>
              <p className="text-sm text-muted-foreground">{currentCard.explanation}</p>
            </CardContent>
          </Card>
        )}

        {/* Bouton suivant */}
        {showResult && (
          <Button onClick={handleNext} className="w-full bg-orange-500 hover:bg-orange-600" size="lg">
            {currentIndex < sessionCards.length - 1 
              ? 'Suivant' 
              : phase === 'playing' && wrongCards.length > 0
                ? `Réviser (${wrongCards.length})`
                : 'Voir résultats'
            }
          </Button>
        )}
      </div>
    </div>
  )
}
