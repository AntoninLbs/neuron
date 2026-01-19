// src/app/(app)/learn/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Trophy, Target, Plus, BookOpen, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { MascotWithBubble } from '@/components/mascot/mascot-bubble'
import { PRESET_CATEGORIES, SCHOOL_LEVELS, type Project, type SchoolLevel } from '@/types'
import { cn } from '@/lib/utils'

interface Profile {
  mascot_color: string
  mascot_accessory: string | null
}

export default function LearnPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return

      const [projectsRes, profileRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('mascot_color, mascot_accessory')
          .eq('id', user.id)
          .single()
      ])

      if (projectsRes.data) setProjects(projectsRes.data)
      if (profileRes.data) setProfile(profileRes.data)
      setIsLoading(false)
    }

    loadData()
  }, [user])

  const getProjectProgress = (project: Project) => {
    const totalQuestions = project.total_correct + project.total_wrong
    if (totalQuestions === 0) return 0
    return Math.round((project.total_correct / totalQuestions) * 100)
  }

  const getProjectLevel = (project: Project) => {
    return (project.current_world - 1) * 5 + project.current_level
  }

  const getMascotMessage = () => {
    if (projects.length === 0) {
      return "Crée ton premier projet pour commencer à apprendre ! 📚"
    }
    const lastProject = projects[0]
    if (lastProject.total_sessions === 0) {
      return `Prêt à commencer "${lastProject.name}" ? Let's go ! 🚀`
    }
    return `Continue "${lastProject.name}" ! Tu es au niveau ${getProjectLevel(lastProject)} 💪`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container max-w-lg px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold flex-1">Apprendre</h1>
          <Link href="/projects/new">
            <Button size="sm" className="h-8 gap-1 bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4" />
              Projet
            </Button>
          </Link>
        </div>

        {/* Mascotte avec message */}
        <div className="mb-4">
          <MascotWithBubble
            message={getMascotMessage()}
            mood={projects.length === 0 ? 'thinking' : 'happy'}
            color={profile?.mascot_color || '#f97316'}
            accessory={profile?.mascot_accessory}
            size="sm"
          />
        </div>

        {/* Liste des projets */}
        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">
                Pas encore de projet
              </p>
              <Link href="/projects/new">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un projet
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const progress = getProjectProgress(project)
              const level = getProjectLevel(project)
              const schoolLevel = SCHOOL_LEVELS[project.school_level as SchoolLevel]
              const mainCategory = project.categories[0]
              const categoryData = PRESET_CATEGORIES[mainCategory as keyof typeof PRESET_CATEGORIES]

              return (
                <Card 
                  key={project.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/learn/${project.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Bande de couleur à gauche */}
                      <div 
                        className="w-2 flex-shrink-0"
                        style={{ backgroundColor: categoryData?.color || '#f97316' }}
                      />
                      
                      <div className="flex-1 p-3">
                        {/* Titre et catégorie */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{categoryData?.icon} {categoryData?.name}</span>
                              <span>•</span>
                              <span>{schoolLevel?.icon} {schoolLevel?.name}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full bg-orange-500 hover:bg-orange-600 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/learn/${project.id}`)
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            <span>Niveau {level}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span>{project.total_sessions} sessions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            <span>{progress}%</span>
                          </div>
                        </div>

                        {/* Barre de progression */}
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Conseil du jour */}
        {projects.length > 0 && (
          <Card className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Conseil :</strong> Révise 10 minutes chaque jour plutôt qu'1h une fois par semaine !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

