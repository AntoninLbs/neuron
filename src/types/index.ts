// src/types/index.ts

// ============================================
// CATÉGORIES
// ============================================

export const PRESET_CATEGORIES = {
  marketing: { name: 'Marketing', icon: '📣', color: '#ec4899' },
  maths: { name: 'Mathématiques', icon: '🔢', color: '#3b82f6' },
  histoire: { name: 'Histoire', icon: '📜', color: '#d97706' },
  geographie: { name: 'Géographie', icon: '🌍', color: '#22c55e' },
  sciences: { name: 'Sciences', icon: '🔬', color: '#8b5cf6' },
  economie: { name: 'Économie', icon: '💼', color: '#10b981' },
  informatique: { name: 'Informatique', icon: '💻', color: '#06b6d4' },
  langues: { name: 'Langues', icon: '🗣️', color: '#f43f5e' },
  philosophie: { name: 'Philosophie', icon: '🤔', color: '#6366f1' },
  droit: { name: 'Droit', icon: '⚖️', color: '#64748b' },
  physique: { name: 'Physique', icon: '⚛️', color: '#f97316' },
  chimie: { name: 'Chimie', icon: '🧪', color: '#84cc16' },
  biologie: { name: 'Biologie', icon: '🧬', color: '#14b8a6' },
  litterature: { name: 'Littérature', icon: '📚', color: '#ca8a04' },
  musique: { name: 'Musique', icon: '🎵', color: '#d946ef' },
  cinema: { name: 'Cinéma', icon: '🎬', color: '#ef4444' },
  sport: { name: 'Sport', icon: '⚽', color: '#16a34a' },
  cuisine: { name: 'Cuisine', icon: '🍳', color: '#fb923c' },
  psychologie: { name: 'Psychologie', icon: '🧠', color: '#a855f7' },
  management: { name: 'Management', icon: '👔', color: '#52525b' },
  art: { name: 'Art', icon: '🎨', color: '#e11d48' },
  medecine: { name: 'Médecine', icon: '🏥', color: '#0ea5e9' },
  astronomie: { name: 'Astronomie', icon: '🌌', color: '#1e3a8a' },
  ecologie: { name: 'Écologie', icon: '🌱', color: '#15803d' },
  finance: { name: 'Finance', icon: '💰', color: '#eab308' },
} as const

export type PresetCategoryKey = keyof typeof PRESET_CATEGORIES

// ============================================
// NIVEAUX SCOLAIRES (par projet)
// ============================================

export const SCHOOL_LEVELS = {
  college: { name: 'Collège', icon: '🎒', description: '6ème - 3ème', order: 1 },
  lycee: { name: 'Lycée', icon: '📚', description: '2nde - 1ère', order: 2 },
  terminale: { name: 'Terminale', icon: '🎓', description: 'Prépa Bac', order: 3 },
  superieur: { name: 'Études sup', icon: '🏛️', description: 'Licence / Master', order: 4 },
  expert: { name: 'Expert', icon: '🔬', description: 'Doctorat / Pro', order: 5 },
} as const

export type SchoolLevel = keyof typeof SCHOOL_LEVELS

// ============================================
// DIFFICULTÉ ADAPTATIVE (1-10)
// ============================================

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export const DIFFICULTY_NAMES: Record<number, string> = {
  1: 'Très facile',
  2: 'Facile',
  3: 'Facile+',
  4: 'Moyen-',
  5: 'Moyen',
  6: 'Moyen+',
  7: 'Difficile-',
  8: 'Difficile',
  9: 'Très difficile',
  10: 'Expert',
}

// ============================================
// MODE DE RÉPONSE
// ============================================

export type AnswerMode = 'qcm' | 'direct'

// ============================================
// PROJET
// ============================================

export interface Project {
  id: string
  user_id: string
  name: string
  categories: string[]
  school_level: SchoolLevel
  current_difficulty: DifficultyLevel
  answer_mode: AnswerMode
  // Stats
  total_sessions: number
  total_correct: number
  total_wrong: number
  consecutive_good_sessions: number
  // Progression map
  current_world: number
  current_level: number
  // Timestamps
  last_session_at: string | null
  created_at: string
  updated_at: string
}

// ============================================
// MONDE / NIVEAU (World Map)
// ============================================

