'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/contexts/AuthContext'
import { isAdminOrSuperUser } from '@/lib/auth/admin'
import { updateEvent, UpdateEventData } from '@/lib/actions/admin-crud'

export default function AdminEventEditPageClient() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [imageInput, setImageInput] = useState('')

  const [formData, setFormData] = useState<UpdateEventData>({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    ticket_price: null,
    ticket_url: '',
    max_attendees: null,
    category: '',
    images: [],
    is_published: false,
    is_active: true,
    organizer_id: '',
  })

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      if (authLoading) return
      if (!user) { router.push('/auth/login'); return }

      try {
        const adminStatus = await isAdminOrSuperUser()
        setIsAdminUser(adminStatus)
        setIsChecking(false)
        if (!adminStatus) return

        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: rawData, error: fetchError } = await (supabase as any)
          .from('events')
          .select('*')
          .eq('id', params.id as string)
          .single()
        const data = rawData as any

        if (fetchError) {
          setError(fetchError.message)
        } else {
          setEvent(data)
          setFormData({
            title: data.title || '',
            description: data.description || '',
            event_date: data.event_date || '',
            start_time: data.start_time || '',
            end_time: data.end_time || '',
            location: data.location || '',
            ticket_price: data.ticket_price ?? null,
            ticket_url: data.ticket_url || '',
            max_attendees: data.max_attendees ?? null,
            category: data.category || '',
            images: data.images || [],
            is_published: data.is_published ?? false,
            is_active: data.is_active ?? true,
            organizer_id: data.organizer_id || '',
          })
        }
      } catch (err: any) {
        setIsAdminUser(false)
        setIsChecking(false)
        setError(err.message)
      }
    }

    checkAdminAndLoad()
  }, [user, authLoading, router, params.id])

  const addImage = () => {
    const trimmed = imageInput.trim()
    if (!trimmed) return
    setFormData({ ...formData, images: [...(formData.images || []), trimmed] })
    setImageInput('')
  }

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: (formData.images || []).filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await updateEvent(params.id as string, formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/markets/admin/events'), 2000)
      } else {
        setError(result.error || 'Failed to update event')
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error updating event')
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

  if (!user) return null

  if (!isAdminUser) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Access Denied</h2>
            <p className="text-error-800 mb-4">You do not have admin privileges.</p>
            <Link href="/markets/admin/events" className="text-primary-600 hover:underline">← Back to Events</Link>
          </div>
        </div>
      </main>
    )
  }

  if (error && !event) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Event Not Found</h2>
            <p className="text-error-800 mb-4">{error}</p>
            <Link href="/markets/admin/events" className="text-primary-600 hover:underline">← Back to Events</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* GUARDRAIL: Admin form width constraint. All admin create/edit forms use max-w-4xl. */}
      <div className="container-custom max-w-4xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Edit Event</h1>
            <p className="text-neutral-600">{event?.title}</p>
          </div>
          <Link href="/markets/admin/events" className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors">
            ← Back to Events
          </Link>
        </div>

        {success && (
          <div className="mb-6 bg-success-50 border border-success-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success-900">Event Updated!</h3>
                <p className="text-success-700">Redirecting to events list...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 rounded-xl p-4">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8">
          <div className="space-y-8">
            {/* Event Details */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                    Event Title <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="event_date" className="block text-sm font-medium text-neutral-700 mb-2">
                    Event Date <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="event_date"
                    type="date"
                    required
                    value={formData.event_date || ''}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                    Category
                  </label>
                  <input
                    id="category"
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-neutral-700 mb-2">
                    Start Time <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="start_time"
                    type="time"
                    required
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-neutral-700 mb-2">
                    End Time
                  </label>
                  <input
                    id="end_time"
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                    Location <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="location"
                    type="text"
                    required
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="organizer_id" className="block text-sm font-medium text-neutral-700 mb-2">
                    Organizer ID <span className="text-neutral-500 text-xs">(UUID)</span>
                  </label>
                  <input
                    id="organizer_id"
                    type="text"
                    value={formData.organizer_id || ''}
                    onChange={(e) => setFormData({ ...formData, organizer_id: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
              </div>
            </div>

            {/* Tickets & Capacity */}
            <div className="border-t border-neutral-200 pt-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Tickets & Capacity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ticket_price" className="block text-sm font-medium text-neutral-700 mb-2">
                    Ticket Price (₱) <span className="text-neutral-500 text-xs">(blank = free)</span>
                  </label>
                  <input
                    id="ticket_price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.ticket_price ?? ''}
                    onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="max_attendees" className="block text-sm font-medium text-neutral-700 mb-2">
                    Max Attendees
                  </label>
                  <input
                    id="max_attendees"
                    type="number"
                    min={1}
                    value={formData.max_attendees ?? ''}
                    onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="ticket_url" className="block text-sm font-medium text-neutral-700 mb-2">
                    Ticket URL
                  </label>
                  <input
                    id="ticket_url"
                    type="url"
                    value={formData.ticket_url || ''}
                    onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published ?? false}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">Published</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Image URLs */}
            <div className="border-t border-neutral-200 pt-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Images</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button type="button" onClick={addImage} className="px-4 py-3 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors whitespace-nowrap">
                    Add URL
                  </button>
                </div>
                {(formData.images || []).length > 0 && (
                  <ul className="space-y-2">
                    {(formData.images || []).map((url, i) => (
                      <li key={i} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-2">
                        <span className="flex-1 text-sm text-neutral-700 truncate">{url}</span>
                        <button type="button" onClick={() => removeImage(i)} className="text-error-600 hover:text-error-700 text-sm">Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Event...' : 'Update Event'}
              </button>
              <Link href="/markets/admin/events" className="px-6 py-3 text-neutral-700 font-medium border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
