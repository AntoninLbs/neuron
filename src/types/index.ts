// src/types/index.ts

// Catégories prédéfinies
export const PRESET_CATEGORIES = {
  marketing: { name: 'Marketing', icon: '📣' },
  maths: { name: 'Mathématiques', icon: '🔢' },
  histoire: { name: 'Histoire', icon: '📜' },
  geographie: { name: 'Géographie', icon: '🌍' },
  sciences: { name: 'Sciences', icon: '🔬' },
  economie: { name: 'Économie', icon: '💼' },
  informatique: { name: 'Informatique', icon: '💻' },
  langues: { name: 'Langues', icon: '🗣️' },
  philosophie: { name: 'Philosophie', icon: '🤔' },
  droit: { name: 'Droit', icon: '⚖️' },
  physique: { name: 'Physique', icon: '⚛️' },
  chimie: { name: 'Chimie', icon: '🧪' },
  biologie: { name: 'Biologie', icon: '🧬' },
  litterature: { name: 'Littérature', icon: '📚' },
  musique: { name: 'Musique', icon: '🎵' },
  cinema: { name: 'Cinéma', icon: '🎬' },
  sport: { name: 'Sport', icon: '⚽' },
  cuisine: { name: 'Cuisine', icon: '🍳' },
  psychologie: { name: 'Psychologie', icon: '🧠' },
  management: { name: 'Management', icon: '👔' },
  art: { name: 'Art', icon: '🎨' },
  architecture: { name: 'Architecture', icon: '🏛️' },
  medecine: { name: 'Médecine', icon: '🏥' },
  astronomie: { name: 'Astronomie', icon: '🌌' },
  ecologie: { name: 'Écologie', icon: '🌱' },
  politique: { name: 'Politique', icon: '🏛️' },
  sociologie: { name: 'Sociologie', icon: '👥' },
  communication: { name: 'Communication', icon: '📢' },
  finance: { name: 'Finance', icon: '💰' },
  comptabilite: { name: 'Comptabilité', icon: '📊' },
} as const

export type PresetCategoryKey = keyof typeof PRESET_CATEGORIES

// Catégorie (prédéfinie ou personnalisée)
export interface Category {
  id: string
  name: string
  icon: string
  isCustom: boolean
}

// Mode de réponse
export type AnswerMode = 'qcm' | 'direct'

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
  categories: string[] // Noms des catégories (prédéfinies ou custom)
  difficulty: Difficulty
  answer_mode: AnswerMode
  daily_limit: number // Par défaut 10
  created_at: string
  updated_at: string
}

// Statut de la carte
export type CardStatus = 'new' | 'learning' | 'review' | 'mastered'

// Carte (question)
export interface Card {
  id: string
  project_id: string
  question: string
  answer: string // Réponse correcte (texte)
  choices: string[] | null // Choix QCM (null si mode direct)
  correct_index: number | null // Index de la bonne réponse (null si mode direct)
  explanation: string
  category: string
  // Spaced repetition
  status: CardStatus
  ease_factor: number
  interval: number // En jours
  repetitions: number
  next_review: string
  last_reviewed: string | null
  // Stats
  times_correct: number
  times_wrong: number
  created_at: string
}

// Session d'apprentissage
export interface LearningSession {
  phase: 'discovery' | 'retry' | 'review' | 'complete'
  cards: Card[]
  currentIndex: number
  wrongCards: Card[] // Cartes ratées à refaire
  score: { correct: number; total: number }
}

// Question générée par OpenAI
export interface GeneratedQuestion {
  question: string
  answer: string
  choices?: string[]
  correctIndex?: number
  explanation: string
  category: string
}

// Profil utilisateur
export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Corrections orthographiques courantes
export const SPELLING_CORRECTIONS: Record<string, string> = {
  'mathematique': 'mathématiques',
  'mathematiques': 'mathématiques',
  'geographie': 'géographie',
  'economie': 'économie',
  'litterature': 'littérature',
  'litterrature': 'littérature',
  'litérature': 'littérature',
  'filosophie': 'philosophie',
  'phylosophie': 'philosophie',
  'psycologie': 'psychologie',
  'psychlogie': 'psychologie',
  'comunicaiton': 'communication',
  'comunicaton': 'communication',
  'comptabilite': 'comptabilité',
  'comptabilté': 'comptabilité',
  'architechture': 'architecture',
  'astrologie': 'astronomie', // Suggestion
  'ecologie': 'écologie',
  'biologie': 'biologie',
  'chimie': 'chimie',
  'phisique': 'physique',
  'phyisque': 'physique',
  'managment': 'management',
  'managemnt': 'management',
  'marketting': 'marketing',
  'marketin': 'marketing',
  'informatque': 'informatique',
  'infomatique': 'informatique',
  'histoir': 'histoire',
  'histiore': 'histoire',
  'medicin': 'médecine',
  'medcine': 'médecine',
  'medecin': 'médecine',
  'sociologi': 'sociologie',
  'politque': 'politique',
  'politiqe': 'politique',
  'finace': 'finance',
  'finnance': 'finance',
}

// Fonction pour suggérer une correction
export function suggestCorrection(input: string): string | null {
  const normalized = input.toLowerCase().trim()
  
  // Vérifier dans les corrections directes
  if (SPELLING_CORRECTIONS[normalized]) {
    return SPELLING_CORRECTIONS[normalized]
  }
  
  // Vérifier si c'est déjà une catégorie valide
  const presetNames = Object.values(PRESET_CATEGORIES).map(c => c.name.toLowerCase())
  if (presetNames.includes(normalized)) {
    return null // Pas de correction nécessaire
  }
  
  // Recherche approximative (distance de Levenshtein simplifiée)
  for (const [key, cat] of Object.entries(PRESET_CATEGORIES)) {
    const catName = cat.name.toLowerCase()
    if (catName.includes(normalized) || normalized.includes(catName.slice(0, 4))) {
      return cat.name
    }
  }
  
  return null
}
