// src/app/(app)/profile/page.tsx
import { auth, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { calculateLevel, formatDate } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import { LogOut, User, Flame, Trophy, Target, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Profil',
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const [userStats, projectsCount, badgesCount] = await Promise.all([
    prisma.userStats.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.project.count({
      where: { userId: session.user.id, isActive: true },
    }),
    prisma.userBadge.count({
      where: { userId: session.user.id },
    }),
  ])

  const levelInfo = calculateLevel(userStats?.totalXp || 0)
  const accuracy = userStats && userStats.totalAnswered > 0
    ? Math.round((userStats.totalCorrect / userStats.totalAnswered) * 100)
    : 0

  return (
    <div className="container max-w-lg px-4 py-6 space-y-6">
      {/* Header profil */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-neuron-400 to-neuron-600">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-white" />
          )}
        </div>
        <h1 className="text-xl font-bold">{session.user.name || 'Utilisateur'}</h1>
        <p className="text-sm text-muted-foreground">{session.user.email}</p>
      </div>

      {/* Niveau */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Niveau {levelInfo.level}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {levelInfo.currentXp} / {levelInfo.xpForNextLevel} XP
            </span>
          </div>
          <Progress value={levelInfo.progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="h-5 w-5 text-neuron-500" fill="currentColor" />}
          value={userStats?.currentStreak || 0}
          label="Streak actuel"
          subvalue={`Record: ${userStats?.longestStreak || 0}`}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-green-500" />}
          value={`${accuracy}%`}
          label="Précision"
          subvalue={`${userStats?.totalCorrect || 0} / ${userStats?.totalAnswered || 0}`}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-purple-500" />}
          value={badgesCount}
          label="Badges"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          value={projectsCount}
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
      <form
        action={async () => {
          'use server'
          await signOut({ redirectTo: '/' })
        }}
      >
        <Button variant="outline" className="w-full" type="submit">
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </Button>
      </form>

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
