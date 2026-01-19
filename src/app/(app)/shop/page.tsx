// src/app/(app)/shop/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Check, Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { OctopusMascot } from '@/components/mascot/octopus'
import { SHOP_ITEMS, type ShopItemKey, type UserProfile } from '@/types'
import { cn } from '@/lib/utils'

export default function ShopPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const [previewAccessory, setPreviewAccessory] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setPreviewColor(data.mascot_color)
        setPreviewAccessory(data.mascot_accessory)
      }
      setIsLoading(false)
    }

    loadProfile()
  }, [user])

  const isOwned = (itemKey: string) => {
    return profile?.unlocked_items?.includes(itemKey) || false
  }

  const isEquipped = (itemKey: string) => {
    const item = SHOP_ITEMS[itemKey as ShopItemKey]
    if (item.type === 'color') return profile?.mascot_color === item.value
    if (item.type === 'accessory') return profile?.mascot_accessory === item.value
    return false
  }

  const canAfford = (price: number) => {
    return (profile?.total_gems || 0) >= price
  }

  const buyItem = async (itemKey: ShopItemKey) => {
    if (!user || !profile) return
    
    const item = SHOP_ITEMS[itemKey]
    if (!canAfford(item.price)) return

    setPurchasing(itemKey)

    try {
      // Déduire les gems et ajouter l'item
      const newUnlockedItems = [...(profile.unlocked_items || []), itemKey]
      const newGems = (profile.total_gems || 0) - item.price

      await supabase
        .from('profiles')
        .update({
          total_gems: newGems,
          unlocked_items: newUnlockedItems,
        })
        .eq('id', user.id)

      setProfile({
        ...profile,
        total_gems: newGems,
        unlocked_items: newUnlockedItems,
      })
    } catch (error) {
      console.error('Erreur achat:', error)
    } finally {
      setPurchasing(null)
    }
  }

  const equipItem = async (itemKey: ShopItemKey) => {
    if (!user || !profile) return

    const item = SHOP_ITEMS[itemKey]

    try {
      if (item.type === 'color') {
        await supabase
          .from('profiles')
          .update({ mascot_color: item.value })
          .eq('id', user.id)
        
        setProfile({ ...profile, mascot_color: item.value })
        setPreviewColor(item.value)
      } else if (item.type === 'accessory') {
        const newAccessory = profile.mascot_accessory === item.value ? null : item.value
        await supabase
          .from('profiles')
          .update({ mascot_accessory: newAccessory })
          .eq('id', user.id)
        
        setProfile({ ...profile, mascot_accessory: newAccessory })
        setPreviewAccessory(newAccessory)
      }
    } catch (error) {
      console.error('Erreur équipement:', error)
    }
  }

  const colorItems = Object.entries(SHOP_ITEMS).filter(([_, item]) => item.type === 'color')
  const accessoryItems = Object.entries(SHOP_ITEMS).filter(([_, item]) => item.type === 'accessory')
  const themeItems = Object.entries(SHOP_ITEMS).filter(([_, item]) => item.type === 'theme')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Boutique</h1>
          </div>
          
          {/* Solde gems */}
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <span className="text-xl">💎</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">
              {profile?.total_gems || 0}
            </span>
          </div>
        </div>

        {/* Prévisualisation mascotte */}
        <Card className="mb-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardContent className="flex flex-col items-center py-8">
            <p className="text-sm text-muted-foreground mb-4">Aperçu</p>
            <OctopusMascot
              mood="happy"
              color={previewColor || profile?.mascot_color || '#f97316'}
              accessory={previewAccessory}
              size="xl"
            />
          </CardContent>
        </Card>

        {/* Couleurs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🎨 Couleurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colorItems.map(([key, item]) => {
                const owned = isOwned(key)
                const equipped = isEquipped(key)
                const affordable = canAfford(item.price)

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setPreviewColor(item.value)
                      if (owned) {
                        equipItem(key as ShopItemKey)
                      }
                    }}
                    onMouseEnter={() => setPreviewColor(item.value)}
                    onMouseLeave={() => setPreviewColor(profile?.mascot_color || '#f97316')}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all',
                      equipped && 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
                      !equipped && 'border-border hover:border-orange-300'
                    )}
                  >
                    {/* Couleur preview */}
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 shadow-md"
                      style={{
                        background: item.value === 'rainbow'
                          ? 'linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)'
                          : item.value,
                      }}
                    />
                    
                    <p className="font-medium text-sm">{item.name}</p>

                    {equipped ? (
                      <span className="text-xs text-orange-500 flex items-center justify-center gap-1 mt-1">
                        <Check className="h-3 w-3" /> Équipé
                      </span>
                    ) : owned ? (
                      <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs" onClick={(e) => { e.stopPropagation(); equipItem(key as ShopItemKey) }}>
                        Équiper
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className={cn(
                          'w-full mt-2 h-7 text-xs',
                          affordable ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-300'
                        )}
                        disabled={!affordable || purchasing === key}
                        onClick={(e) => { e.stopPropagation(); buyItem(key as ShopItemKey) }}
                      >
                        {purchasing === key ? '...' : `💎 ${item.price}`}
                      </Button>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Accessoires */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ✨ Accessoires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {accessoryItems.map(([key, item]) => {
                const owned = isOwned(key)
                const equipped = isEquipped(key)
                const affordable = canAfford(item.price)

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setPreviewAccessory(item.value)
                      if (owned) {
                        equipItem(key as ShopItemKey)
                      }
                    }}
                    onMouseEnter={() => setPreviewAccessory(item.value)}
                    onMouseLeave={() => setPreviewAccessory(profile?.mascot_accessory || null)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all',
                      equipped && 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
                      !equipped && 'border-border hover:border-orange-300'
                    )}
                  >
                    <span className="text-4xl block mb-2">{item.icon}</span>
                    <p className="font-medium text-sm">{item.name}</p>

                    {equipped ? (
                      <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs" onClick={(e) => { e.stopPropagation(); equipItem(key as ShopItemKey) }}>
                        Retirer
                      </Button>
                    ) : owned ? (
                      <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs" onClick={(e) => { e.stopPropagation(); equipItem(key as ShopItemKey) }}>
                        Équiper
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className={cn(
                          'w-full mt-2 h-7 text-xs',
                          affordable ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-300'
                        )}
                        disabled={!affordable || purchasing === key}
                        onClick={(e) => { e.stopPropagation(); buyItem(key as ShopItemKey) }}
                      >
                        {purchasing === key ? '...' : `💎 ${item.price}`}
                      </Button>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Thèmes bonus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🎁 Thèmes bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {themeItems.map(([key, item]) => {
                const owned = isOwned(key)
                const affordable = canAfford(item.price)

                return (
                  <div
                    key={key}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all',
                      owned && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                      !owned && 'border-border'
                    )}
                  >
                    <span className="text-4xl block mb-2">{item.icon}</span>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Questions thématiques</p>

                    {owned ? (
                      <span className="text-xs text-green-500 flex items-center gap-1 mt-2">
                        <Check className="h-3 w-3" /> Débloqué
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className={cn(
                          'w-full mt-2 h-7 text-xs',
                          affordable ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-300'
                        )}
                        disabled={!affordable || purchasing === key}
                        onClick={() => buyItem(key as ShopItemKey)}
                      >
                        {purchasing === key ? '...' : `💎 ${item.price}`}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