export interface WorldLevel {
  id: string
  project_id: string
  world_number: number
  level_number: number
  name: string
  category: string
  is_boss: boolean
  // Progression
  is_unlocked: boolean
  is_completed: boolean
  stars: 0 | 1 | 2 | 3
  best_score: number
  attempts: number
  gems_reward: number
  created_at: string
}

// ============================================
// CARTE (QUESTION)
// ============================================

export type CardStatus = 'new' | 'learning' | 'review' | 'mastered'

export interface Card {
  id: string
  project_id: string
  level_id: string | null
  question: string
  answer: string
  choices: string[] | null
  correct_index: number | null
  explanation: string
  category: string
  difficulty: number
  // Spaced repetition
  status: CardStatus
  ease_factor: number
  interval: number
  repetitions: number
  next_review: string
  last_reviewed: string | null
  times_correct: number
  times_wrong: number
  created_at: string
}

// ============================================
// PROFIL UTILISATEUR
// ============================================

export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  // Gems
  total_gems: number
  // Streak
  current_streak: number
  best_streak: number
  last_activity_date: string | null
  // Mascotte personnalisation
  mascot_color: string
  mascot_accessory: string | null
  // Achats débloqués
  unlocked_items: string[]
  // Wishlist pour la boutique
  wishlist_colors: string[]
  wishlist_accessories: string[]
  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================
// BOUTIQUE - Réexport depuis shop-items
// ============================================

export { 
  ALL_COLORS, 
  ALL_ACCESSORIES, 
  BOOSTERS, 
  SHOP_PRICES, 
  DAILY_REWARDS,
  getDailyShop,
  type ShopColor,
  type ShopAccessory,
} from './shop-items'

// Ancien SHOP_ITEMS conservé pour compatibilité
export const SHOP_ITEMS = {
  // Couleurs mascotte
  color_blue: { name: 'Poulpe Bleu', type: 'color', price: 100, value: '#3b82f6', icon: '🔵' },
  color_pink: { name: 'Poulpe Rose', type: 'color', price: 100, value: '#ec4899', icon: '🩷' },
  color_green: { name: 'Poulpe Vert', type: 'color', price: 100, value: '#22c55e', icon: '💚' },
  color_purple: { name: 'Poulpe Violet', type: 'color', price: 150, value: '#8b5cf6', icon: '💜' },
  color_gold: { name: 'Poulpe Doré', type: 'color', price: 500, value: '#eab308', icon: '⭐' },
  color_rainbow: { name: 'Poulpe Arc-en-ciel', type: 'color', price: 1000, value: 'rainbow', icon: '🌈' },
  // Accessoires
  acc_glasses: { name: 'Lunettes', type: 'accessory', price: 200, value: 'glasses', icon: '👓' },
  acc_hat: { name: 'Chapeau', type: 'accessory', price: 200, value: 'hat', icon: '🎩' },
  acc_crown: { name: 'Couronne', type: 'accessory', price: 500, value: 'crown', icon: '👑' },
  acc_headphones: { name: 'Casque', type: 'accessory', price: 300, value: 'headphones', icon: '🎧' },
  acc_bowtie: { name: 'Nœud pap', type: 'accessory', price: 150, value: 'bowtie', icon: '🎀' },
} as const

export type ShopItemKey = keyof typeof SHOP_ITEMS

// ============================================
// MASCOTTE - MESSAGES
// ============================================

export type MascotMood = 'idle' | 'happy' | 'excited' | 'thinking' | 'sad' | 'celebrating'

