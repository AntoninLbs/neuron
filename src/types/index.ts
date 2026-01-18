// src/types/index.ts
import { User, Project, Theme, Question, Card, UserStats, Badge, Difficulty } from '@prisma/client'

// Étendre le type User de next-auth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Project avec relations
export interface ProjectWithThemes extends Project {
  themes: { theme: Theme }[]
}

export interface ProjectWithStats extends ProjectWithThemes {
  _count: {
    cards: number
  }
  todaysDueCount?: number
  todaysNewCount?: number
}

// Card avec relations
export interface CardWithQuestion extends Card {
  question: Question & {
    theme: Theme
  }
}

// Question générée par IA
export interface GeneratedQuestion {
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
  themeSlug: string
}

// Session quotidienne enrichie
export interface DailySessionData {
  reviewsDue: number
  reviewsDone: number
  newCardsDone: number
  newCardsGoal: number
  isCompleted: boolean
  xpEarned: number
}

// Stats utilisateur enrichies
export interface UserStatsWithLevel extends UserStats {
  level: number
  currentXp: number
  xpForNextLevel: number
  progress: number
}

// Badge avec état de déblocage
export interface BadgeWithStatus extends Badge {
  isUnlocked: boolean
  unlockedAt?: Date
}

// Props communes
export interface PageProps {
  params: { [key: string]: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Réponse API générique
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// État d'une question en cours
export interface QuestionState {
  card: CardWithQuestion
  selectedAnswer: number | null
  isRevealed: boolean
  isCorrect: boolean | null
  startTime: number
}

// Résumé de session
export interface SessionSummary {
  totalAnswered: number
  correctCount: number
  incorrectCount: number
  xpEarned: number
  streakUpdated: boolean
  newStreak: number
  badgesUnlocked: Badge[]
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

// Difficultés avec labels
export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string }> = {
  BEGINNER: { label: 'Débutant', color: 'text-green-500' },
  INTERMEDIATE: { label: 'Intermédiaire', color: 'text-yellow-500' },
  EXPERT: { label: 'Expert', color: 'text-red-500' },
}
