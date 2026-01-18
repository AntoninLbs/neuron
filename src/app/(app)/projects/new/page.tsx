// src/app/(app)/projects/new/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Rocket, Sparkles } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()

  return (
    <div className="container max-w-lg px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neuron-100 dark:bg-neuron-900/30">
            <Rocket className="h-8 w-8 text-neuron-500" />
          </div>
          
          <h1 className="text-xl font-bold mb-2">Bientôt disponible !</h1>
          
          <p className="text-muted-foreground mb-6">
            La création de projets personnalisés arrive très bientôt.
            <br />
            On travaille dur pour te permettre de créer tes propres parcours d&apos;apprentissage.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-neuron-500 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Fonctionnalité en développement</span>
          </div>

          <Button onClick={() => router.push('/dashboard')}>
            Retour au dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
