// src/app/(app)/projects/new/actions.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Difficulty } from '@prisma/client'

interface CreateProjectInput {
  name: string
  themeSlugs: string[]
  difficulty: Difficulty
  dailyGoal: number
}

export async function createProject(input: CreateProjectInput) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: 'Non authentifié' }
  }

  const { name, themeSlugs, difficulty, dailyGoal } = input

  // Validation
  if (!name || name.length < 2) {
    return { success: false, error: 'Nom trop court' }
  }
  if (themeSlugs.length === 0) {
    return { success: false, error: 'Sélectionne au moins un thème' }
  }

  try {
    // Récupérer les thèmes
    const themes = await prisma.theme.findMany({
      where: { slug: { in: themeSlugs } },
      select: { id: true },
    })

    if (themes.length === 0) {
      return { success: false, error: 'Thèmes invalides' }
    }

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name,
        difficulty,
        dailyGoal: Math.min(Math.max(dailyGoal, 1), 20),
        themes: {
          create: themes.map(theme => ({
            themeId: theme.id,
          })),
        },
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/projects')

    return { success: true, projectId: project.id }
  } catch (error) {
    console.error('Error creating project:', error)
    return { success: false, error: 'Erreur lors de la création' }
  }
}
