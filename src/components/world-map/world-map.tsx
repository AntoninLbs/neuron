// src/components/world-map/world-map.tsx
'use client'

import { useState } from 'react'
import { Lock, Star, Crown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorldLevel } from '@/types'
import { PRESET_CATEGORIES, type PresetCategoryKey } from '@/types'

interface WorldMapProps {
  levels: WorldLevel[]
  currentWorld: number
  onLevelSelect: (level: WorldLevel) => void
}

export function WorldMap({ levels, currentWorld, onLevelSelect }: WorldMapProps) {
  // Grouper les niveaux par monde
  const worldLevels = levels.filter(l => l.world_number === currentWorld)
  
  return (
    <div className="relative py-8">
      {/* Chemin sinueux */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>

      {/* Niveaux */}
      <div className="relative space-y-4 px-4">
        {worldLevels.map((level, index) => {
          const isEven = index % 2 === 0
          const category = PRESET_CATEGORIES[level.category as PresetCategoryKey]
          
          return (
            <div
              key={level.id}
              className={cn(
                'flex items-center gap-4',
                isEven ? 'justify-start ml-4' : 'justify-end mr-4'
              )}
            >
              {/* Connecteur vers le niveau précédent */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute w-1 h-12 -mt-8',
                    level.is_unlocked ? 'bg-orange-400' : 'bg-gray-300 dark:bg-gray-700',
                    isEven ? 'left-1/3' : 'right-1/3'
                  )}
                  style={{
                    transform: isEven ? 'rotate(-30deg)' : 'rotate(30deg)',
                  }}
                />
              )}

              <LevelNode
                level={level}
                categoryIcon={category?.icon || '📌'}
                categoryColor={category?.color || '#f97316'}
                onClick={() => level.is_unlocked && onLevelSelect(level)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface LevelNodeProps {
  level: WorldLevel
  categoryIcon: string
  categoryColor: string
  onClick: () => void
}

function LevelNode({ level, categoryIcon, categoryColor, onClick }: LevelNodeProps) {
  const { is_unlocked, is_completed, stars, is_boss, level_number, name } = level

  return (
    <button
      onClick={onClick}
      disabled={!is_unlocked}
      className={cn(
        'relative flex flex-col items-center transition-all',
        is_unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
      )}
    >
      {/* Cercle principal */}
      <div
        className={cn(
          'relative w-16 h-16 rounded-full flex items-center justify-center',
          'border-4 transition-all shadow-lg',
          is_boss && 'w-20 h-20',
          is_completed
            ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
            : is_unlocked
              ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/30 animate-level-pulse'
              : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
        )}
        style={{
          borderColor: is_completed ? '#22c55e' : is_unlocked ? categoryColor : undefined,
          backgroundColor: is_unlocked && !is_completed ? `${categoryColor}20` : undefined,
        }}
      >
        {/* Contenu */}
        {!is_unlocked ? (
          <Lock className="w-6 h-6 text-gray-400" />
        ) : is_boss ? (
          <Crown className="w-8 h-8 text-yellow-500" />
        ) : is_completed ? (
          <Check className="w-8 h-8 text-green-500" />
        ) : (
          <span className="text-2xl">{categoryIcon}</span>
        )}

        {/* Badge niveau */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1 w-6 h-6 rounded-full',
            'flex items-center justify-center text-xs font-bold',
            'border-2 border-white dark:border-zinc-900',
            is_completed
              ? 'bg-green-500 text-white'
              : is_unlocked
                ? 'bg-orange-500 text-white'
                : 'bg-gray-400 text-white'
          )}
        >
          {level_number}
        </div>
      </div>

      {/* Étoiles */}
      {is_completed && (
        <div className="flex gap-0.5 mt-1">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={cn(
                'w-4 h-4 transition-all',
                s <= stars
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          ))}
        </div>
      )}

      {/* Nom du niveau */}
      <p
        className={cn(
          'text-xs font-medium mt-1 max-w-20 text-center truncate',
          is_unlocked ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {name}
      </p>
    </button>
  )
}

// Composant pour sélectionner le monde
interface WorldSelectorProps {
  worlds: number[]
  currentWorld: number
  onWorldChange: (world: number) => void
  worldProgress: Record<number, { completed: number; total: number }>
}

export function WorldSelector({
  worlds,
  currentWorld,
  onWorldChange,
  worldProgress,
}: WorldSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {worlds.map((world) => {
        const progress = worldProgress[world] || { completed: 0, total: 5 }
        const isComplete = progress.completed === progress.total
        const isCurrent = world === currentWorld

        return (
          <button
            key={world}
            onClick={() => onWorldChange(world)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all',
              'border-2',
              isCurrent
                ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                : isComplete
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-700 text-muted-foreground'
            )}
          >
            <span className="flex items-center gap-2">
              {isComplete && <Check className="w-4 h-4" />}
              Monde {world}
              <span className="text-xs opacity-70">
                {progress.completed}/{progress.total}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
