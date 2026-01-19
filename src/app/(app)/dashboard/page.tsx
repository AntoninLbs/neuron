// src/app/(app)/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, Trash2, Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { PRESET_CATEGORIES, type Project, type PresetCategoryKey } from '@/types'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [projectStats, setProjectStats] = useState<Record<string, { total: number; due: number }>>({})

  // Charger le profil et les projets
  useEffect(() => {
    async function loadData() {
      if (!user) return

      try {
        // Charger le profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()

        if (profile?.display_name) {
          setDisplayName(profile.display_name)
        }

        // Charger les projets
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) throw error
        setProjects(projectsData || [])

        // Charger les stats par projet
        if (projectsData && projectsData.length > 0) {
          const stats: Record<string, { total: number; due: number }> = {}
          
          for (const project of projectsData) {
            // Total des cartes
            const { count: totalCount } = await supabase
              .from('cards')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)

            // Cartes à réviser
            const { count: dueCount } = await supabase
              .from('cards')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)
              .lte('next_review', new Date().toISOString())

            stats[project.id] = {
              total: totalCount || 0,
              due: dueCount || 0,
            }
          }

          setProjectStats(stats)
        }
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

    try {
      await supabase.from('projects').delete().eq('id', projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getCategoryDisplay = (cat: string) => {
    const preset = PRESET_CATEGORIES[cat as PresetCategoryKey]
    return {
      icon: preset?.icon || '📌',
      name: preset?.name || cat,
    }
  }

  const userName = displayName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'toi'

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{greeting()}, {userName} 👋</h1>
          <p className="text-muted-foreground">
            {projects.length === 0 
              ? "Crée ton premier projet pour commencer"
              : `Tu as ${projects.length} projet${projects.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Bouton créer projet */}
        <Link href="/projects/new">
          <Card className="mb-6 border-dashed border-2 border-orange-300 bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-100/50 dark:hover:bg-orange-950/20 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-center gap-3 py-8">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Nouveau projet</p>
                <p className="text-sm text-muted-foreground">Choisis tes thèmes et commence à apprendre</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Liste des projets */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Mes projets</h2>
            
            {projects.map((project) => {
              const stats = projectStats[project.id] || { total: 0, due: 0 }
              const categories = project.categories as string[]

              return (
                <Card key={project.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Link href={`/learn/${project.id}`}>
                      <div className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{project.name}</h3>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs',
                                project.answer_mode === 'qcm' 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              )}>
                                {project.answer_mode === 'qcm' ? 'QCM' : 'Direct'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {stats.total} carte{stats.total > 1 ? 's' : ''} 
                              {stats.due > 0 && (
                                <span className="text-orange-500 font-medium"> • {stats.due} à réviser</span>
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 flex-shrink-0"
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
                            const { icon, name } = getCategoryDisplay(cat)
                            return (
                              <span
                                key={cat}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs"
                              >
                                <span>{icon}</span>
                                <span className="truncate max-w-[80px]">{name}</span>
                              </span>
                            )
                          })}
                          {categories.length > 4 && (
                            <span className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                              +{categories.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Bouton réviser */}
                        {stats.due > 0 ? (
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Réviser ({stats.due})
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>À jour ! Reviens demain</span>
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
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
            <p className="text-muted-foreground mb-6">
              Crée ton premier projet pour commencer à apprendre !
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
