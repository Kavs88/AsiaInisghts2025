'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Handles recovery tokens from URL hash and redirects to reset password page
 * This runs on the root page to catch Supabase redirects
 */
export default function RecoveryTokenHandler() {
  const router = useRouter()
  const [isHandling, setIsHandling] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    // Don't redirect if already on reset password pages
    const currentPath = window.location.pathname
    if (currentPath.includes('/auth/reset-password')) {
      return // Already on reset password page, don't redirect
    }

    const handleRecoveryToken = () => {
      try {
        const hash = window.location.hash
        
        if (!hash || hash.length < 2) {
          return // No hash, nothing to do
        }

        const hashParams = new URLSearchParams(hash.substring(1))
        if (!hashParams) {
          return // Failed to parse hash
        }
        
        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')

        // If it's a recovery token and we're on root, redirect to reset password page
        if (type === 'recovery' && accessToken && currentPath === '/') {
          setIsHandling(true)
          
          // Redirect directly to manual reset page with the hash
          const resetUrl = `/auth/reset-password/manual${hash}`
          router.replace(resetUrl)
        }
      } catch (error) {
        console.error('Error handling recovery token:', error)
        // Silently fail - don't break the page
      }
    }

    // Check immediately
    handleRecoveryToken()

    // Also listen for hash changes (in case it's added after page load)
    window.addEventListener('hashchange', handleRecoveryToken)

    return () => {
      window.removeEventListener('hashchange', handleRecoveryToken)
    }
  }, [router])

  // Show loading state while redirecting
  if (isHandling) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Redirecting to password reset...</p>
        </div>
      </div>
    )
  }

  return null
}

