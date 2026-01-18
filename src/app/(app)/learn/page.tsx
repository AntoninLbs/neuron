// src/app/(app)/learn/page.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, BookOpen, Rocket } from 'lucide-react'

export default function LearnPage() {
  return (
    <div className="container max-w-lg px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Apprendre</h1>
          <p className="text-muted-foreground">Choisis un projet</p>
        </div>
        <Link href="/projects/new">
          <Button size="icon" variant="outline" className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neuron-100 dark:bg-neuron-900/30">
            <Rocket className="h-8 w-8 text-neuron-500" />
          </div>
          <h3 className="font-medium mb-2">Aucun projet pour l&apos;instant</h3>
          <p className="text-sm text-muted-foreground mb-4">
            La création de projets arrive bientôt !
            <br />
            Tu pourras créer tes propres parcours d&apos;apprentissage.
          </p>
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un projet
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
