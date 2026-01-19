// src/app/(app)/projects/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Sparkles, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { CATEGORIES, DIFFICULTY_OPTIONS, type CategoryKey, type Difficulty } from '@/types'
import { cn } from '@/lib/utils'

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('BEGINNER')
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState<'info' | 'categories' | 'generating'>('info')
  const [progress, setProgress] = useState(0)

  const toggleCategory = (cat: CategoryKey) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    )
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
          choices: q.choices,
          correct_index: q.correctIndex,
          explanation: q.explanation,
          category: q.category,
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
              <p className="text-muted-foreground">Étape 1/2 - Informations</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-6">
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
        <div className="container max-w-2xl px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setStep('info')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Choisir les thèmes</h1>
              <p className="text-muted-foreground">
                Étape 2/2 - {selectedCategories.length} sélectionné{selectedCategories.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Grille de catégories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {(Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => toggleCategory(key)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  selectedCategories.includes(key)
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-border hover:border-orange-300'
                )}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-medium text-center">{cat.name}</span>
                {selectedCategories.includes(key) && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={handleCreate}
              disabled={selectedCategories.length === 0 || isCreating}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Créer le projet
            </Button>
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
