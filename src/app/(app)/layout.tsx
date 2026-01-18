// src/app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/nav/header'
import { BottomNav } from '@/components/nav/bottom-nav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Récupérer le streak de l'utilisateur
  const userStats = await prisma.userStats.findUnique({
    where: { userId: session.user.id },
    select: { currentStreak: true },
  })

  const streak = userStats?.currentStreak || 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header streak={streak} />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav streak={streak} />
    </div>
  )
}
