// src/app/(app)/stats/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Flame, Target, BookOpen, Trophy, TrendingUp } from 'lucide-react'

export default function StatsPage() {
  // Stats par défaut pour le MVP
  const stats = {
    xp: 0,
    level: 1,
    progress: 0,
    xpForNext: 100,
    streak: 0,
    longestStreak: 0,
    accuracy: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    projects: 0,
    totalCards: 0,
  }

  // Données du graphique (7 derniers jours)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      count: 0,
      isToday: i === 6,
    }
  })

  return (
    <div className="container max-w-lg px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">Tes performances d&apos;apprentissage</p>
      </div>

      {/* XP et Niveau */}
      <Card className="bg-gradient-to-br from-neuron-500 to-neuron-600 text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Total XP</p>
              <p className="text-3xl font-bold">{stats.xp.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Niveau</p>
              <p className="text-3xl font-bold">{stats.level}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prochain niveau</span>
              <span>{stats.xp} / {stats.xpForNext}</span>
            </div>
            <Progress value={stats.progress} className="h-2 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          title="Streak"
          value={stats.streak}
          subtitle={`Record: ${stats.longestStreak} jours`}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-green-500" />}
          title="Précision"
          value={`${stats.accuracy}%`}
          subtitle={`${stats.totalCorrect} correctes`}
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-blue-500" />}
          title="Questions"
          value={stats.totalAnswered}
          subtitle={`${stats.totalCards} cartes actives`}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-purple-500" />}
          title="Projets"
          value={stats.projects}
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
            {last7Days.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-muted-foreground">{item.count}</div>
                <div 
                  className="w-full rounded-t-md bg-muted relative overflow-hidden"
                  style={{ height: '80px' }}
                >
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-md transition-all ${
                      item.isToday ? 'bg-neuron-500' : 'bg-neuron-300 dark:bg-neuron-700'
                    }`}
                    style={{ height: '5%' }}
                  />
                </div>
                <div className={`text-xs ${item.isToday ? 'font-bold text-neuron-500' : 'text-muted-foreground'}`}>
                  {item.day}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Commence à apprendre pour voir ton activité ici 📊
          </p>
        </CardContent>
      </Card>
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
