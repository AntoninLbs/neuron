// src/types/index.ts

// Question générée par IA
export interface GeneratedQuestion {
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
  themeSlug: string
}

// Catégories de thèmes
export const THEME_CATEGORIES = {
  sciences: { name: 'Sciences', icon: '🔬' },
  histoire: { name: 'Histoire', icon: '📜' },
  geographie: { name: 'Géographie', icon: '🌍' },
  arts: { name: 'Arts & Culture', icon: '🎨' },
  sport: { name: 'Sport', icon: '⚽' },
  economie: { name: 'Économie & Politique', icon: '💼' },
  tech: { name: 'Tech & Innovation', icon: '💻' },
  culture: { name: 'Culture générale', icon: '🧠' },
} as const

export type ThemeCategory = keyof typeof THEME_CATEGORIES

// Type Difficulty (sans Prisma)
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'

// Difficultés avec labels
export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string }> = {
  BEGINNER: { label: 'Débutant', color: 'text-green-500' },
  INTERMEDIATE: { label: 'Intermédiaire', color: 'text-yellow-500' },
  EXPERT: { label: 'Expert', color: 'text-red-500' },
}
