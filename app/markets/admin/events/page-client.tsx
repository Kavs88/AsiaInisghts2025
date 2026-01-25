'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'
import Link from 'next/link'

export default function AdminEventsPageClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error: eventsError } = await supabase
          .from('events')
          .select('*, users:organizer_id(full_name, email)')
          .order('event_date', { ascending: false })
          .order('start_time', { ascending: false })
          .limit(100)

        if (eventsError) {
          setError(eventsError.message)
        } else {
          setEvents(data || [])
        }
      } catch (err: any) {
        console.error('[AdminEvents] Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading events...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <p className="text-error-700 font-medium">Error: {error}</p>
          </div>
        </div>
      </main>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Events</h1>
            <p className="text-neutral-600">Shape the community calendar</p>
          </div>
          <Link
            href="/markets/admin/events/create"
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            + Add Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <p className="text-neutral-600">No events found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-neutral-900">{event.title}</h3>
                      {event.is_published ? (
                        <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs font-semibold">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs font-semibold">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 mb-3">{event.description || 'No description'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      <span>📅 {formatDate(event.event_date)}</span>
                      <span>🕐 {formatTime(event.start_time)}</span>
                      {event.end_time && <span>→ {formatTime(event.end_time)}</span>}
                      <span>📍 {event.location}</span>
                      {event.ticket_price && <span>💰 ${event.ticket_price}</span>}
                    </div>
                    {event.users && (
                      <p className="text-sm text-neutral-600 mt-2">
                        Organizer: {event.users.full_name || event.users.email}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/markets/admin/events/${event.id}/edit`}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-semibold"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}






