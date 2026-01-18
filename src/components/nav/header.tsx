// src/components/nav/header.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Moon, Sun, LogOut, User, Settings, Flame } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Accueil' },
  { href: '/learn', label: 'Apprendre' },
  { href: '/stats', label: 'Statistiques' },
]

interface HeaderProps {
  streak?: number
}

export function Header({ streak = 0 }: HeaderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="sm" showText />
          </Link>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-neuron-100 text-neuron-700 dark:bg-neuron-900/30 dark:text-neuron-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neuron-100 dark:bg-neuron-900/30">
              <Flame className="h-4 w-4 text-neuron-500" fill="currentColor" />
              <span className="text-sm font-bold text-neuron-600 dark:text-neuron-400">
                {streak}
              </span>
            </div>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Changer de thème"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User menu */}
          {session?.user && (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="icon-sm">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                aria-label="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
