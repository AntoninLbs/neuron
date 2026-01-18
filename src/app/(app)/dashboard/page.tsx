// src/app/(app)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { calculateLevel } from '@/lib/utils'
import { isDue } from '@/lib/spaced-repetition'
import { Plus, Flame, Trophy, BookOpen, ChevronRight, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const userId = session.user.id

  // Récupérer les données utilisateur
  const [userStats, projects] = await Promise.all([
    prisma.userStats.findUnique({
      where: { userId },
    }),
    prisma.project.findMany({
      where: { userId, isActive: true },
      include: {
        themes: { include: { theme: true } },
        cards: {
          where: {
            dueDate: { lte: new Date() },
          },
          select: { id: true },
        },
        _count: { select: { cards: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  // Calculer le niveau
  const levelInfo = calculateLevel(userStats?.totalXp || 0)

  // Calculer les stats globales du jour
  const totalDueToday = projects.reduce((sum, p) => sum + p.cards.length, 0)

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Header avec salutation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour{session.user.name ? `, ${session.user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-muted-foreground">
            {totalDueToday > 0
              ? `${totalDueToday} révision${totalDueToday > 1 ? 's' : ''} t'attend${totalDueToday > 1 ? 'ent' : ''}`
              : 'Tout est à jour !'}
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
          value={userStats?.currentStreak || 0}
          label="Streak"
        />
        <StatsCard
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
          value={levelInfo.level}
          label="Niveau"
        />
        <StatsCard
          icon={<Sparkles className="h-5 w-5 text-purple-500" />}
          value={userStats?.totalXp || 0}
          label="XP"
        />
      </div>

      {/* Barre de progression niveau */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Niveau {levelInfo.level}</span>
            <span className="text-muted-foreground">
              {levelInfo.currentXp} / {levelInfo.xpForNextLevel} XP
            </span>
          </div>
          <Progress value={levelInfo.progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Liste des projets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mes projets</h2>
          <Link href="/projects" className="text-sm text-neuron-500 hover:underline">
            Voir tout
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">Aucun projet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crée ton premier projet pour commencer à apprendre
              </p>
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un projet
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                dueCount={project.cards.length}
                totalCards={project._count.cards}
              />
            ))}
          </div>
        )}
      </section>

      {/* Action rapide si révisions dues */}
      {totalDueToday > 0 && projects.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 md:static md:mt-6">
          <Link href={`/learn/${projects[0].id}`}>
            <Button size="xl" className="w-full shadow-lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Commencer les révisions
            </Button>
          </Link>
        </div>
      )}
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

function ProjectCard({
  project,
  dueCount,
  totalCards,
}: {
  project: {
    id: string
    name: string
    dailyGoal: number
    themes: { theme: { name: string; icon: string | null } }[]
  }
  dueCount: number
  totalCards: number
}) {
  const themeIcons = project.themes.slice(0, 3).map((t) => t.theme.icon).filter(Boolean)
  
  return (
    <Link href={`/learn/${project.id}`}>
      <Card className="card-hover">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {themeIcons.length > 0 && (
                  <span className="text-lg">{themeIcons.join('')}</span>
                )}
                <h3 className="font-semibold truncate">{project.name}</h3>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{totalCards} cartes</span>
                {dueCount > 0 && (
                  <span className="text-neuron-500 font-medium">
                    {dueCount} à réviser
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
