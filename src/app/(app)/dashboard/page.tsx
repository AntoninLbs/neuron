// src/app/(app)/dashboard/page.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Plus, Flame, Trophy, BookOpen, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  // Stats par défaut pour le MVP
  const stats = {
    streak: 0,
    level: 1,
    xp: 0,
    xpForNext: 100,
    progress: 0,
  }

  const userName = user?.user_metadata?.full_name?.split(' ')[0] 
    || user?.email?.split('@')[0] 
    || 'toi'

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bonjour, {userName} 👋</h1>
          <p className="text-muted-foreground">
            Prêt à apprendre ?
          </p>
        </div>
        <Link href="/projects/new">
          <Button size="icon" className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        <StatsCard
          icon={<Flame className="h-5 w-5 text-neuron-500" fill="currentColor" />}
          value={stats.streak}
          label="Streak"
        />
        <StatsCard
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
          value={stats.level}
          label="Niveau"
        />
        <StatsCard
          icon={<Sparkles className="h-5 w-5 text-purple-500" />}
          value={stats.xp}
          label="XP"
        />
      </div>

      {/* Barre de progression niveau */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Niveau {stats.level}</span>
            <span className="text-muted-foreground">
              {stats.xp} / {stats.xpForNext} XP
            </span>
          </div>
          <Progress value={stats.progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Message de bienvenue */}
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">Bienvenue sur Neuron !</h3>
          <p className="text-sm text-muted-foreground mb-4">
            L&apos;app est en cours de développement 🚀<br />
            Crée ton premier projet pour commencer
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

function StatsCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <Card>
      <CardContent className="py-3 px-4 text-center">
        <div className="flex justify-center mb-1">{icon}</div>
        <div className="text-xl font-bold">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}
