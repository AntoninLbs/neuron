// src/app/(app)/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Save, Loader2, Check, Heart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from './theme-toggle'
import { ALL_COLORS, ALL_ACCESSORIES, type ShopColor, type ShopAccessory } from '@/types'

interface Profile {
  display_name: string | null
  wishlist_colors: string[]
  wishlist_accessories: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [wishlistColors, setWishlistColors] = useState<string[]>([])
  const [wishlistAccessories, setWishlistAccessories] = useState<string[]>([])
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
          .select('display_name, wishlist_colors, wishlist_accessories')
          .eq('id', user.id)
          .single()

        const name = profile?.display_name || user.user_metadata?.full_name || ''
        setDisplayName(name)
        setOriginalName(name)
        setWishlistColors(profile?.wishlist_colors || [])
        setWishlistAccessories(profile?.wishlist_accessories || [])
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

  const removeFromWishlist = async (type: 'color' | 'accessory', id: string) => {
    if (!user) return

    try {
      if (type === 'color') {
        const newList = wishlistColors.filter(c => c !== id)
        await supabase.from('profiles').update({ wishlist_colors: newList }).eq('id', user.id)
        setWishlistColors(newList)
      } else {
        const newList = wishlistAccessories.filter(a => a !== id)
        await supabase.from('profiles').update({ wishlist_accessories: newList }).eq('id', user.id)
        setWishlistAccessories(newList)
      }
    } catch (error) {
      console.error('Erreur wishlist:', error)
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

  // Favoris
  const favoriteColors = ALL_COLORS.filter(c => wishlistColors.includes(c.id))
  const favoriteAccessories = ALL_ACCESSORIES.filter(a => wishlistAccessories.includes(a.id))
  const hasFavorites = favoriteColors.length > 0 || favoriteAccessories.length > 0

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

        {/* Favoris (Wishlist) */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              Mes favoris
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasFavorites ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Pas encore de favoris.<br />
                <span className="text-xs">Va dans la boutique et clique ❤️ sur les items que tu veux !</span>
              </p>
            ) : (
              <div className="space-y-3">
                {/* Couleurs favorites */}
                {favoriteColors.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Couleurs ({favoriteColors.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {favoriteColors.map((color) => (
                        <div
                          key={color.id}
                          className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full text-xs"
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              background: color.value === 'rainbow'
                                ? 'linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)'
                                : color.value,
                            }}
                          />
                          <span>{color.name}</span>
                          <button
                            onClick={() => removeFromWishlist('color', color.id)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accessoires favoris */}
                {favoriteAccessories.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Accessoires ({favoriteAccessories.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {favoriteAccessories.map((acc) => (
                        <div
                          key={acc.id}
                          className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full text-xs"
                        >
                          <span>{acc.icon}</span>
                          <span>{acc.name}</span>
                          <button
                            onClick={() => removeFromWishlist('accessory', acc.id)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground mt-2">
                  💡 Tes items préférés pour ne pas les oublier !
                </p>
              </div>
            )}
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
