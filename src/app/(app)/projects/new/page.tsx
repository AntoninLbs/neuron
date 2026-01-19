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
import { OctopusMascot } from '@/components/mascot/octopus'
import { 
  PRESET_CATEGORIES, 
  SCHOOL_LEVELS,
  suggestCorrection,
  type PresetCategoryKey, 
  type SchoolLevel,
  type AnswerMode,
  getRandomMessage,
} from '@/types'
import { cn } from '@/lib/utils'

type Step = 'name' | 'school' | 'mode' | 'categories' | 'generating'

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('lycee')
  const [answerMode, setAnswerMode] = useState<AnswerMode>('qcm')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customCategory, setCustomCategory] = useState('')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mascotMessage, setMascotMessage] = useState("Salut ! On crée ton projet ? 🐙")

  // Correction orthographique
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

  const handleCreate = async () => {
    if (!user || !name.trim() || selectedCategories.length === 0) return

    setStep('generating')
    setProgress(10)
    setMascotMessage("Je prépare tout ça... 🧠")

    try {
      // 1. Créer le projet
      const startingDifficulty = SCHOOL_LEVELS[schoolLevel].order * 2 // 2, 4, 6, 8, 10
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: name.trim(),
          categories: selectedCategories,
          school_level: schoolLevel,
          current_difficulty: Math.min(startingDifficulty, 10),
          answer_mode: answerMode,
        })
        .select()
        .single()

      if (projectError) throw projectError
      setProgress(30)
      setMascotMessage("Création de la carte... 🗺️")

      // 2. Créer les niveaux de la carte (5 niveaux par monde, 1 monde par catégorie)
      const worldLevels: Array<{
        project_id: string
        world_number: number
        level_number: number
        name: string
        category: string
        is_boss: boolean
        is_unlocked: boolean
        gems_reward: number
      }> = []
      selectedCategories.forEach((category, worldIndex) => {
        const worldNumber = worldIndex + 1
        const categoryName = PRESET_CATEGORIES[category as PresetCategoryKey]?.name || category
        
        for (let levelNum = 1; levelNum <= 5; levelNum++) {
          worldLevels.push({
            project_id: project.id,
            world_number: worldNumber,
            level_number: levelNum,
            name: levelNum === 5 
              ? `Boss ${categoryName}` 
              : `${categoryName} ${levelNum}`,
            category,
            is_boss: levelNum === 5,
            is_unlocked: worldNumber === 1 && levelNum === 1, // Premier niveau débloqué
            gems_reward: levelNum === 5 ? 100 : 30, // Boss donne plus
          })
        }
      })

      const { error: levelsError } = await supabase
        .from('world_levels')
        .insert(worldLevels)

      if (levelsError) throw levelsError
      setProgress(50)
      setMascotMessage("Génération des questions... ✨")

      // 3. Générer les questions pour le premier niveau
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: [selectedCategories[0]], // Première catégorie
          schoolLevel,
          difficulty: Math.min(startingDifficulty, 10),
          answerMode,
          count: 10,
        }),
      })

      if (!response.ok) throw new Error('Erreur génération')
      setProgress(80)

      const { questions } = await response.json()

      // 4. Sauvegarder les cartes
      if (questions && questions.length > 0) {
        const cards = questions.map((q: any) => ({
          project_id: project.id,
          question: q.question,
          answer: q.answer,
          choices: q.choices || null,
          correct_index: q.correctIndex ?? null,
          explanation: q.explanation,
          category: q.category,
          difficulty: startingDifficulty,
          status: 'new',
        }))

        const { error: cardsError } = await supabase
          .from('cards')
          .insert(cards)

        if (cardsError) throw cardsError
      }

      setProgress(100)
      setMascotMessage("C'est prêt ! Let's go ! 🚀")

      setTimeout(() => {
        router.push(`/learn/${project.id}`)
      }, 800)

    } catch (error) {
      console.error('Erreur création projet:', error)
      setMascotMessage("Oups, une erreur... Réessaie ! 😅")
      setTimeout(() => setStep('categories'), 2000)
    }
  }

  // Rendu selon l'étape
  const renderStep = () => {
    switch (step) {
      case 'name':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <OctopusMascot 
                mood="happy" 
                message={mascotMessage}
                size="lg"
                className="mx-auto mb-4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Comment s'appelle ton projet ?</Label>
              <Input
                id="name"
                placeholder="Ex: Révisions Bac, Marketing Digital..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg"
                autoFocus
              />
            </div>

            <Button
              onClick={() => {
                setStep('school')
                setMascotMessage("Super nom ! 👍")
              }}
              disabled={!name.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600"
              size="lg"
            >
              Continuer
            </Button>
          </div>
        )

      case 'school':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <OctopusMascot 
                mood="thinking" 
                message="Tu es à quel niveau ?"
                size="md"
                className="mx-auto mb-4"
              />
            </div>

            <div className="space-y-3">
              {(Object.entries(SCHOOL_LEVELS) as [SchoolLevel, typeof SCHOOL_LEVELS[SchoolLevel]][]).map(([key, level]) => (
                <button
                  key={key}
                  onClick={() => setSchoolLevel(key)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                    schoolLevel === key
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-border hover:border-orange-300'
                  )}
                >
                  <span className="text-2xl">{level.icon}</span>
                  <div>
                    <p className="font-semibold">{level.name}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                  {schoolLevel === key && (
                    <Check className="ml-auto h-5 w-5 text-orange-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('name')} className="flex-1">
                Retour
              </Button>
              <Button
                onClick={() => {
                  setStep('mode')
                  setMascotMessage("Parfait ! Et le mode de réponse ? 🤔")
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Continuer
              </Button>
            </div>
          </div>
        )

      case 'mode':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <OctopusMascot 
                mood="thinking" 
                message={mascotMessage}
                size="md"
                className="mx-auto mb-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAnswerMode('qcm')}
                className={cn(
                  'p-6 rounded-xl border-2 transition-all text-center',
                  answerMode === 'qcm'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-border hover:border-orange-300'
                )}
              >
                <span className="text-4xl block mb-2">📝</span>
                <p className="font-semibold">QCM</p>
                <p className="text-xs text-muted-foreground mt-1">4 choix de réponse</p>
              </button>

              <button
                onClick={() => setAnswerMode('direct')}
                className={cn(
                  'p-6 rounded-xl border-2 transition-all text-center',
                  answerMode === 'direct'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-border hover:border-orange-300'
                )}
              >
                <span className="text-4xl block mb-2">✍️</span>
                <p className="font-semibold">Réponse libre</p>
                <p className="text-xs text-muted-foreground mt-1">Sans aide</p>
              </button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('school')} className="flex-1">
                Retour
              </Button>
              <Button
                onClick={() => {
                  setStep('categories')
                  setMascotMessage("Maintenant, choisis tes thèmes ! 📚")
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Continuer
              </Button>
            </div>
          </div>
        )

      case 'categories':
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <OctopusMascot 
                mood="excited" 
                message={mascotMessage}
                size="md"
                className="mx-auto mb-2"
              />
              <p className="text-sm text-muted-foreground">
                {selectedCategories.length} thème{selectedCategories.length > 1 ? 's' : ''} sélectionné{selectedCategories.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Catégories sélectionnées */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((cat) => {
                  const preset = PRESET_CATEGORIES[cat as PresetCategoryKey]
                  return (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm"
                    >
                      {preset?.icon || '📌'} {preset?.name || cat}
                      <button onClick={() => toggleCategory(cat)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Ajout personnalisé */}
            <div>
              <Label className="mb-2 block">Ajouter un thème</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Ex: Python, SEO, Anatomie..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customCategory.trim()) {
                        e.preventDefault()
                        addCustomCategory(showSuggestion && suggestion ? suggestion : undefined)
                      }
                    }}
                  />
                  {showSuggestion && suggestion && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg z-10">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">Voulez-vous dire <strong>{suggestion}</strong> ?</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => addCustomCategory(suggestion)} className="h-7 text-xs">
                              Oui
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setShowSuggestion(false); addCustomCategory() }} className="h-7 text-xs">
                              Non, garder "{customCategory}"
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={() => addCustomCategory(showSuggestion && suggestion ? suggestion : undefined)} disabled={!customCategory.trim()} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Grille catégories */}
            <div>
              <Label className="mb-2 block">Ou choisis parmi</Label>
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

            {/* Actions fixes */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
              <div className="container max-w-2xl flex gap-3">
                <Button variant="outline" onClick={() => setStep('mode')} className="flex-1">
                  Retour
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={selectedCategories.length === 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Créer ({selectedCategories.length})
                </Button>
              </div>
            </div>
          </div>
        )

      case 'generating':
        return (
          <div className="text-center space-y-6 py-12">
            <OctopusMascot 
              mood="excited" 
              message={mascotMessage}
              size="xl"
              className="mx-auto"
            />
            <div>
              <h2 className="text-xl font-bold mb-2">Création en cours...</h2>
              <p className="text-muted-foreground text-sm">
                {progress < 30 && "Création du projet..."}
                {progress >= 30 && progress < 50 && "Création de la carte..."}
                {progress >= 50 && progress < 80 && "Génération des questions..."}
                {progress >= 80 && progress < 100 && "Finalisation..."}
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
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg px-4 py-6">
        {/* Header */}
        {step !== 'generating' && (
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Nouveau projet</h1>
              <p className="text-sm text-muted-foreground">
                Étape {step === 'name' ? 1 : step === 'school' ? 2 : step === 'mode' ? 3 : 4}/4
              </p>
            </div>
          </div>
        )}

        {renderStep()}
      </div>
    </div>
  )
}
