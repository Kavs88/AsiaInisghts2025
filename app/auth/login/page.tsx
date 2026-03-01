'use client'

// 🔒 AUTH REDIRECT PATTERN LOCK
// DO NOT use router.push() or router.replace() for post-auth redirects
// DO NOT use intermediate routes (/admin, /vendors/...)
// REQUIRED: Use window.location.href for full page reload
// Reason: Ensures auth cookies are persisted before middleware executes

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInUser } from '@/lib/auth/auth'
import Toast, { ToastType } from '@/components/ui/Toast'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setToast({ message: '', type: 'info', visible: false })

    // Validation
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setToast({ message: 'Please enter a valid email address', type: 'error', visible: true })
      setIsSubmitting(false)
      return
    }

    if (!formData.password) {
      setToast({ message: 'Please enter your password', type: 'error', visible: true })
      setIsSubmitting(false)
      return
    }

    try {
      const result = await signInUser(formData.email, formData.password)

      setToast({
        message: 'Login successful! Redirecting...',
        type: 'success',
        visible: true,
      })
      setIsRedirecting(true)

      // AUTH REDIRECT SAFETY NOTICE
      // --------------------------
      // Do NOT replace window.location.href with router.push().
      // Client-side navigation causes a race condition with middleware
      // before Supabase auth cookies are readable.
      //
      // This MUST remain a full page reload.
      // The delay ensures auth cookies are persisted before redirect.
      // See: AUTH_REDIRECT_QA.md and AUTH_REDIRECT_FIX_VERIFICATION.md

      // 1. Check for deep link redirect first (highest priority)
      const params = new URLSearchParams(window.location.search)
      const deepLink = params.get('redirect')

      // Determine redirect URL
      let redirectUrl = '/'

      if (deepLink && deepLink.startsWith('/')) {
        // Use deep link if present and valid (must be relative path for security)
        redirectUrl = deepLink
      } else {
        // Fallback to role-based defaults
        if (result.authority.isSuperUser || result.authority.effectiveRole === 'admin') {
          redirectUrl = '/markets/admin'
        } else if (result.authority.effectiveRole === 'vendor') {
          if (result.authority.hasVendorRecord && result.authority.vendorSlug) {
            // FIXED: Send vendors to dashboard, not public profile
            redirectUrl = '/markets/vendor/dashboard'
          } else {
            redirectUrl = '/markets/vendor/apply'
          }
        } else if (result.authority.effectiveRole === 'customer') {
          redirectUrl = '/account'
        }
      }

      // Wait for auth cookies to be fully persisted before redirect
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 1000)  // 1 second delay to ensure cookies are set
    } catch (error: any) {
      console.error('Login error:', error)
      setToast({
        message: error.message || 'Invalid email or password. Please try again.',
        type: 'error',
        visible: true,
      })
      setIsSubmitting(false)
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Sign In</h1>
            <p className="text-neutral-600">Welcome back to Asia Insights</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-900 mb-2">
                Email Address <span className="text-error-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-900 mb-2">
                Password <span className="text-error-600">*</span>
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? 'Redirecting...' : (isSubmitting ? 'Signing in...' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-sm">
              <Link href="/auth/reset-password/custom" className="text-primary-600 hover:text-primary-700 font-medium">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      </div>
    </main>
  )
}

