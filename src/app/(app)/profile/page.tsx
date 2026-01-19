// src/app/(app)/profile/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from './theme-toggle'
import { LogOut, User, Flame, Trophy, Target, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  // Stats par défaut pour le MVP
  const stats = {
    level: 1,
    xp: 0,
    xpForNext: 100,
    progress: 0,
    streak: 0,
    longestStreak: 0,
    accuracy: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    badges: 0,
    projects: 0,
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
  const userImage = user?.user_metadata?.avatar_url

  return (
    <div className="container max-w-lg px-4 py-6 space-y-6">
      {/* Header profil */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-neuron-400 to-neuron-600 overflow-hidden">
          {userImage ? (
            <img
              src={userImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-white" />
          )}
        </div>
        <h1 className="text-xl font-bold">{userName}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Niveau */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Niveau {stats.level}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {stats.xp} / {stats.xpForNext} XP
            </span>
          </div>
          <Progress value={stats.progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="h-5 w-5 text-neuron-500" fill="currentColor" />}
          value={stats.streak}
          label="Streak actuel"
          subvalue={`Record: ${stats.longestStreak}`}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-green-500" />}
          value={`${stats.accuracy}%`}
          label="Précision"
          subvalue={`${stats.totalCorrect} / ${stats.totalAnswered}`}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-purple-500" />}
          value={stats.badges}
          label="Badges"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          value={stats.projects}
          label="Projets"
        />
      </div>

      {/* Paramètres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thème</p>
              <p className="text-sm text-muted-foreground">Clair, sombre ou système</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Déconnexion */}
      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Se déconnecter
      </Button>

      {/* Info compte */}
      <p className="text-center text-xs text-muted-foreground">
        Merci d&apos;utiliser Neuron !
      </p>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  subvalue,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  subvalue?: string
}) {
  return (
    <Card>
      <CardContent className="py-4 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {subvalue && (
          <div className="text-xs text-muted-foreground mt-1">{subvalue}</div>
        )}
      </CardContent>
    </Card>
  )
}
