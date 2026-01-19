// src/app/(app)/projects/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Sparkles, Check, Plus, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { 
  PRESET_CATEGORIES, 
  DIFFICULTY_OPTIONS, 
  suggestCorrection,
  type PresetCategoryKey, 
  type Difficulty,
  type AnswerMode 
} from '@/types'
import { cn } from '@/lib/utils'

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  // Step 1: Info
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('BEGINNER')
  const [answerMode, setAnswerMode] = useState<AnswerMode>('qcm')
  
  // Step 2: Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customCategory, setCustomCategory] = useState('')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  
  // UI State
  const [step, setStep] = useState<'info' | 'categories' | 'generating'>('info')
  const [isCreating, setIsCreating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Vérifier l'orthographe en temps réel
  useEffect(() => {
    if (customCategory.length >= 3) {
      const corrected = suggestCorrection(customCategory)
      if (corrected && corrected.toLowerCase() !== customCategory.toLowerCase()) {
        setSuggestion(corrected)
        setShowSuggestion(true)
      } else {
        setSuggestion(null)
        setShowSuggestion(false)
      }
    } else {
      setSuggestion(null)
      setShowSuggestion(false)
    }
  }, [customCategory])

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    )
  }

  const addCustomCategory = (categoryName?: string) => {
    const catToAdd = categoryName || customCategory.trim()
    if (catToAdd && !selectedCategories.includes(catToAdd)) {
      setSelectedCategories(prev => [...prev, catToAdd])
      setCustomCategory('')
      setSuggestion(null)
      setShowSuggestion(false)
    }
  }

  const acceptSuggestion = () => {
    if (suggestion) {
      addCustomCategory(suggestion)
    }
  }

  const handleCreate = async () => {
    if (!user || !name.trim() || selectedCategories.length === 0) return

    setIsCreating(true)
    setStep('generating')
    setProgress(10)

    try {
      // 1. Créer le projet
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: name.trim(),
          categories: selectedCategories,
          difficulty,
          answer_mode: answerMode,
          daily_limit: 10,
        })
        .select()
        .single()

      if (projectError) throw projectError
      setProgress(30)

      // 2. Générer les questions via l'API
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          difficulty,
          answerMode,
          count: 10, // 10 questions initiales
        }),
      })

      if (!response.ok) throw new Error('Erreur génération')
      setProgress(70)

      const { questions } = await response.json()

      // 3. Sauvegarder les cartes
      if (questions && questions.length > 0) {
        const cards = questions.map((q: any) => ({
          project_id: project.id,
          question: q.question,
          answer: q.answer,
          choices: q.choices || null,
          correct_index: q.correctIndex ?? null,
          explanation: q.explanation,
          category: q.category,
          status: 'new',
        }))

        const { error: cardsError } = await supabase
          .from('cards')
          .insert(cards)

        if (cardsError) throw cardsError
      }

      setProgress(100)

      // 4. Rediriger vers le projet
      setTimeout(() => {
        router.push(`/learn/${project.id}`)
      }, 500)

    } catch (error) {
      console.error('Erreur création projet:', error)
      alert('Erreur lors de la création du projet')
      setIsCreating(false)
      setStep('info')
    }
  }

  // Étape 1: Informations de base
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Nouveau projet</h1>
              <p className="text-muted-foreground">Étape 1/2 - Configuration</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-6">
            {/* Nom du projet */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du projet</Label>
              <Input
                id="name"
                placeholder="Ex: Révisions Marketing Digital"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Mode de réponse */}
            <div className="space-y-3">
              <Label>Mode de réponse</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAnswerMode('qcm')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    answerMode === 'qcm'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-border hover:border-orange-300'
                  )}
                >
                  <p className="font-semibold mb-1">📝 QCM</p>
                  <p className="text-sm text-muted-foreground">4 choix de réponse</p>
                </button>
                <button
                  onClick={() => setAnswerMode('direct')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    answerMode === 'direct'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-border hover:border-orange-300'
                  )}
                >
                  <p className="font-semibold mb-1">✍️ Réponse libre</p>
                  <p className="text-sm text-muted-foreground">Sans aide ni choix</p>
                </button>
              </div>
            </div>

            {/* Difficulté */}
            <div className="space-y-3">
              <Label>Niveau de difficulté</Label>
              <div className="grid gap-3">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                      difficulty === opt.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        : 'border-border hover:border-orange-300'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      difficulty === opt.value ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground'
                    )}>
                      {difficulty === opt.value && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm text-muted-foreground">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep('categories')}
              disabled={!name.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600"
              size="lg"
            >
              Continuer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Étape 2: Sélection des catégories
  if (step === 'categories') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl px-4 py-6 pb-32">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setStep('info')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Choisir les thèmes</h1>
              <p className="text-muted-foreground">
                {selectedCategories.length} sélectionné{selectedCategories.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Catégories sélectionnées */}
          {selectedCategories.length > 0 && (
            <div className="mb-6">
              <Label className="mb-2 block">Thèmes sélectionnés</Label>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((cat) => {
                  const preset = PRESET_CATEGORIES[cat as PresetCategoryKey]
                  return (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                    >
                      {preset?.icon || '📌'} {preset?.name || cat}
                      <button
                        onClick={() => toggleCategory(cat)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Ajouter une catégorie personnalisée */}
          <div className="mb-6">
            <Label className="mb-2 block">Ajouter un thème personnalisé</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Ex: Neurologie, SEO, Python..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customCategory.trim()) {
                      e.preventDefault()
                      if (showSuggestion && suggestion) {
                        acceptSuggestion()
                      } else {
                        addCustomCategory()
                      }
                    }
                  }}
                />
                {/* Suggestion orthographique */}
                {showSuggestion && suggestion && (
                  <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg z-10">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          Voulez-vous dire <strong>{suggestion}</strong> ?
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={acceptSuggestion}
                            className="h-7 text-xs"
                          >
                            Oui, utiliser "{suggestion}"
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowSuggestion(false)
                              addCustomCategory()
                            }}
                            className="h-7 text-xs"
                          >
                            Non, garder "{customCategory}"
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  if (showSuggestion && suggestion) {
                    acceptSuggestion()
                  } else {
                    addCustomCategory()
                  }
                }}
                disabled={!customCategory.trim()}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grille de catégories prédéfinies */}
          <div className="mb-6">
            <Label className="mb-2 block">Ou choisir parmi les thèmes populaires</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(PRESET_CATEGORIES) as [PresetCategoryKey, typeof PRESET_CATEGORIES[PresetCategoryKey]][]).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                    selectedCategories.includes(key)
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-border hover:border-orange-300'
                  )}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm font-medium truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions fixes en bas */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            <div className="container max-w-2xl flex gap-3">
              <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
                Retour
              </Button>
              <Button
                onClick={handleCreate}
                disabled={selectedCategories.length === 0 || isCreating}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Créer ({selectedCategories.length} thème{selectedCategories.length > 1 ? 's' : ''})
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Étape 3: Génération en cours
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Création en cours...</h2>
          <p className="text-muted-foreground">
            {progress < 30 && "Création du projet..."}
            {progress >= 30 && progress < 70 && "Génération des questions avec l'IA..."}
            {progress >= 70 && progress < 100 && "Sauvegarde des cartes..."}
            {progress >= 100 && "C'est prêt !"}
          </p>
        </div>
        <div className="w-64 mx-auto bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
