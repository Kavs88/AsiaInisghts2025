// 🔒 AUTH REDIRECT PATTERN LOCK
// DO NOT use router.push() or router.replace() for post-auth redirects
// DO NOT use intermediate routes (/admin, /vendors/...)
// REQUIRED: Use window.location.href for full page reload
// Reason: Ensures auth cookies are persisted before middleware executes

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Toast, { ToastType } from '@/components/ui/Toast'

/**
 * Simple login page that works for any user (not just vendors)
 * Use this if you're getting "account not recognized" errors
 */
export default function SimpleLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      const supabase = createClient()

      // Simple sign in - no vendor check
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('Failed to sign in')
      }

      setToast({
        message: 'Login successful! Redirecting...',
        type: 'success',
        visible: true,
      })

      // Check if user is admin and redirect accordingly
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      if ((userData as any)?.role === 'admin') {
        window.location.href = '/markets/admin'
      } else {
        // Check if they have a vendor profile
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('slug')
          .eq('user_id', data.user.id)
          .single()

        if (vendorData) {
          window.location.href = `/markets/sellers/${(vendorData as any).slug}`
        } else {
          // Regular user - go to home
          window.location.href = '/'
        }
      }
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
            <p className="text-neutral-600">Sign in to your account</p>
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
              {isSubmitting ? 'Signing in...' : 'Sign In'}
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





