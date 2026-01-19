'use client'

import { OctopusMascot } from './octopus'
import type { MascotMood } from '@/types'

interface MascotWithBubbleProps {
  message: string
  mood?: MascotMood
  color?: string
  accessory?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export function MascotWithBubble({ 
  message, 
  mood = 'idle', 
  color = '#f97316',
  accessory = null,
  size = 'sm'
}: MascotWithBubbleProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Poulpe à gauche */}
      <div className="flex-shrink-0">
        <OctopusMascot 
          mood={mood} 
          color={color} 
          accessory={accessory}
          size={size}
        />
      </div>
      
      {/* Bulle de dialogue à droite */}
      <div className="relative flex-1 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm p-3 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Triangle de la bulle */}
        <div className="absolute left-0 bottom-3 -translate-x-full">
          <div className="w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white dark:border-r-gray-800 border-b-8 border-b-transparent" />
        </div>
        <div className="absolute left-0 bottom-3 -translate-x-full -ml-[1px]">
          <div className="w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-gray-200 dark:border-r-gray-700 border-b-8 border-b-transparent" style={{ zIndex: -1 }} />
        </div>
        
        {/* Message */}
        <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
      </div>
    </div>
  )
}
