'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import React, { useCallback, useState } from 'react'

const favoritesKey = 'store:favorites'

const readFavorites = () => {
  try {
    const value = window.localStorage.getItem(favoritesKey)
    const parsed = value ? JSON.parse(value) : []

    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

type Props = {
  productId: number | string
  title: string
}

export function FavoriteButton({ productId, title }: Props) {
  const id = String(productId)
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === 'undefined') return false
    return readFavorites().includes(id)
  })

  const toggleFavorite = useCallback(() => {
    const favorites = readFavorites()
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favorite) => favorite !== id)
      : [...favorites, id]

    window.localStorage.setItem(favoritesKey, JSON.stringify(nextFavorites))
    setIsFavorite(nextFavorites.includes(id))
  }, [id])

  return (
    <Button
      aria-label={`${isFavorite ? 'Remove' : 'Add'} ${title} ${isFavorite ? 'from' : 'to'} favorites`}
      aria-pressed={isFavorite}
      className="size-10 rounded-full"
      onClick={toggleFavorite}
      size="icon"
      type="button"
      variant="outline"
    >
      <Heart
        className={
          isFavorite ? 'fill-[var(--color-status-error)] text-[var(--color-status-error)]' : ''
        }
      />
    </Button>
  )
}
