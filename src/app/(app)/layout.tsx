// src/app/(app)/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Header } from '@/components/nav/header'
import { BottomNav } from '@/components/nav/bottom-nav'
import { Loader2 } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neuron-500" />
      </div>
    )
  }

  // Non connecté, redirige
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neuron-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header streak={0} />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav streak={0} />
    </div>
  )
}
