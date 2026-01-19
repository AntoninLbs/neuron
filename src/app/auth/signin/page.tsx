// src/app/auth/signin/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormMode = 'login' | 'signup' | 'forgot' | 'check-email'

export default function SignInPage() {
  const router = useRouter()
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth()
  
  const [mode, setMode] = useState<FormMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const hideMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    
    hideMessages()
    setIsLoading(true)
    
    const result = await signInWithEmail(email, password)
    
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    
    hideMessages()
    setIsLoading(true)
    
    const result = await signUpWithEmail(email, password)
    
    setIsLoading(false)
    
    if (result.error) {
      setError(result.error)
    } else if (result.needsConfirmation) {
      setMode('check-email')
    } else {
      router.push('/dashboard')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    hideMessages()
    setIsLoading(true)
    
    const result = await resetPassword(email)
    
    setIsLoading(false)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Un lien de réinitialisation a été envoyé à ton email')
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await signInWithGoogle()
  }

  const switchMode = (newMode: FormMode) => {
    hideMessages()
    setMode(newMode)
  }

  // Écran "Vérifie ton email"
  if (mode === 'check-email') {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Vérifie ta boîte mail</CardTitle>
            <CardDescription>
              Un lien de confirmation a été envoyé à <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Clique sur le lien dans l&apos;email pour activer ton compte.
            </p>
            <Button variant="link" onClick={() => switchMode('login')}>
              ← Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'forgot' ? 'Mot de passe oublié' : 'Bienvenue sur Neuron'}
          </CardTitle>
          <CardDescription>
            {mode === 'forgot' 
              ? 'Entre ton email pour recevoir un lien' 
              : 'Connecte-toi pour continuer ton apprentissage'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Messages */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-sm text-green-600 dark:text-green-400">
              {success}
            </div>
          )}

          {/* Mode mot de passe oublié */}
          {mode === 'forgot' ? (
            <>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Adresse email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={isLoading || !email}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Envoyer le lien
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => switchMode('login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </>
          ) : (
            <>
              {/* Tabs Connexion/Inscription */}
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  className={cn(
                    'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                    mode === 'login'
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => switchMode('login')}
                >
                  Connexion
                </button>
                <button
                  className={cn(
                    'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                    mode === 'signup'
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => switchMode('signup')}
                >
                  Inscription
                </button>
              </div>

              {/* Google OAuth */}
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continuer avec Google
              </Button>

              {/* Séparateur */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              {/* Formulaire Connexion */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => switchMode('forgot')}
                  >
                    Mot de passe oublié ?
                  </button>
                </form>
              )}

              {/* Formulaire Inscription */}
              {mode === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer un compte
                  </Button>
                </form>
              )}
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            En continuant, tu acceptes nos conditions d&apos;utilisation et notre politique de confidentialité.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
