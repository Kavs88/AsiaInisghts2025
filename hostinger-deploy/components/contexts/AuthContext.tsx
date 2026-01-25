'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { getCurrentVendor, signOutVendor } from '@/lib/auth/auth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Vendor {
  id: string
  slug: string
  name: string
  logo_url?: string | null
}

interface AuthContextType {
  user: User | null
  vendor: Vendor | null
  loading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

// Create context - using undefined as default is fine with proper checks in hooks
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Memoize refresh to prevent unnecessary re-renders
  const refresh = useCallback(async () => {
    try {
      // Check session first (faster than full vendor query)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setUser(null)
        setVendor(null)
        setLoading(false)
        return
      }

      // Fetch vendor if we have a user
      // Admin users might not have vendor records, which is OK
      const current = await getCurrentVendor()
      if (current) {
        setUser(current.user)
        setVendor(current.vendor)
      } else {
        // User exists but no vendor - could be admin or regular user
        setUser(session.user)
        setVendor(null)
      }
    } catch (error) {
      console.error('Error refreshing auth:', error)
      setUser(null)
      setVendor(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let maxTimeoutId: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null
    let subscription: { unsubscribe: () => void } | null = null
    
    // Set loading to false immediately to prevent blocking
    // Auth will be checked asynchronously
    setLoading(false)
    
    // Initial load - FAST: check session first, vendor later
    // Run asynchronously without blocking
    const initAuth = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          return
        }

        const supabase = createClient()
        
        // Add timeout to prevent hanging - reduced to 2 seconds
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 2000)
        )
        
        let sessionResult
        try {
          sessionResult = await Promise.race([sessionPromise, timeoutPromise])
        } catch (timeoutError) {
          // Silently fail - assume no session
          if (!mounted) return
          setUser(null)
          setVendor(null)
          return
        }
        
        const { data: { session }, error } = sessionResult as any
        
        if (!mounted) return
        
        if (error) {
          // Silently fail - assume no session
          setUser(null)
          setVendor(null)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          // Fetch vendor in background (non-blocking)
          // Admin users might not have vendor records, which is OK
          getCurrentVendor()
            .then(current => {
              if (mounted && current) {
                setVendor(current.vendor)
              } else if (mounted) {
                // No vendor record - could be admin user
                setVendor(null)
              }
            })
            .catch((err) => {
              // Vendor fetch failed, but user is still logged in (could be admin)
              if (mounted) {
                setVendor(null)
              }
            })
        } else {
          setUser(null)
          setVendor(null)
        }
      } catch (error) {
        // Silently fail - assume no session
        if (mounted) {
          setUser(null)
          setVendor(null)
        }
      }
    }

    // Set a maximum timeout to ensure we don't hang forever
    maxTimeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 3000) // 3 second absolute maximum
    
    // Run auth check asynchronously without blocking
    initAuth().catch(() => {
      // Silently handle any errors
    })

    // Listen for auth state changes (debounced to prevent excessive calls)
    // Only set up listener after initial auth check
    try {
      if (typeof window !== 'undefined') {
        const supabase = createClient()
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange(async (event: string) => {
          // Debounce rapid auth state changes
          if (timeoutId) clearTimeout(timeoutId)
          timeoutId = setTimeout(async () => {
            if (!mounted) return
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              await refresh()
            } else if (event === 'SIGNED_OUT') {
              setUser(null)
              setVendor(null)
              setLoading(false)
            }
          }, 100)
        })
        subscription = authSubscription
      }
    } catch (error) {
      // Silently fail - auth state listener is optional
    }

    return () => {
      mounted = false
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId)
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [refresh])

  const signOut = useCallback(async () => {
    try {
      await signOutVendor()
      setUser(null)
      setVendor(null)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }, [router])

  // Memoize context value to prevent unnecessary re-renders
  // Ensure value is always a plain object, never undefined or a function
  const value = useMemo<AuthContextType>(() => {
    return {
      user,
      vendor,
      loading,
      signOut,
      refresh,
    }
  }, [user, vendor, loading, signOut, refresh])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


