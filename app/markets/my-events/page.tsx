'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/contexts/AuthContext'
import EmptyState from '@/components/ui/EmptyState'
import { Calendar } from 'lucide-react'

interface Event {
  id: string
  event_type: 'event' | 'market_day'
  title: string
  description?: string | null
  start_at: string
  end_at?: string
  market_date?: string
  location_name?: string
  location?: string
  intents: string[]
}

export default function MyEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'saved' | 'planning_to_attend'>('all')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const loadEvents = async () => {
      setError(null)
      try {
        const url = filter === 'all'
          ? '/api/my-events'
          : `/api/my-events?type=${filter}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setEvents(data.events || [])
        } else {
          setError('Failed to load events. Please try again.')
        }
      } catch (error) {
        console.error('Error loading events:', error)
        setError('Unable to load events. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user, filter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <main id="main-content" className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-7xl">
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">My Events</h1>
            <p className="text-neutral-600 mb-6">Please sign in to view your saved and planned events.</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main id="main-content" className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-7xl">
          <div className="animate-pulse">
            <div className="h-10 bg-neutral-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-neutral-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  const savedEvents = events.filter(e => e.intents.includes('saved'))
  const attendingEvents = events.filter(e => e.intents.includes('planning_to_attend'))

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50 py-12">
      <div className="container-custom max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">My Events</h1>
          <p className="text-lg text-neutral-600">Your saved and planned events</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-neutral-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilter('saved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === 'saved'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
          >
            Saved ({savedEvents.length})
          </button>
          <button
            onClick={() => setFilter('planning_to_attend')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === 'planning_to_attend'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
          >
            Planning to Attend ({attendingEvents.length})
          </button>
        </div>

        {/* Events List */}
        {error ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
            <svg className="w-20 h-20 mx-auto text-neutral-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Unable to Load Events</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
            >
              Try Again
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-neutral-400" />}
            title="No Events Yet"
            description={filter === 'all'
              ? "Keep track of your weekend. Save events you love and they'll appear here."
              : filter === 'saved'
                ? "You haven't saved any events yet."
                : "You aren't planning to attend any events yet."}
            action={{
              label: "Browse Events",
              href: "/markets/market-days"
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg font-semibold text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.start_at || event.market_date || '')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {event.intents.includes('saved') && (
                        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      {event.intents.includes('planning_to_attend') && (
                        <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  {(event.location_name || event.location) && (
                    <p className="text-sm text-neutral-500 flex items-center gap-1.5 mb-4">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location_name || event.location}
                    </p>
                  )}

                  <Link
                    href={`/markets/events/${event.id}`}
                    className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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

