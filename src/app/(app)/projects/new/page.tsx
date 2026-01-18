// src/app/(app)/projects/new/page.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createProject } from './actions'
import { THEME_CATEGORIES, DIFFICULTY_LABELS } from '@/types'
import type { Difficulty } from '@prisma/client'

// Données des thèmes (seront chargées dynamiquement en prod)
const THEMES_DATA = [
  { id: 'physique', name: 'Physique', slug: 'physique', category: 'sciences', icon: '⚛️' },
  { id: 'chimie', name: 'Chimie', slug: 'chimie', category: 'sciences', icon: '🧪' },
  { id: 'biologie', name: 'Biologie', slug: 'biologie', category: 'sciences', icon: '🧬' },
  { id: 'astronomie', name: 'Astronomie', slug: 'astronomie', category: 'sciences', icon: '🌌' },
  { id: 'mathematiques', name: 'Mathématiques', slug: 'mathematiques', category: 'sciences', icon: '📐' },
  { id: 'histoire-france', name: 'Histoire de France', slug: 'histoire-france', category: 'histoire', icon: '🇫🇷' },
  { id: 'histoire-mondiale', name: 'Histoire mondiale', slug: 'histoire-mondiale', category: 'histoire', icon: '🌍' },
  { id: 'antiquite', name: 'Antiquité', slug: 'antiquite', category: 'histoire', icon: '🏛️' },
  { id: 'capitales', name: 'Capitales du monde', slug: 'capitales', category: 'geographie', icon: '🏙️' },
  { id: 'drapeaux', name: 'Drapeaux', slug: 'drapeaux', category: 'geographie', icon: '🚩' },
  { id: 'peinture', name: 'Peinture', slug: 'peinture', category: 'arts', icon: '🎨' },
  { id: 'cinema', name: 'Cinéma', slug: 'cinema', category: 'arts', icon: '🎬' },
  { id: 'litterature', name: 'Littérature', slug: 'litterature', category: 'arts', icon: '📚' },
  { id: 'football', name: 'Football', slug: 'football', category: 'sport', icon: '⚽' },
  { id: 'jo', name: 'Jeux Olympiques', slug: 'jo', category: 'sport', icon: '🏅' },
  { id: 'economie', name: 'Économie mondiale', slug: 'economie', category: 'economie', icon: '💹' },
  { id: 'informatique', name: 'Informatique', slug: 'informatique', category: 'tech', icon: '💻' },
  { id: 'ia', name: 'Intelligence artificielle', slug: 'ia', category: 'tech', icon: '🤖' },
  { id: 'mythologie', name: 'Mythologie', slug: 'mythologie', category: 'culture', icon: '⚡' },
  { id: 'gastronomie', name: 'Gastronomie', slug: 'gastronomie', category: 'culture', icon: '🍽️' },
]

type Step = 1 | 2 | 3

export default function NewProjectPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('INTERMEDIATE')
  const [dailyGoal, setDailyGoal] = useState(5)

  const toggleTheme = (slug: string) => {
    setSelectedThemes(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    )
  }

  const handleSubmit = () => {
    if (!name.trim() || selectedThemes.length === 0) return

    startTransition(async () => {
      const result = await createProject({
        name: name.trim(),
        themeSlugs: selectedThemes,
        difficulty,
        dailyGoal,
      })
      
      if (result.success && result.projectId) {
        router.push(`/learn/${result.projectId}`)
      }
    })
  }

  const canProceed = {
    1: name.trim().length >= 2,
    2: selectedThemes.length >= 1,
    3: true,
  }

  return (
    <div className="container max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <h1 className="text-2xl font-bold">Nouveau projet</h1>
        <p className="text-muted-foreground">Étape {step} sur 3</p>
        <Progress value={(step / 3) * 100} className="mt-4 h-2" />
      </div>

      {/* Step 1: Nom */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Comment veux-tu appeler ce projet ?
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Culture G, Histoire, Quiz sport..."
              className="text-lg h-14"
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Tu pourras le modifier plus tard
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Thèmes */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <Label className="text-base">
              Choisis tes thématiques
            </Label>
            <p className="text-sm text-muted-foreground">
              {selectedThemes.length} sélectionné{selectedThemes.length > 1 ? 's' : ''}
            </p>
          </div>

          {Object.entries(THEME_CATEGORIES).map(([key, category]) => {
            const categoryThemes = THEMES_DATA.filter(t => t.category === key)
            if (categoryThemes.length === 0) return null

            return (
              <div key={key}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {category.icon} {category.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categoryThemes.map((theme) => {
                    const isSelected = selectedThemes.includes(theme.slug)
                    return (
                      <button
                        key={theme.slug}
                        onClick={() => toggleTheme(theme.slug)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all touch-target',
                          isSelected
                            ? 'bg-neuron-500 text-white'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                        )}
                      >
                        <span>{theme.icon}</span>
                        <span>{theme.name}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Step 3: Paramètres */}
      {step === 3 && (
        <div className="space-y-8">
          {/* Difficulté */}
          <div className="space-y-3">
            <Label className="text-base">Niveau de difficulté</Label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={cn(
                    'py-4 px-3 rounded-xl border-2 text-center transition-all touch-target',
                    difficulty === diff
                      ? 'border-neuron-500 bg-neuron-50 dark:bg-neuron-950/30'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <div className={cn('font-medium', DIFFICULTY_LABELS[diff].color)}>
                    {DIFFICULTY_LABELS[diff].label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Objectif quotidien */}
          <div className="space-y-3">
            <Label className="text-base">
              Nouvelles questions par jour
            </Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDailyGoal(Math.max(1, dailyGoal - 1))}
                disabled={dailyGoal <= 1}
              >
                -
              </Button>
              <span className="text-4xl font-bold w-16 text-center">{dailyGoal}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDailyGoal(Math.min(20, dailyGoal + 1))}
                disabled={dailyGoal >= 20}
              >
                +
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              + les révisions (cartes déjà apprises)
            </p>
          </div>

          {/* Récap */}
          <Card>
            <CardContent className="py-4">
              <h3 className="font-semibold mb-3">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projet</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thèmes</span>
                  <span className="font-medium">{selectedThemes.length} sélectionnés</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulté</span>
                  <span className={cn('font-medium', DIFFICULTY_LABELS[difficulty].color)}>
                    {DIFFICULTY_LABELS[difficulty].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objectif</span>
                  <span className="font-medium">{dailyGoal} questions/jour</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step < 3 ? (
          <Button
            size="lg"
            className="flex-1"
            onClick={() => setStep((step + 1) as Step)}
            disabled={!canProceed[step]}
          >
            Continuer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Créer le projet
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
