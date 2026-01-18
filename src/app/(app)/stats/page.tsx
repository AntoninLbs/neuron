// src/app/(app)/stats/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { calculateLevel } from '@/lib/utils'
import { Flame, Target, BookOpen, Trophy, TrendingUp, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Statistiques',
}

export default async function StatsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const [userStats, projects, recentReviews] = await Promise.all([
    prisma.userStats.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id, isActive: true },
      include: {
        _count: { select: { cards: true } },
      },
    }),
    prisma.review.findMany({
      where: {
        card: {
          project: { userId: session.user.id },
        },
      },
      orderBy: { answeredAt: 'desc' },
      take: 100,
    }),
  ])

  const levelInfo = calculateLevel(userStats?.totalXp || 0)
  const accuracy = userStats && userStats.totalAnswered > 0
    ? Math.round((userStats.totalCorrect / userStats.totalAnswered) * 100)
    : 0

  const totalCards = projects.reduce((sum, p) => sum + p._count.cards, 0)
  
  // Calculer les stats des 7 derniers jours
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    return date
  }).reverse()

  const reviewsByDay = last7Days.map(day => {
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    
    return recentReviews.filter(r => {
      const reviewDate = new Date(r.answeredAt)
      return reviewDate >= day && reviewDate < nextDay
    }).length
  })

  const maxReviews = Math.max(...reviewsByDay, 1)

  return (
    <div className="container max-w-lg px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">Tes performances d'apprentissage</p>
      </div>

      {/* XP et Niveau */}
      <Card className="bg-gradient-to-br from-neuron-500 to-neuron-600 text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Total XP</p>
              <p className="text-3xl font-bold">{userStats?.totalXp?.toLocaleString() || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Niveau</p>
              <p className="text-3xl font-bold">{levelInfo.level}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prochain niveau</span>
              <span>{levelInfo.currentXp} / {levelInfo.xpForNextLevel}</span>
            </div>
            <Progress 
              value={levelInfo.progress} 
              className="h-2 bg-white/20"
              indicatorClassName="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          title="Streak"
          value={userStats?.currentStreak || 0}
          subtitle={`Record: ${userStats?.longestStreak || 0} jours`}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-green-500" />}
          title="Précision"
          value={`${accuracy}%`}
          subtitle={`${userStats?.totalCorrect || 0} correctes`}
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-blue-500" />}
          title="Questions"
          value={userStats?.totalAnswered || 0}
          subtitle={`${totalCards} cartes actives`}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-purple-500" />}
          title="Projets"
          value={projects.length}
          subtitle="en cours"
        />
      </div>

      {/* Graphique des 7 derniers jours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {reviewsByDay.map((count, i) => {
              const height = (count / maxReviews) * 100
              const day = last7Days[i]
              const dayName = day.toLocaleDateString('fr-FR', { weekday: 'short' })
              const isToday = i === 6
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-muted-foreground">{count}</div>
                  <div 
                    className="w-full rounded-t-md bg-muted relative overflow-hidden"
                    style={{ height: '80px' }}
                  >
                    <div 
                      className={`absolute bottom-0 w-full rounded-t-md transition-all ${
                        isToday ? 'bg-neuron-500' : 'bg-neuron-300 dark:bg-neuron-700'
                      }`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                  <div className={`text-xs ${isToday ? 'font-bold text-neuron-500' : 'text-muted-foreground'}`}>
                    {dayName}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Projets */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progression par projet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map(project => (
              <div key={project.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-muted-foreground">
                    {project.masteredCards} / {project._count.cards} maîtrisées
                  </span>
                </div>
                <Progress 
                  value={project._count.cards > 0 
                    ? (project.masteredCards / project._count.cards) * 100 
                    : 0
                  } 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </CardContent>
    </Card>
  )
}
