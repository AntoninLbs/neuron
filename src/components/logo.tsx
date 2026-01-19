// src/components/logo.tsx
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizes = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

export function Logo({ className, size = 'md', showText = false }: LogoProps) {
  const s = sizes[size]
  
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="neuron-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
        {/* Connexions */}
        <g stroke="url(#neuron-gradient)" strokeWidth="2.5" opacity="0.5">
          <line x1="50" y1="50" x2="20" y2="25" />
          <line x1="50" y1="50" x2="80" y2="20" />
          <line x1="50" y1="50" x2="85" y2="55" />
          <line x1="50" y1="50" x2="75" y2="85" />
          <line x1="50" y1="50" x2="25" y2="80" />
          <line x1="50" y1="50" x2="15" y2="50" />
        </g>
        {/* Nœuds */}
        <circle cx="50" cy="50" r="16" fill="url(#neuron-gradient)" />
        <circle cx="20" cy="25" r="6" fill="url(#neuron-gradient)" />
        <circle cx="80" cy="20" r="5" fill="url(#neuron-gradient)" />
        <circle cx="85" cy="55" r="4" fill="url(#neuron-gradient)" />
        <circle cx="75" cy="85" r="5" fill="url(#neuron-gradient)" />
        <circle cx="25" cy="80" r="6" fill="url(#neuron-gradient)" />
        <circle cx="15" cy="50" r="4" fill="url(#neuron-gradient)" />
      </svg>
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-neuron-400 to-neuron-600 bg-clip-text text-transparent">
          Neuron
        </span>
      )}
    </div>
  )
}

// Version icône app (carré arrondi)
export function LogoIcon({ className, variant = 'dark' }: { className?: string; variant?: 'dark' | 'gradient' | 'light' }) {
  const backgrounds = {
    dark: '#1a1a1a',
    gradient: 'url(#neuron-gradient)',
    light: '#ffffff',
  }
  
  const strokeColor = variant === 'gradient' ? 'white' : 'url(#neuron-icon-gradient)'
  const fillColor = variant === 'gradient' ? 'white' : 'url(#neuron-icon-gradient)'
  const strokeOpacity = variant === 'gradient' ? 0.4 : 0.5
  
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('rounded-[22%]', className)}
    >
      <defs>
        <linearGradient id="neuron-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill={backgrounds[variant]} />
      <g stroke={strokeColor} strokeWidth="2.5" opacity={strokeOpacity}>
        <line x1="50" y1="50" x2="22" y2="28" />
        <line x1="50" y1="50" x2="78" y2="22" />
        <line x1="50" y1="50" x2="82" y2="55" />
        <line x1="50" y1="50" x2="72" y2="82" />
        <line x1="50" y1="50" x2="28" y2="78" />
        <line x1="50" y1="50" x2="18" y2="50" />
      </g>
      <circle cx="50" cy="50" r="14" fill={fillColor} />
      <circle cx="22" cy="28" r="5" fill={fillColor} />
      <circle cx="78" cy="22" r="4" fill={fillColor} />
      <circle cx="82" cy="55" r="4" fill={fillColor} />
      <circle cx="72" cy="82" r="5" fill={fillColor} />
      <circle cx="28" cy="78" r="5" fill={fillColor} />
      <circle cx="18" cy="50" r="4" fill={fillColor} />
    </svg>
  )
}
