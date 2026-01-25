'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy reset password page - redirects to manual reset page
 * This handles old links that might point here
 */
export default function ResetPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to manual reset page if we have a hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        router.replace(`/auth/reset-password/manual${hash}`)
      } else {
        // No token, redirect to custom flow
        router.replace('/auth/reset-password/custom')
      }
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-600">Redirecting...</p>
      </div>
    </div>
  )
}
