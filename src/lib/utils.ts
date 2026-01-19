// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date en français
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Format date courte
export function formatDateShort(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

// Nombre de jours entre deux dates
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

// Est-ce aujourd'hui ?
export function isToday(date: Date | string): boolean {
  const d = new Date(date)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

// Est-ce hier ?
export function isYesterday(date: Date | string): boolean {
  const d = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  )
}

// Début de journée
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Fin de journée
export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// Calcul du niveau basé sur l'XP
export function calculateLevel(xp: number): { level: number; currentXp: number; xpForNextLevel: number; progress: number } {
  // Formule: chaque niveau nécessite level * 100 XP
  // Niveau 1: 0-100, Niveau 2: 100-300, Niveau 3: 300-600, etc.
  let level = 1
  let totalXpNeeded = 0
  
  while (totalXpNeeded + level * 100 <= xp) {
    totalXpNeeded += level * 100
    level++
  }
  
  const currentXp = xp - totalXpNeeded
  const xpForNextLevel = level * 100
  const progress = (currentXp / xpForNextLevel) * 100
  
  return { level, currentXp, xpForNextLevel, progress }
}

// Pluralisation simple
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular
  return plural || `${singular}s`
}

// Shuffle array (pour mélanger les réponses)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Générer un ID unique
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
