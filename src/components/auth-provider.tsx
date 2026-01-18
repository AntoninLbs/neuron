// src/components/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authHandled, setAuthHandled] = useState(false)

  const handleAuthSuccess = useCallback((newSession: Session | null) => {
    if (authHandled && newSession?.user?.id === session?.user?.id) {
      return
    }
    setAuthHandled(true)
    setSession(newSession)
    setUser(newSession?.user ?? null)
    setIsLoading(false)
  }, [authHandled, session?.user?.id])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      handleAuthSuccess(currentSession)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        handleAuthSuccess(newSession)
      }
    )

    return () => subscription.unsubscribe()
  }, [handleAuthSuccess])

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Email ou mot de passe incorrect' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Vérifie ta boîte mail pour confirmer ton compte' }
      }
      return { error: error.message }
    }
    return { error: null }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'Cet email est déjà utilisé' }
      }
      if (error.message.includes('Password should be at least')) {
        return { error: 'Le mot de passe doit faire au moins 6 caractères' }
      }
      return { error: error.message }
    }
    if (data.user && !data.session) {
      return { error: null, needsConfirmation: true }
    }
    return { error: null }
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    })
  }

  const signOut = async () => {
    setAuthHandled(false)
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password',
    })
    if (error) return { error: error.message }
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{
      user, session, isLoading,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
