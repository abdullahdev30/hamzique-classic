'use client'

import { Moon, Sun } from 'lucide-react'
import React from 'react'

import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/cn'

type Props = {
  className?: string
}

export function ThemeToggle({ className }: Props) {
  const { setTheme, theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'flex h-10 w-10 items-center justify-center text-[var(--color-text-primary)] transition-colors hover:text-primary',
        className,
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      type="button"
    >
      {isDark ? (
        <Sun className="h-5 w-5 stroke-[1.8]" />
      ) : (
        <Moon className="h-5 w-5 stroke-[1.8]" />
      )}
    </button>
  )
}