export const MASCOT_MESSAGES = {
  welcome: [
    "Salut ! Prêt à apprendre ? 🐙",
    "Content de te revoir !",
    "C'est parti pour une session !",
  ],
  correct: [
    "Parfait ! 🎉",
    "Tu gères !",
    "Excellent !",
    "Trop fort(e) !",
    "Continue comme ça !",
    "Bravo ! 💪",
  ],
  wrong: [
    "Pas grave, on continue !",
    "Oups ! La prochaine sera la bonne !",
    "On apprend de ses erreurs 💪",
    "T'inquiète, ça arrive !",
  ],
  streak: [
    "🔥 {n} jours d'affilée !",
    "Wow, {n} jours de streak !",
  ],
  // Messages d'adaptation de difficulté
  difficultyUp: [
    "Bien joué ! La prochaine fois, ça sera un peu plus corsé 😏",
    "Tu cartonnés ! Je monte le niveau ! 🚀",
    "Impressionnant ! On passe à la vitesse supérieure !",
  ],
  difficultyDown: [
    "T'inquiète pas, la prochaine fois ça ira mieux ! 💪",
    "Je vais adapter les questions pour toi, on y va tranquille 🐙",
    "Pas de stress ! On reprend plus doucement.",
  ],
  difficultySame: [
    "On continue sur cette lancée ! 👍",
    "Tu progresses bien, on garde le rythme !",
  ],
  levelComplete: [
    "Niveau terminé ! 🎊",
    "Bravo, tu as débloqué la suite !",
  ],
  worldComplete: [
    "INCROYABLE ! Monde terminé ! 🏆",
    "Tu es un champion ! Nouveau monde débloqué ! 🌟",
  ],
  gemsEarned: [
    "+{n} gems ! 💎",
    "Tu as gagné {n} gems !",
  ],
} as const

// Helper pour obtenir un message aléatoire
export function getRandomMessage(category: keyof typeof MASCOT_MESSAGES, replacements?: Record<string, string | number>): string {
  const messages = MASCOT_MESSAGES[category]
  let message: string = messages[Math.floor(Math.random() * messages.length)]
  
  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value))
    })
  }
  
  return message
}

// ============================================
// SYSTÈME ADAPTATIF
// ============================================

export interface AdaptationResult {
  newDifficulty: DifficultyLevel
  message: string
  direction: 'up' | 'down' | 'same'
}

export function calculateAdaptation(
  currentDifficulty: DifficultyLevel,
  scorePercent: number,
  consecutiveGoodSessions: number
): AdaptationResult {
  // Score > 80% sur plusieurs sessions = monter de 2
  if (scorePercent >= 80 && consecutiveGoodSessions >= 2) {
    return {
      newDifficulty: Math.min(10, currentDifficulty + 2) as DifficultyLevel,
      message: getRandomMessage('difficultyUp'),
      direction: 'up',
    }
  }
  
  // Score > 70% = monter de 1
  if (scorePercent >= 70) {
    return {
      newDifficulty: Math.min(10, currentDifficulty + 1) as DifficultyLevel,
      message: getRandomMessage('difficultyUp'),
      direction: 'up',
    }
  }
  
  // Score < 40% = baisser de 1
  if (scorePercent < 40) {
    return {
      newDifficulty: Math.max(1, currentDifficulty - 1) as DifficultyLevel,
      message: getRandomMessage('difficultyDown'),
      direction: 'down',
    }
  }
  
  // Entre 40-70% = garder le même
  return {
    newDifficulty: currentDifficulty,
    message: getRandomMessage('difficultySame'),
    direction: 'same',
  }
}

// ============================================
// CALCUL DES ÉTOILES
// ============================================

export function calculateStars(scorePercent: number): 0 | 1 | 2 | 3 {
  if (scorePercent >= 90) return 3
  if (scorePercent >= 70) return 2
  if (scorePercent >= 50) return 1
  return 0
}

// ============================================
// CALCUL DES GEMS
// ============================================

export function calculateGemsReward(stars: number, isFirstTime: boolean, isBoss: boolean): number {
  let gems = stars * 10 // 10, 20 ou 30 gems selon les étoiles
  if (isFirstTime) gems *= 2 // Double la première fois
  if (isBoss) gems *= 2 // Double pour les boss
  return gems
}

// ============================================
// CORRECTION ORTHOGRAPHIQUE
// ============================================

export const SPELLING_CORRECTIONS: Record<string, string> = {
  'mathematique': 'mathématiques',
  'mathematiques': 'mathématiques',
  'geographie': 'géographie',
  'economie': 'économie',
  'litterature': 'littérature',
  'filosophie': 'philosophie',
  'psycologie': 'psychologie',
  'phisique': 'physique',
  'managment': 'management',
  'marketting': 'marketing',
  'informatque': 'informatique',
}

export function suggestCorrection(input: string): string | null {
  const normalized = input.toLowerCase().trim()
  return SPELLING_CORRECTIONS[normalized] || null
}
