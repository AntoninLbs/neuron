// src/types/index.ts

// Catégories disponibles pour les projets
export const CATEGORIES = {
  marketing: { name: 'Marketing', icon: '📣', color: 'bg-pink-500' },
  maths: { name: 'Mathématiques', icon: '🔢', color: 'bg-blue-500' },
  histoire: { name: 'Histoire', icon: '📜', color: 'bg-amber-600' },
  geographie: { name: 'Géographie', icon: '🌍', color: 'bg-green-500' },
  sciences: { name: 'Sciences', icon: '🔬', color: 'bg-purple-500' },
  economie: { name: 'Économie', icon: '💼', color: 'bg-emerald-500' },
  informatique: { name: 'Informatique', icon: '💻', color: 'bg-cyan-500' },
  langues: { name: 'Langues', icon: '🗣️', color: 'bg-rose-500' },
  philosophie: { name: 'Philosophie', icon: '🤔', color: 'bg-indigo-500' },
  droit: { name: 'Droit', icon: '⚖️', color: 'bg-slate-500' },
  physique: { name: 'Physique', icon: '⚛️', color: 'bg-orange-500' },
  chimie: { name: 'Chimie', icon: '🧪', color: 'bg-lime-500' },
  biologie: { name: 'Biologie', icon: '🧬', color: 'bg-teal-500' },
  litterature: { name: 'Littérature', icon: '📚', color: 'bg-yellow-600' },
  musique: { name: 'Musique', icon: '🎵', color: 'bg-fuchsia-500' },
  cinema: { name: 'Cinéma', icon: '🎬', color: 'bg-red-500' },
  sport: { name: 'Sport', icon: '⚽', color: 'bg-green-600' },
  cuisine: { name: 'Cuisine', icon: '🍳', color: 'bg-orange-400' },
  psychologie: { name: 'Psychologie', icon: '🧠', color: 'bg-violet-500' },
  management: { name: 'Management', icon: '👔', color: 'bg-gray-600' },
} as const

export type CategoryKey = keyof typeof CATEGORIES

// Difficulté
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; description: string }[] = [
  { value: 'BEGINNER', label: 'Débutant', description: 'Questions de base pour commencer' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire', description: 'Questions plus approfondies' },
  { value: 'EXPERT', label: 'Expert', description: 'Questions avancées et détaillées' },
]

// Projet
export interface Project {
  id: string
  user_id: string
  name: string
  categories: CategoryKey[]
  difficulty: Difficulty
  created_at: string
  updated_at: string
}

// Carte (question)
export interface Card {
  id: string
  project_id: string
  question: string
  choices: string[]
  correct_index: number
  explanation: string
  category: CategoryKey
  // Spaced repetition
  ease_factor: number
  interval: number
  repetitions: number
  next_review: string
  created_at: string
}

// Question générée par OpenAI (avant sauvegarde)
export interface GeneratedQuestion {
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
  category: CategoryKey
}

// Stats utilisateur
export interface UserStats {
  total_reviews: number
  correct_answers: number
  streak_days: number
  last_review_date: string | null
}

// Profil utilisateur
export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
