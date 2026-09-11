'use client'

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'

import type { Theme, ThemeContextType } from './types'

import { canUseDOM } from '@/utilities/canUseDOM'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

const themeChangeEvent = 'themechange'

const getThemeSnapshot = (): Theme | undefined => {
  if (!canUseDOM) return undefined

  const preference = window.localStorage.getItem(themeLocalStorageKey)
  if (themeIsValid(preference)) return preference

  const attributeTheme = document.documentElement.getAttribute('data-theme')
  if (themeIsValid(attributeTheme)) return attributeTheme

  return getImplicitPreference() || defaultTheme
}

const getServerThemeSnapshot = (): undefined => undefined

const subscribeToTheme = (onStoreChange: () => void): (() => void) => {
  if (!canUseDOM) return () => undefined

  window.addEventListener('storage', onStoreChange)
  window.addEventListener(themeChangeEvent, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(themeChangeEvent, onStoreChange)
  }
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      window.localStorage.removeItem(themeLocalStorageKey)
      document.documentElement.setAttribute('data-theme', getImplicitPreference() || defaultTheme)
    } else {
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
    }

    window.dispatchEvent(new Event(themeChangeEvent))
  }, [])

  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <ThemeContext.Provider value={{ setTheme, theme }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => useContext(ThemeContext)
