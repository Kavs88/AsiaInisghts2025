// 🔒 AUTH REDIRECT PATTERN LOCK
// DO NOT use router.push() or router.replace() for post-auth redirects
// DO NOT use intermediate routes (/admin, /vendors/...)
// REQUIRED: Use window.location.href for full page reload
// Reason: Ensures auth cookies are persisted before middleware executes

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpVendor } from '@/lib/auth/auth'
import Toast, { ToastType } from '@/components/ui/Toast'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    if (!formData.name.trim()) {
      setToast({ message: 'Please enter your vendor name', type: 'error', visible: true })
      setIsSubmitting(false)
      return
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setToast({ message: 'Please enter a valid email address', type: 'error', visible: true })
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters long', type: 'error', visible: true })
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error', visible: true })
      setIsSubmitting(false)
      return
    }

    try {
      const result = await signUpVendor(formData)

      setToast({
        message: 'Account created successfully! Redirecting...',
        type: 'success',
        visible: true,
      })
      setIsRedirecting(true)

      // Redirect to vendor profile immediately
      window.location.href = `/markets/sellers/${result.vendor.slug}`
    } catch (error: any) {
      console.error('Sign up error:', error)
      setToast({
        message: error.message || 'Failed to create account. Please try again.',
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
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create Vendor Account</h1>
            <p className="text-neutral-600">Sign up to start selling at AI Markets</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-900 mb-2">
                Vendor Name <span className="text-error-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Your Vendor Name"
                disabled={isSubmitting}
              />
            </div>

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
                placeholder="At least 8 characters"
                disabled={isSubmitting}
              />
              <p className="text-xs text-neutral-500 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-900 mb-2">
                Confirm Password <span className="text-error-600">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? 'Redirecting...' : (isSubmitting ? 'Creating Account...' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
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

