'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Gift, Clock, Heart, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { OctopusMascot } from '@/components/mascot/octopus'
import { 
  getDailyShop, 
  DAILY_REWARDS, 
  BOOSTERS,
  SHOP_PRICES,
  ALL_COLORS,
  ALL_ACCESSORIES,
  type ShopColor,
} from '@/types'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  total_gems: number
  current_streak: number
  best_streak: number
  last_activity_date: string | null
  mascot_color: string
  mascot_accessory: string | null
  unlocked_items: string[]
  wishlist_colors: string[]
  wishlist_accessories: string[]
}

export default function ShopPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const [previewAccessory, setPreviewAccessory] = useState<string | null>(null)
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [showCatalog, setShowCatalog] = useState<'colors' | 'accessories' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Boutique du jour (rotation aléatoire)
  const dailyShop = getDailyShop()

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const lastActivity = data.last_activity_date
        
        let currentStreak = data.current_streak || 0
        if (lastActivity !== today && lastActivity !== yesterday) {
          currentStreak = 0
          await supabase.from('profiles').update({ current_streak: 0 }).eq('id', user.id)
        }
        
        setProfile({ 
          ...data, 
          current_streak: currentStreak,
          wishlist_colors: data.wishlist_colors || [],
          wishlist_accessories: data.wishlist_accessories || [],
        })
        setPreviewColor(data.mascot_color)
        setPreviewAccessory(data.mascot_accessory)
        setDailyRewardClaimed(lastActivity === today)
      }
      setIsLoading(false)
    }

    loadProfile()
  }, [user])

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [])

  const isOwned = (type: string, id: string) => {
    const key = `${type}_${id}`
    return profile?.unlocked_items?.includes(key) || false
  }

  const isEquipped = (type: string, value: string) => {
    if (type === 'color') return profile?.mascot_color === value
    if (type === 'accessory') return profile?.mascot_accessory === value
    return false
  }

  const isWishlisted = (type: string, id: string) => {
    if (type === 'color') return profile?.wishlist_colors?.includes(id) || false
    if (type === 'accessory') return profile?.wishlist_accessories?.includes(id) || false
    return false
  }

  const canAfford = (price: number) => (profile?.total_gems || 0) >= price

  const toggleWishlist = async (type: string, id: string) => {
    if (!user || !profile) return

    try {
      if (type === 'color') {
        const current = profile.wishlist_colors || []
        const newList = current.includes(id) 
          ? current.filter(c => c !== id)
          : [...current, id]
        
        await supabase.from('profiles').update({ wishlist_colors: newList }).eq('id', user.id)
        setProfile({ ...profile, wishlist_colors: newList })
      } else {
        const current = profile.wishlist_accessories || []
        const newList = current.includes(id)
          ? current.filter(a => a !== id)
          : [...current, id]
        
        await supabase.from('profiles').update({ wishlist_accessories: newList }).eq('id', user.id)
        setProfile({ ...profile, wishlist_accessories: newList })
      }
    } catch (error) {
      console.error('Erreur wishlist:', error)
    }
  }

  const claimDailyReward = async () => {
    if (!user || !profile || dailyRewardClaimed) return

    const streakDay = (profile.current_streak || 0) % 5
    const reward = DAILY_REWARDS[streakDay]

    try {
      const today = new Date().toISOString().split('T')[0]
      const newStreak = (profile.current_streak || 0) + 1

      await supabase.from('profiles').update({
        total_gems: (profile.total_gems || 0) + reward.gems,
        current_streak: newStreak,
        best_streak: Math.max(profile.best_streak || 0, newStreak),
        last_activity_date: today,
      }).eq('id', user.id)

      setProfile({
        ...profile,
        total_gems: (profile.total_gems || 0) + reward.gems,
        current_streak: newStreak,
        last_activity_date: today,
      })
      setDailyRewardClaimed(true)
    } catch (error) {
      console.error('Erreur claim reward:', error)
    }
  }

  const buyItem = async (type: string, id: string, value: string, price: number) => {
    if (!user || !profile || !canAfford(price)) return
    
    const key = `${type}_${id}`
    if (isOwned(type, id)) return

    setPurchasing(key)

    try {
      const newUnlockedItems = [...(profile.unlocked_items || []), key]
      const newGems = (profile.total_gems || 0) - price

      await supabase.from('profiles').update({
        total_gems: newGems,
        unlocked_items: newUnlockedItems,
      }).eq('id', user.id)

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

  const equipItem = async (type: string, value: string) => {
    if (!user || !profile) return

    try {
      if (type === 'color') {
        await supabase.from('profiles').update({ mascot_color: value }).eq('id', user.id)
        setProfile({ ...profile, mascot_color: value })
        setPreviewColor(value)
      } else if (type === 'accessory') {
        const newAccessory = profile.mascot_accessory === value ? null : value
        await supabase.from('profiles').update({ mascot_accessory: newAccessory }).eq('id', user.id)
        setProfile({ ...profile, mascot_accessory: newAccessory })
        setPreviewAccessory(newAccessory)
      }
    } catch (error) {
      console.error('Erreur équipement:', error)
    }
  }

  // Filtrer pour le catalogue
  const filteredColors = ALL_COLORS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredAccessories = ALL_ACCESSORIES.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  const streakDay = (profile?.current_streak || 0) % 5
  const todayReward = DAILY_REWARDS[streakDay]

  // Modal catalogue
  if (showCatalog) {
    const items = showCatalog === 'colors' ? filteredColors : filteredAccessories
    const type = showCatalog === 'colors' ? 'color' : 'accessory'
    const title = showCatalog === 'colors' ? `🎨 Couleurs (${ALL_COLORS.length})` : `✨ Accessoires (${ALL_ACCESSORIES.length})`

    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        <div className="container max-w-lg px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowCatalog(null); setSearchQuery('') }}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold flex-1">{title}</h1>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Heart className="h-3 w-3 fill-red-500 text-red-500" /> = favoris (visible dans ton profil)
          </div>

          <div className={cn(
            "grid gap-2",
            showCatalog === 'colors' ? "grid-cols-4" : "grid-cols-3"
          )}>
            {items.map((item) => {
              const owned = isOwned(type, item.id)
              const wishlisted = isWishlisted(type, item.id)
              const isRare = 'rare' in item && item.rare
              const price = isRare 
                ? (type === 'color' ? SHOP_PRICES.color_rare : SHOP_PRICES.accessory_rare)
                : (type === 'color' ? SHOP_PRICES.color_common : SHOP_PRICES.accessory_common)

              return (
                <div
                  key={item.id}
                  className={cn(
                    'relative p-2 rounded-lg border transition-all',
                    owned ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'
                  )}
                >
                  <button
                    onClick={() => toggleWishlist(type, item.id)}
                    className="absolute -top-1 -right-1 z-10"
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4 transition-colors",
                        wishlisted ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-300"
                      )} 
                    />
                  </button>

                  {isRare && <span className="absolute top-0 left-0 text-[8px]">✨</span>}

                  {type === 'color' ? (
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-1"
                      style={{
                        background: (item as ShopColor).value === 'rainbow'
                          ? 'linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)'
                          : (item as ShopColor).value,
                      }}
                    />
                  ) : (
                    <span className="text-2xl block text-center">{item.icon}</span>
                  )}
                  <p className="text-[9px] text-center truncate">{item.name}</p>
                  
                  {owned ? (
                    <span className="text-[8px] text-green-500 block text-center">✓</span>
                  ) : (
                    <span className="text-[8px] text-muted-foreground block text-center">💎{price}</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            ❤️ {(profile?.wishlist_colors?.length || 0) + (profile?.wishlist_accessories?.length || 0)} dans ta wishlist
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container max-w-lg px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">Boutique</h1>
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <span>💎</span>
            <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">
              {profile?.total_gems || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Clock className="h-3 w-3" />
          Nouveau stock dans {timeUntilReset}
        </div>

        <Card className={cn(
          "mb-4 overflow-hidden",
          dailyRewardClaimed 
            ? "bg-muted/50" 
            : "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                dailyRewardClaimed ? "bg-muted" : "bg-amber-200 dark:bg-amber-800"
              )}>
                {dailyRewardClaimed ? '✅' : <Gift className="h-5 w-5 text-amber-700" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Récompense du jour</p>
                <p className="text-xs text-muted-foreground">
                  Jour {streakDay + 1}/5 • {todayReward.gems} 💎
                </p>
              </div>
              <Button
                size="sm"
                disabled={dailyRewardClaimed}
                onClick={claimDailyReward}
                className={cn(
                  "h-8 text-xs",
                  dailyRewardClaimed 
                    ? "bg-muted text-muted-foreground"
                    : "bg-amber-500 hover:bg-amber-600"
                )}
              >
                {dailyRewardClaimed ? 'OK' : 'Récupérer'}
              </Button>
            </div>
            
            <div className="flex gap-0.5 mt-2">
              {DAILY_REWARDS.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 h-1 rounded-full",
                    i < streakDay ? "bg-amber-500" :
                    i === streakDay && dailyRewardClaimed ? "bg-amber-500" :
                    i === streakDay ? "bg-amber-300 animate-pulse" :
                    "bg-muted"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-4">
          <OctopusMascot
            mood="happy"
            color={previewColor || profile?.mascot_color || '#f97316'}
            accessory={previewAccessory}
            accessoryIcon={previewAccessory ? ALL_ACCESSORIES.find(a => a.value === previewAccessory)?.icon : null}
            size="md"
          />
        </div>

        <Card className="mb-3">
          <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs">🎨 Couleurs du jour</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowCatalog('colors')}>
              Tout voir ({ALL_COLORS.length})
            </Button>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-3 gap-1.5">
              {dailyShop.colors.map((item) => {
                const owned = isOwned('color', item.id)
                const equipped = isEquipped('color', item.value)
                const wishlisted = isWishlisted('color', item.id)
                const isRare = 'rare' in item && item.rare
                const price = isRare ? SHOP_PRICES.color_rare : SHOP_PRICES.color_common
                const affordable = canAfford(price)

                return (
                  <button
                    key={item.id}
                    onClick={() => setPreviewColor(item.value)}
                    className={cn(
                      'relative p-2 rounded-lg border transition-all',
                      equipped ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-border'
                    )}
                  >
                    {wishlisted && <Heart className="absolute -top-1 -right-1 h-3 w-3 fill-red-500 text-red-500" />}
                    {isRare && <span className="absolute top-0 left-0 text-[10px]">✨</span>}
                    <div
                      className="w-6 h-6 rounded-full mx-auto mb-1"
                      style={{
                        background: item.value === 'rainbow'
                          ? 'linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)'
                          : item.value,
                      }}
                    />
                    <p className="text-[10px] truncate">{item.name}</p>

                    {equipped ? (
                      <span className="text-[9px] text-orange-500">Équipé</span>
                    ) : owned ? (
                      <button className="text-[9px] text-blue-500" onClick={(e) => { e.stopPropagation(); equipItem('color', item.value) }}>
                        Équiper
                      </button>
                    ) : (
                      <Button
                        size="sm"
                        className={cn('w-full h-5 text-[9px] mt-0.5 px-1', affordable ? 'bg-purple-500' : 'bg-gray-300')}
                        disabled={!affordable || purchasing === `color_${item.id}`}
                        onClick={(e) => { e.stopPropagation(); buyItem('color', item.id, item.value, price) }}
                      >
                        💎{price}
                      </Button>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-3">
          <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs">✨ Accessoires du jour</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowCatalog('accessories')}>
              Tout voir ({ALL_ACCESSORIES.length})
            </Button>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-1.5">
              {dailyShop.accessories.map((item) => {
                const owned = isOwned('accessory', item.id)
                const equipped = isEquipped('accessory', item.value)
                const wishlisted = isWishlisted('accessory', item.id)
                const isRare = 'rare' in item && item.rare
                const price = isRare ? SHOP_PRICES.accessory_rare : SHOP_PRICES.accessory_common
                const affordable = canAfford(price)

                return (
                  <button
                    key={item.id}
                    onClick={() => setPreviewAccessory(item.value)}
                    className={cn(
                      'relative p-2 rounded-lg border transition-all',
                      equipped ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-border'
                    )}
                  >
                    {wishlisted && <Heart className="absolute -top-1 -right-1 h-3 w-3 fill-red-500 text-red-500" />}
                    {isRare && <span className="absolute top-0 left-0 text-[10px]">✨</span>}
                    <span className="text-xl block">{item.icon}</span>
                    <p className="text-[10px] font-medium">{item.name}</p>

                    {equipped ? (
                      <button className="text-[9px] text-orange-500" onClick={(e) => { e.stopPropagation(); equipItem('accessory', item.value) }}>
                        Retirer
                      </button>
                    ) : owned ? (
                      <button className="text-[9px] text-blue-500" onClick={(e) => { e.stopPropagation(); equipItem('accessory', item.value) }}>
                        Équiper
                      </button>
                    ) : (
                      <Button
                        size="sm"
                        className={cn('w-full h-5 text-[9px] mt-0.5 px-1', affordable ? 'bg-purple-500' : 'bg-gray-300')}
                        disabled={!affordable || purchasing === `accessory_${item.id}`}
                        onClick={(e) => { e.stopPropagation(); buyItem('accessory', item.id, item.value, price) }}
                      >
                        💎{price}
                      </Button>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs">🚀 Boosters</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1.5">
              {Object.entries(BOOSTERS).map(([key, booster]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg border">
                  <span className="text-xl">{booster.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs">{booster.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{booster.description}</p>
                  </div>
                  <Button
                    size="sm"
                    className={cn('h-6 text-[10px] px-2', canAfford(booster.price) ? 'bg-purple-500' : 'bg-gray-300')}
                    disabled={!canAfford(booster.price)}
                  >
                    💎{booster.price}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
