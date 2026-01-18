// src/app/(app)/learn/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, BookOpen, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Apprendre',
}

export default async function LearnPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id, isActive: true },
    include: {
      themes: { include: { theme: true } },
      cards: {
        where: { dueDate: { lte: new Date() } },
        select: { id: true },
      },
      _count: { select: { cards: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

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

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Aucun projet</h3>
            <p className="text-sm text-muted-foreground mb-4">
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
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const dueCount = project.cards.length
            const themeIcons = project.themes.slice(0, 3).map(t => t.theme.icon).filter(Boolean)
            
            return (
              <Link key={project.id} href={`/learn/${project.id}`}>
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
                          <span>{project._count.cards} cartes</span>
                          {dueCount > 0 ? (
                            <span className="text-neuron-500 font-medium">
                              {dueCount} à réviser
                            </span>
                          ) : (
                            <span className="text-green-500">À jour ✓</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
