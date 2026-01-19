// src/app/(app)/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Save, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from './theme-toggle'

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Charger le profil
  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()

        const name = profile?.display_name || user.user_metadata?.full_name || ''
        setDisplayName(name)
        setOriginalName(name)
      } catch (error) {
        console.error('Erreur chargement profil:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user || displayName === originalName) return

    setIsSaving(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName.trim() || null,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setOriginalName(displayName)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const hasChanges = displayName !== originalName

  // Avatar
  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = (displayName || user?.email || 'U').charAt(0).toUpperCase()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container max-w-lg px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Mon profil</h1>

        {/* Avatar et info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
              )}
              <div>
                <p className="font-semibold">{displayName || 'Utilisateur'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Formulaire nom */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nom d'affichage</Label>
                <Input
                  id="displayName"
                  placeholder="Ton prénom ou pseudo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ce nom sera utilisé pour te saluer dans l'application
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saved ? 'Enregistré !' : 'Enregistrer'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Préférences</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* Déconnexion */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
