// src/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Brain, Flame, Target, Zap, Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Si connecté, rediriger vers le dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neuron-500" />
      </div>
    )
  }

  // Si connecté, ne pas afficher la page (redirection en cours)
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neuron-500" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container flex items-center justify-between px-4 py-6">
        <Logo size="md" showText />
        <Link href="/auth/signin">
          <Button variant="outline" size="sm">
            Connexion
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="container px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Connecte tes{' '}
            <span className="text-gradient">connaissances</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Apprends la culture générale de façon intelligente. 
            5 minutes par jour, des milliers de connaissances mémorisées.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signin">
              <Button size="xl" className="w-full sm:w-auto">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Répétition espacée"
            description="Notre algorithme optimise ta mémorisation. Révise au bon moment, retiens pour toujours."
          />
          <FeatureCard
            icon={<Target className="h-8 w-8" />}
            title="Projets personnalisés"
            description="Crée tes propres parcours en combinant les thèmes qui t'intéressent."
          />
          <FeatureCard
            icon={<Flame className="h-8 w-8" />}
            title="Streak & motivation"
            description="Maintiens ta flamme allumée ! Chaque jour compte pour ta progression."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Questions IA"
            description="Des milliers de questions générées et vérifiées pour une variété infinie."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Comment ça marche ?</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <StepCard
            number={1}
            title="Crée ton projet"
            description="Choisis les thématiques qui te passionnent : histoire, sciences, sport, cinéma..."
          />
          <StepCard
            number={2}
            title="Apprends chaque jour"
            description="5 nouvelles questions par jour + tes révisions. Moins de 5 minutes suffisent !"
          />
          <StepCard
            number={3}
            title="Mémorise durablement"
            description="Les questions reviennent au bon moment. Plus tu progresses, plus les intervalles s'espacent."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-r from-neuron-400 to-neuron-600 p-8 text-center text-white md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">
            Prêt à booster ta culture générale ?
          </h2>
          <p className="mt-4 text-white/90">
            Rejoins des milliers d&apos;apprenants et commence ton parcours aujourd&apos;hui.
          </p>
          <Link href="/auth/signin" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="bg-white text-neuron-600 hover:bg-white/90">
              Créer mon compte gratuit
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Neuron. Tous droits réservés.</p>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 text-center card-hover">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neuron-100 text-neuron-600 dark:bg-neuron-900/30 dark:text-neuron-400">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neuron-500 text-xl font-bold text-white">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
