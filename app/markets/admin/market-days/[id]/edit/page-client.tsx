'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  marketDay: any
  marketDayId: string
  hosts: any[]
  eventSpaceProperties: any[]
}

// Format date for input (YYYY-MM-DD)
function formatDateForInput(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().split('T')[0]
}

// Format time for input (HH:MM)
function formatTimeForInput(timeStr: string | null): string {
  if (!timeStr) return ''
  return timeStr.substring(0, 5)
}

export default function EditMarketDayPageClient({ marketDay, marketDayId, hosts, eventSpaceProperties }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    market_date: formatDateForInput(marketDay.market_date),
    location_name: marketDay.location_name || '',
    location_address: marketDay.location_address || '',
    start_time: formatTimeForInput(marketDay.start_time),
    end_time: formatTimeForInput(marketDay.end_time),
    is_published: marketDay.is_published || false,
    host_id: marketDay.host_id || '',
    property_id: marketDay.property_id || '',
  })

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

      const { error: updateError } = await supabase
        .from('market_days')
        // @ts-ignore
        .update({
          market_date: formData.market_date,
          location_name: formData.location_name,
          location_address: formData.location_address || null,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          is_published: formData.is_published,
          host_id: formData.host_id || null,
          property_id: formData.property_id || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', marketDayId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/markets/admin/market-days')
        }, 2000)
      }
    } catch (err: any) {
      console.error('[EditMarketDay] Error:', err)
      setError(err.message || 'Unexpected error updating market day')
    } finally {
      setLoading(false)
    }
  }


  if (success) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-success-50 border border-success-200 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-success-900">Market Day Updated!</h2>
                  <p className="text-success-700">Redirecting to market days list...</p>
                </div>
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
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">Edit Market Day</h1>
              <p className="text-neutral-600">Update market day and venue information</p>
            </div>
            <Link
              href="/markets/admin/market-days"
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
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">Location Address</label>
                    <input
                      type="text"
                      value={formData.location_address}
                      onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
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
                      Publish (visible on site)
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">Host / Venue</label>
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
                    <p className="text-xs text-neutral-500 mt-1">
                      Select a host/venue for this market day. Create hosts in the admin dashboard first.
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">Venue Property</label>
                    <select
                        value={formData.property_id}
                        onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">No venue property (optional)</option>
                        {eventSpaceProperties.map((prop) => (
                          <option key={prop.id} value={prop.id}>
                            {prop.address}{prop.capacity ? ` (cap. ${prop.capacity})` : ''}
                          </option>
                        ))}
                      </select>
                    <p className="text-xs text-neutral-500 mt-1">
                      Link to an event space property. When set, the event will appear on the property's page and the trigger will auto-create an events record on publish.
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
                  {loading ? 'Updating...' : 'Update Market Day'}
                </button>
                <Link
                  href="/markets/admin/market-days"
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

