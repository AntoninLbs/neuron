// src/app/(app)/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, Trash2, Loader2, Flame, Star, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { OctopusMascot } from '@/components/mascot/octopus'
import { 
  PRESET_CATEGORIES, 
  SCHOOL_LEVELS,
  DIFFICULTY_NAMES,
  getRandomMessage,
  type Project, 
  type PresetCategoryKey,
  type UserProfile,
} from '@/types'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projectStats, setProjectStats] = useState<Record<string, { total: number; due: number }>>({})
  const [mascotMessage, setMascotMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!user) return

      try {
        // Charger le profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Charger les projets
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        setProjects(projectsData || [])

        // Stats par projet
        if (projectsData && projectsData.length > 0) {
          const stats: Record<string, { total: number; due: number }> = {}
          
          for (const project of projectsData) {
            const { count: totalCount } = await supabase
              .from('cards')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)

            const { count: dueCount } = await supabase
              .from('cards')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)
              .lte('next_review', new Date().toISOString())

            stats[project.id] = { total: totalCount || 0, due: dueCount || 0 }
          }

          setProjectStats(stats)
        }

        // Message mascotte
        setMascotMessage(getRandomMessage('welcome'))

      } catch (error) {
        console.error('Erreur chargement:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  const deleteProject = async (projectId: string) => {
    if (!confirm('Supprimer ce projet et toutes ses cartes ?')) return
    await supabase.from('projects').delete().eq('id', projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const userName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'toi'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container max-w-2xl px-4 py-6">
        {/* Header avec stats */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{greeting()}, {userName} 👋</h1>
            <p className="text-muted-foreground text-sm">
              {projects.length === 0 
                ? "Crée ton premier projet !"
                : `${projects.length} projet${projects.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
          
          {/* Stats rapides */}
          <div className="flex gap-3">
            {/* Gems */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <span className="text-lg">💎</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">
                {profile?.total_gems || 0}
              </span>
            </div>
            {/* Streak */}
            {(profile?.current_streak || 0) > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                <span className="font-bold text-orange-700 dark:text-orange-300">
                  {profile?.current_streak}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mascotte */}
        <div className="flex justify-center mb-6">
          <OctopusMascot 
            mood="happy"
            message={mascotMessage}
            color={profile?.mascot_color || '#f97316'}
            accessory={profile?.mascot_accessory}
            size="lg"
          />
        </div>

        {/* Bouton nouveau projet */}
        <Link href="/projects/new">
          <Card className="mb-6 border-dashed border-2 border-orange-300 bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-100/50 dark:hover:bg-orange-950/20 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-center gap-3 py-6">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Nouveau projet</p>
                <p className="text-sm text-muted-foreground">Choisis tes thèmes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Liste des projets */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Map className="h-5 w-5" />
              Mes projets
            </h2>
            
            {projects.map((project) => {
              const stats = projectStats[project.id] || { total: 0, due: 0 }
              const categories = project.categories as string[]
              const schoolLevel = SCHOOL_LEVELS[project.school_level as keyof typeof SCHOOL_LEVELS]
              const difficultyName = DIFFICULTY_NAMES[project.current_difficulty] || 'Moyen'

              return (
                <Card key={project.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Link href={`/learn/${project.id}`}>
                      <div className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold truncate">{project.name}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                {schoolLevel?.icon} {schoolLevel?.name}
                              </span>
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full',
                                project.answer_mode === 'qcm' 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              )}>
                                {project.answer_mode === 'qcm' ? 'QCM' : 'Direct'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {stats.total} carte{stats.total > 1 ? 's' : ''} • {difficultyName}
                              {stats.due > 0 && (
                                <span className="text-orange-500 font-medium"> • {stats.due} à réviser</span>
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              deleteProject(project.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Catégories */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {categories.slice(0, 4).map((cat) => {
                            const preset = PRESET_CATEGORIES[cat as PresetCategoryKey]
                            return (
                              <span
                                key={cat}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs"
                              >
                                {preset?.icon || '📌'} {preset?.name || cat}
                              </span>
                            )
                          })}
                          {categories.length > 4 && (
                            <span className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                              +{categories.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Bouton action */}
                        {stats.due > 0 ? (
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Réviser ({stats.due})
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-muted-foreground">À jour !</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* État vide */}
        {projects.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
            <p className="text-muted-foreground">Crée ton premier projet pour commencer !</p>
          </div>
        )}
      </div>
    </div>
  )
}
