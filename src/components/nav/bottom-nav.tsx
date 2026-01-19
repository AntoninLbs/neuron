// src/components/nav/bottom-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, ShoppingBag, User, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/learn', label: 'Apprendre', icon: BookOpen },
  { href: '/shop', label: 'Boutique', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]

interface BottomNavProps {
  streak?: number
}

export function BottomNav({ streak = 0 }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[64px] min-h-[44px] rounded-xl transition-colors',
                isActive
                  ? 'text-neuron-500'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Streak indicator */}
        {streak > 0 && (
          <div className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[64px]">
            <div className="relative">
              <Flame className="h-5 w-5 text-neuron-500" fill="currentColor" />
            </div>
            <span className="text-[10px] font-bold text-neuron-500">{streak}</span>
          </div>
        )}
      </div>
    </nav>
  )
}
