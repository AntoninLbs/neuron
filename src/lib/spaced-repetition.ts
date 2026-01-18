// src/lib/spaced-repetition.ts

/**
 * Système de répétition espacée pour Neuron
 * 
 * Intervalles confirmés:
 * - Correct #1: +1 jour (J1)
 * - Correct #2: +1 jour (J2)  
 * - Correct #3: +3 jours (J5)
 * - Correct #4: +5 jours (J10)
 * - Correct #5: +8 jours (J18)
 * - Correct #6: +13 jours (J31)
 * - Correct #7: +21 jours (J52)
 * - Correct #8+: +34 jours (cap)
 * 
 * Incorrect: Reset → J+1, repart du début
 */

// Intervalles en jours [stageIndex]
export const INTERVALS = [1, 1, 3, 5, 8, 13, 21, 34]

// Nombre de stages pour considérer une carte "maîtrisée"
export const MASTERY_STAGE = 6

// XP rewards
export const XP_CORRECT = 10
export const XP_INCORRECT = 2
export const XP_REVIEW_BONUS = 5
export const XP_DAILY_GOAL = 50
export const XP_STREAK_BONUS = 25

export interface CardSchedule {
  stageIndex: number
  dueDate: Date
  isMastered: boolean
}

/**
 * Calcule le prochain schedule d'une carte après une réponse
 */
export function calculateNextSchedule(
  currentStageIndex: number,
  isCorrect: boolean,
  currentDate: Date = new Date()
): CardSchedule {
  const today = new Date(currentDate)
  today.setHours(0, 0, 0, 0)
  
  if (isCorrect) {
    // Avancer d'un stage (avec cap)
    const newStageIndex = Math.min(currentStageIndex + 1, INTERVALS.length - 1)
    const daysToAdd = INTERVALS[newStageIndex]
    
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + daysToAdd)
    
    return {
      stageIndex: newStageIndex,
      dueDate,
      isMastered: newStageIndex >= MASTERY_STAGE,
    }
  } else {
    // Reset au début, revient demain
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + 1)
    
    return {
      stageIndex: 0,
      dueDate,
      isMastered: false,
    }
  }
}

/**
 * Vérifie si une carte est due pour révision
 */
export function isDue(dueDate: Date | string, currentDate: Date = new Date()): boolean {
  const due = new Date(dueDate)
  const today = new Date(currentDate)
  
  // Mettre à minuit pour comparer les jours
  due.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  return due <= today
}

/**
 * Calcule le nombre de jours de retard
 */
export function daysOverdue(dueDate: Date | string, currentDate: Date = new Date()): number {
  const due = new Date(dueDate)
  const today = new Date(currentDate)
  
  due.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

/**
 * Retourne le label du prochain intervalle
 */
export function getNextIntervalLabel(stageIndex: number, isCorrect: boolean): string {
  if (!isCorrect) {
    return 'Demain'
  }
  
  const nextStage = Math.min(stageIndex + 1, INTERVALS.length - 1)
  const days = INTERVALS[nextStage]
  
  if (days === 1) return 'Demain'
  if (days < 7) return `Dans ${days} jours`
  if (days === 7) return 'Dans 1 semaine'
  if (days < 30) return `Dans ${Math.round(days / 7)} semaines`
  return `Dans ${Math.round(days / 30)} mois`
}

/**
 * Retourne une description du stage actuel
 */
export function getStageDescription(stageIndex: number): string {
  const stages = [
    'Nouvelle',
    'Apprentissage',
    'Révision',
    'Consolidation',
    'Mémorisation',
    'Acquisition',
    'Maîtrise',
    'Expert',
  ]
  return stages[Math.min(stageIndex, stages.length - 1)]
}

/**
 * Calcule l'XP gagné pour une réponse
 */
export function calculateXpGained(isCorrect: boolean, isReview: boolean): number {
  let xp = isCorrect ? XP_CORRECT : XP_INCORRECT
  if (isReview && isCorrect) {
    xp += XP_REVIEW_BONUS
  }
  return xp
}

/**
 * Vérifie si le streak doit être mis à jour
 */
export function shouldUpdateStreak(
  lastActivityAt: Date | null,
  currentDate: Date = new Date()
): { shouldIncrement: boolean; shouldReset: boolean } {
  if (!lastActivityAt) {
    return { shouldIncrement: true, shouldReset: false }
  }
  
  const last = new Date(lastActivityAt)
  const today = new Date(currentDate)
  
  last.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = today.getTime() - last.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // Même jour, pas de changement
    return { shouldIncrement: false, shouldReset: false }
  } else if (diffDays === 1) {
    // Jour suivant, incrémenter
    return { shouldIncrement: true, shouldReset: false }
  } else {
    // Plus d'un jour, reset
    return { shouldIncrement: false, shouldReset: true }
  }
}

/**
 * Exemple de progression sur 30 jours avec réponses parfaites
 */
export function exampleProgression(): { day: number; stage: number; interval: string }[] {
  const progression: { day: number; stage: number; interval: string }[] = []
  let currentDay = 0
  let stage = 0
  
  // Simule 8 réponses correctes
  for (let i = 0; i < 8; i++) {
    const schedule = calculateNextSchedule(stage, true, new Date(2024, 0, currentDay))
    currentDay += INTERVALS[schedule.stageIndex]
    stage = schedule.stageIndex
    
    progression.push({
      day: currentDay,
      stage,
      interval: getNextIntervalLabel(stage - 1, true),
    })
  }
  
  return progression
}
