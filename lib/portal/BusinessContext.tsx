'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { PortalBusiness, BrandColors } from './types'

interface BusinessContextValue {
  businesses: PortalBusiness[]
  activeBusiness: PortalBusiness | null
  activeBusinessId: string | null
  setActiveBusinessId: (id: string) => void
  refreshBusinesses: () => Promise<void>
  loading: boolean
  // brand theme derived from active business
  theme: BrandColors
}

const DEFAULT_THEME: BrandColors = {
  primary: '#1B2B5E',
  secondary: '#2563eb',
  accent: '#d4af37',
  background: '#f8fafc',
  text: '#1e293b',
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

const STORAGE_KEY = 'montero_active_business_id'

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<PortalBusiness[]>([])
  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshBusinesses = useCallback(async () => {
    try {
      const res = await fetch('/api/portal/businesses')
      const data = await res.json()
      const list: PortalBusiness[] = data.businesses || []
      setBusinesses(list)

      // Decide active business
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (stored && list.some(b => b.id === stored)) {
        setActiveBusinessIdState(stored)
      } else if (list.length > 0) {
        setActiveBusinessIdState(list[0].id)
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, list[0].id)
      } else {
        setActiveBusinessIdState(null)
      }
    } catch (e) {
      console.error('Failed to load businesses', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshBusinesses()
  }, [refreshBusinesses])

  const setActiveBusinessId = useCallback((id: string) => {
    setActiveBusinessIdState(id)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, id)
  }, [])

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || null

  // Derive theme from active business brand_colors, falling back to defaults
  const theme: BrandColors = {
    ...DEFAULT_THEME,
    ...(activeBusiness?.brand_colors || {}),
  }

  // Apply theme to CSS vars so any component can use --color-primary etc.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.style.setProperty('--mb-primary', theme.primary || DEFAULT_THEME.primary!)
    root.style.setProperty('--mb-secondary', theme.secondary || DEFAULT_THEME.secondary!)
    root.style.setProperty('--mb-accent', theme.accent || DEFAULT_THEME.accent!)
    root.style.setProperty('--mb-background', theme.background || DEFAULT_THEME.background!)
    root.style.setProperty('--mb-text', theme.text || DEFAULT_THEME.text!)
  }, [theme])

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        activeBusinessId,
        setActiveBusinessId,
        refreshBusinesses,
        loading,
        theme,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within <BusinessProvider>')
  return ctx
}
