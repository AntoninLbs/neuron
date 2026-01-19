// src/components/mascot/octopus.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { MascotMood } from '@/types'

interface OctopusMascotProps {
  mood?: MascotMood
  message?: string
  color?: string
  accessory?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showMessage?: boolean
}

export function OctopusMascot({
  mood = 'idle',
  message,
  color = '#f97316',
  accessory = null,
  size = 'md',
  className,
  showMessage = true,
}: OctopusMascotProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(false)

  // Animation de typing
  useEffect(() => {
    if (!message || !showMessage) {
      setBubbleVisible(false)
      return
    }

    setBubbleVisible(true)
    setIsTyping(true)
    setDisplayedText('')

    let i = 0
    const timer = setInterval(() => {
      if (i < message.length) {
        setDisplayedText(message.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 25)

    return () => clearInterval(timer)
  }, [message, showMessage])

  const sizeMap = {
    sm: { container: 'w-16 h-16', bubble: 'text-xs max-w-32', bubbleOffset: '-top-12' },
    md: { container: 'w-24 h-24', bubble: 'text-sm max-w-40', bubbleOffset: '-top-14' },
    lg: { container: 'w-32 h-32', bubble: 'text-sm max-w-48', bubbleOffset: '-top-16' },
    xl: { container: 'w-40 h-40', bubble: 'text-base max-w-56', bubbleOffset: '-top-20' },
  }

  const isRainbow = color === 'rainbow'

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      {/* Bulle de dialogue */}
      {bubbleVisible && message && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 z-10',
            'bg-white dark:bg-zinc-800 rounded-2xl px-3 py-2',
            'shadow-lg border-2 border-orange-200 dark:border-orange-700',
            'animate-in fade-in slide-in-from-bottom-2 duration-200',
            sizeMap[size].bubble,
            sizeMap[size].bubbleOffset
          )}
        >
          <p className="text-center font-medium text-zinc-800 dark:text-zinc-100">
            {displayedText}
            {isTyping && <span className="animate-pulse ml-0.5">|</span>}
          </p>
          {/* Triangle */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white dark:border-t-zinc-800" />
        </div>
      )}

      {/* SVG Poulpe */}
      <svg
        viewBox="0 0 120 120"
        className={cn(
          sizeMap[size].container,
          'transition-transform',
          mood === 'idle' && 'animate-float',
          mood === 'happy' && 'animate-bounce-slow',
          mood === 'excited' && 'animate-bounce',
          mood === 'celebrating' && 'animate-wiggle',
          mood === 'thinking' && 'animate-tilt',
          mood === 'sad' && 'animate-float-slow'
        )}
      >
        <defs>
          {/* Gradient arc-en-ciel animé */}
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444">
              <animate attributeName="stop-color" values="#ef4444;#f97316;#eab308;#22c55e;#3b82f6;#8b5cf6;#ef4444" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#22c55e">
              <animate attributeName="stop-color" values="#22c55e;#3b82f6;#8b5cf6;#ef4444;#f97316;#eab308;#22c55e" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#8b5cf6">
              <animate attributeName="stop-color" values="#8b5cf6;#ef4444;#f97316;#eab308;#22c55e;#3b82f6;#8b5cf6" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        <g filter="url(#shadow)">
          {/* Tentacules animés */}
          <g>
            {/* Tentacule 1 */}
            <path fill={isRainbow ? 'url(#rainbow)' : color}>
              <animate attributeName="d" dur="1.5s" repeatCount="indefinite"
                values="M30 65 Q20 80 25 95 Q28 100 32 95 Q38 82 35 68;
                        M30 65 Q15 78 22 95 Q25 102 30 95 Q40 80 35 68;
                        M30 65 Q20 80 25 95 Q28 100 32 95 Q38 82 35 68" />
            </path>
            {/* Tentacule 2 */}
            <path fill={isRainbow ? 'url(#rainbow)' : color}>
              <animate attributeName="d" dur="1.8s" repeatCount="indefinite"
                values="M40 68 Q32 85 38 102 Q42 108 46 102 Q52 87 48 70;
                        M40 68 Q28 82 35 102 Q40 110 45 102 Q55 85 48 70;
                        M40 68 Q32 85 38 102 Q42 108 46 102 Q52 87 48 70" />
            </path>
            {/* Tentacule 3 */}
            <path fill={isRainbow ? 'url(#rainbow)' : color}>
              <animate attributeName="d" dur="1.4s" repeatCount="indefinite"
                values="M52 70 Q48 90 52 108 Q55 114 58 108 Q62 90 58 72;
                        M52 70 Q45 88 50 108 Q54 116 58 108 Q65 88 58 72;
                        M52 70 Q48 90 52 108 Q55 114 58 108 Q62 90 58 72" />
            </path>
            {/* Tentacule 4 - centre */}
            <path fill={isRainbow ? 'url(#rainbow)' : color}>
              <animate attributeName="d" dur="1.6s" repeatCount="indefinite"
                values="M60 70 Q60 92 60 110 Q60 115 60 110 Q60 92 60 72;
                        M60 70 Q58 90 60 112 Q60 118 60 112 Q62 90 60 72;
                        M60 70 Q60 92 60 110 Q60 115 60 110 Q60 92 60 72" />
            </path>
            {/* Tentacule 5 */}
            <path fill={isRainbow ? 'url(#rainbow)' : color}>
              <animate attributeName="d" dur="1.7s" repeatCount="indefinite"
                values="M68 70 Q72 90 68 108 Q65 114 62 108 Q58 90 62 72;
                        M68 70 Q75 88 70 108 Q66 116 62 108 Q55 88 62 72;
                        M68 70 Q72 90 68 108 Q65 114 62 108 Q58 90 62 72" />
            </path>
            {/* Tentacule 6 */}
            <path fill={isRainbow ? 'url(#rainbow)' : color}>
              <animate attributeName="d" dur="1.9s" repeatCount="indefinite"
                values="M80 68 Q88 85 82 102 Q78 108 74 102 Q68 87 72 70;
                        M80 68 Q92 82 85 102 Q80 110 75 102 Q65 85 72 70;
                        M80 68 Q88 85 82 102 Q78 108 74 102 Q68 87 72 70" />
            </path>
            {/* Tentacule 7 */}
            <path fill={isRainbow ? 'url(#rainbow)' : color}>
              <animate attributeName="d" dur="1.5s" repeatCount="indefinite"
                values="M90 65 Q100 80 95 95 Q92 100 88 95 Q82 82 85 68;
                        M90 65 Q105 78 98 95 Q95 102 90 95 Q80 80 85 68;
                        M90 65 Q100 80 95 95 Q92 100 88 95 Q82 82 85 68" />
            </path>
          </g>

          {/* Tête */}
          <ellipse cx="60" cy="45" rx="32" ry="28" fill={isRainbow ? 'url(#rainbow)' : color} />
          {/* Reflet */}
          <ellipse cx="48" cy="35" rx="8" ry="5" fill="white" opacity="0.3" />

          {/* Yeux */}
          <ellipse cx="48" cy="42" rx="10" ry="11" fill="white" />
          <ellipse cx={mood === 'thinking' ? 46 : 50} cy="44" rx="5" ry="6" fill="#1a1a1a" />
          <circle cx="52" cy="40" r="2" fill="white" />

          <ellipse cx="72" cy="42" rx="10" ry="11" fill="white" />
          <ellipse cx={mood === 'thinking' ? 70 : 74} cy="44" rx="5" ry="6" fill="#1a1a1a" />
          <circle cx="76" cy="40" r="2" fill="white" />

          {/* Sourcils si triste */}
          {mood === 'sad' && (
            <g stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
              <line x1="40" y1="30" x2="52" y2="33" />
              <line x1="68" y1="33" x2="80" y2="30" />
            </g>
          )}

          {/* Bouche */}
          {mood === 'happy' || mood === 'excited' || mood === 'celebrating' ? (
            <path d="M50 55 Q60 65 70 55" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          ) : mood === 'sad' ? (
            <path d="M50 60 Q60 52 70 60" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          ) : mood === 'thinking' ? (
            <ellipse cx="65" cy="57" rx="4" ry="3" fill="#1a1a1a" />
          ) : (
            <ellipse cx="60" cy="57" rx="5" ry="4" fill="#1a1a1a" />
          )}

          {/* Joues roses */}
          {(mood === 'happy' || mood === 'excited' || mood === 'celebrating') && (
            <>
              <ellipse cx="35" cy="50" rx="6" ry="4" fill="#fca5a5" opacity="0.5" />
              <ellipse cx="85" cy="50" rx="6" ry="4" fill="#fca5a5" opacity="0.5" />
            </>
          )}

          {/* Accessoires */}
          {accessory === 'glasses' && (
            <g>
              <circle cx="48" cy="42" r="12" fill="none" stroke="#374151" strokeWidth="2.5" />
              <circle cx="72" cy="42" r="12" fill="none" stroke="#374151" strokeWidth="2.5" />
              <line x1="60" y1="42" x2="60" y2="42" stroke="#374151" strokeWidth="2.5" />
              <line x1="36" y1="40" x2="28" y2="35" stroke="#374151" strokeWidth="2.5" />
              <line x1="84" y1="40" x2="92" y2="35" stroke="#374151" strokeWidth="2.5" />
            </g>
          )}

          {accessory === 'hat' && (
            <g>
              <ellipse cx="60" cy="22" rx="24" ry="6" fill="#1a1a1a" />
              <rect x="45" y="8" width="30" height="16" rx="3" fill="#1a1a1a" />
              <rect x="52" y="12" width="16" height="3" fill="#eab308" />
            </g>
          )}

          {accessory === 'crown' && (
            <g>
              <path d="M35 25 L42 10 L50 20 L60 5 L70 20 L78 10 L85 25 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="42" cy="14" r="3" fill="#ef4444" />
              <circle cx="60" cy="9" r="3" fill="#3b82f6" />
              <circle cx="78" cy="14" r="3" fill="#22c55e" />
            </g>
          )}

          {accessory === 'headphones' && (
            <g>
              <path d="M30 42 Q30 15 60 15 Q90 15 90 42" fill="none" stroke="#374151" strokeWidth="5" />
              <ellipse cx="30" cy="45" rx="8" ry="10" fill="#374151" />
              <ellipse cx="90" cy="45" rx="8" ry="10" fill="#374151" />
            </g>
          )}

          {accessory === 'bowtie' && (
            <g>
              <path d="M50 65 L42 60 L42 70 Z" fill="#ef4444" />
              <path d="M70 65 L78 60 L78 70 Z" fill="#ef4444" />
              <circle cx="60" cy="65" r="4" fill="#ef4444" />
            </g>
          )}

          {/* Étoiles si celebrating */}
          {mood === 'celebrating' && (
            <g className="animate-pulse">
              <text x="20" y="25" fontSize="12">✨</text>
              <text x="90" y="20" fontSize="10">⭐</text>
              <text x="98" y="50" fontSize="10">✨</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}
