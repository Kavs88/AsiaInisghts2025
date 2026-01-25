'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Toast, { ToastType } from '@/components/ui/Toast'

export default function CustomResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  })

  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setToast({ message: '', type: 'info', visible: false })

    if (!email.trim() || !email.includes('@')) {
      setToast({ message: 'Please enter a valid email address', type: 'error', visible: true })
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Request password reset - Supabase will send email
      // We'll use a simple redirect that we can handle
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password/manual`,
      })

      if (error) {
        throw error
      }

      setToast({
        message: 'Password reset email sent! Check your inbox and click the link.',
        type: 'success',
        visible: true,
      })
      
      // Move to next step
      setStep('code')
    } catch (error: any) {
      console.error('Password reset error:', error)
      setToast({
        message: error.message || 'Failed to send reset email. Please try again.',
        type: 'error',
        visible: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndReset = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setToast({ message: '', type: 'info', visible: false })

    // Validate passwords
    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error', visible: true })
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters long', type: 'error', visible: true })
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Check if we have a session (from the email link)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Please click the link in your email first to verify your identity.')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        throw updateError
      }

      setToast({
        message: 'Password reset successful! Redirecting to login...',
        type: 'success',
        visible: true,
      })

      // Sign out and redirect to login
      await supabase.auth.signOut()
      
      setTimeout(() => {
        router.push('/auth/login?message=Password reset successful. Please sign in with your new password.')
      }, 2000)
    } catch (error: any) {
      console.error('Password update error:', error)
      setToast({
        message: error.message || 'Failed to reset password. Please make sure you clicked the link in your email.',
        type: 'error',
        visible: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Reset Password</h1>
            <p className="text-neutral-600">
              {step === 'email' && 'Enter your email to receive a reset link'}
              {step === 'code' && 'Click the link in your email, then set your new password'}
              {step === 'password' && 'Enter your new password'}
            </p>
          </div>

          {step === 'email' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-900 mb-2">
                  Email Address <span className="text-error-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <div className="space-y-6">
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <p className="text-sm text-primary-800 mb-2">
                  <strong>Step 1:</strong> Check your email ({email}) for a password reset link
                </p>
                <p className="text-sm text-primary-700 mb-4">
                  Click the link in the email. It will bring you back here to set your new password.
                </p>
                <p className="text-xs text-primary-600">
                  Don't see the email? Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      setStep('email')
                      setToast({ message: '', type: 'info', visible: false })
                    }}
                    className="underline font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                <p className="text-sm font-medium text-neutral-900 mb-2">After clicking the email link:</p>
                <p className="text-sm text-neutral-600">
                  You'll be redirected back here and can enter your new password below.
                </p>
              </div>

              <form onSubmit={handleVerifyAndReset} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-900 mb-2">
                    New Password <span className="text-error-600">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="At least 8 characters"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-900 mb-2">
                    Confirm Password <span className="text-error-600">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Login
            </Link>
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





