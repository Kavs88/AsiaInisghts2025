'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'
import { isAdminOrSuperUser } from '@/lib/auth/admin'
import Link from 'next/link'

export default function CreateMarketDayPageClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdMarketDay, setCreatedMarketDay] = useState<any>(null)

  const [formData, setFormData] = useState({
    market_date: '',
    location_name: '',
    location_address: '',
    start_time: '',
    end_time: '',
    is_published: false,
    host_id: '',
  })

  const [hosts, setHosts] = useState<any[]>([])
  const [loadingHosts, setLoadingHosts] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const adminStatus = await isAdminOrSuperUser()
        setIsAdminUser(adminStatus)
        setIsChecking(false)

        if (!adminStatus) {
          router.push('/admin')
          return
        }

        // Load hosts for dropdown
        setLoadingHosts(true)
        const { getAllHosts } = await import('@/lib/supabase/queries')
        const hostsList = await getAllHosts()
        setHosts(hostsList)
        setLoadingHosts(false)
      } catch (error: any) {
        console.error('[CreateMarketDay] Error:', error)
        setIsAdminUser(false)
        setIsChecking(false)
        setLoadingHosts(false)
      }
    }

    checkAdmin()
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      if (!formData.market_date || !formData.location_name) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('market_days')
        // @ts-ignore
        .insert({
          market_date: formData.market_date,
          location_name: formData.location_name,
          location_address: formData.location_address || null,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          is_published: formData.is_published,
          host_id: formData.host_id || null,
        } as any)
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess(true)
        setCreatedMarketDay(data)
      }
    } catch (err: any) {
      console.error('[CreateMarketDay] Error:', err)
      setError(err.message || 'Unexpected error creating market day')
    } finally {
      setLoading(false)
    }
  }


  if (authLoading || isChecking) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Checking admin access...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!user || !isAdminUser) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Access Denied</h2>
            <p className="text-error-800 mb-4">You do not have admin privileges.</p>
            <Link href="/admin/market-days" className="text-primary-600 hover:underline">
              ← Back to Market Days
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (success && createdMarketDay) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-success-50 border border-success-200 rounded-xl p-8 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-success-900">Market Day Created!</h2>
                  <p className="text-success-700">The market day has been successfully created.</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Market Day Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Date:</span>
                    <span className="font-medium text-neutral-900">
                      {new Date(createdMarketDay.market_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Location:</span>
                    <span className="font-medium text-neutral-900">{createdMarketDay.location_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Status:</span>
                    <span className="font-medium text-neutral-900">
                      {createdMarketDay.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/admin/market-days"
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                >
                  View All Market Days
                </Link>
                <Link
                  href={`/admin/market-days/${createdMarketDay.id}/edit`}
                  className="px-6 py-3 bg-neutral-100 text-neutral-900 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Edit Market Day
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">Create Market Day</h1>
              <p className="text-neutral-600">Create a new market day with venue information</p>
            </div>
            <Link
              href="/admin/market-days"
              className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              ← Back to Market Days
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-error-50 border border-error-200 rounded-xl p-4">
              <p className="text-sm text-error-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Market Date <span className="text-error-600">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.market_date}
                      onChange={(e) => setFormData({ ...formData, market_date: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Location Name <span className="text-error-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location_name}
                      onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                      placeholder="Riverside Park"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">Location Address</label>
                    <input
                      type="text"
                      value={formData.location_address}
                      onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                      placeholder="123 Main St, City, State"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">End Time</label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="is_published" className="text-sm font-medium text-neutral-900">
                      Publish immediately (visible on site)
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">Host / Venue</label>
                    {loadingHosts ? (
                      <div className="px-4 py-2 text-sm text-neutral-500">Loading hosts...</div>
                    ) : (
                      <select
                        value={formData.host_id}
                        onChange={(e) => setFormData({ ...formData, host_id: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">No host selected (optional)</option>
                        {hosts.map((host) => (
                          <option key={host.id} value={host.id}>
                            {host.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">
                      Select a host/venue for this market day. Create hosts in the admin dashboard first.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Market Day'}
                </button>
                <Link
                  href="/admin/market-days"
                  className="px-6 py-3 bg-neutral-100 text-neutral-900 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

