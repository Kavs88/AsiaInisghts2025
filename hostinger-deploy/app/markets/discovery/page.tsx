'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import EventCard from '@/components/ui/EventCard'
import Image from 'next/image'
import HubHero from '@/components/ui/HubHero'
import Link from 'next/link'

interface Event {
  id: string
  event_type: 'market_day' | 'event'
  title: string
  description?: string | null
  start_at: string
  end_at?: string
  location?: string | null
  location_address?: string | null
  category?: string
  image_url?: string | null
  hosting_business?: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
  } | null
  offers?: Array<{
    id: string
    title: string
    description?: string | null
    valid_to?: string | null
    business?: {
      name: string
      slug: string
    } | null
  }>
  intents?: string[]
}

interface DiscoveryResponse {
  thisWeek: {
    events: Event[]
    total: number
    hasMore: boolean
  }
  nextWeek: {
    events: Event[]
    total: number
    hasMore: boolean
  }
  page: number
  limit: number
}

export default function DiscoveryPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [thisWeekEvents, setThisWeekEvents] = useState<Event[]>([])
  const [nextWeekEvents, setNextWeekEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState<'all' | 'favourite' | 'planning_to_attend'>('all')
  const [category, setCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [upcomingMarkets, setUpcomingMarkets] = useState<any[]>([])

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') params.set('filter', filter)
        if (category) params.set('category', category)
        params.set('page', page.toString())
        params.set('limit', '50')

        const res = await fetch(`/api/discovery?${params.toString()}`)
        if (res.ok) {
          const data: DiscoveryResponse = await res.json()
          setThisWeekEvents(data.thisWeek.events)
          setNextWeekEvents(data.nextWeek.events)
          setHasMore(data.thisWeek.hasMore || data.nextWeek.hasMore)
        }
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [filter, category, page])

  // Load upcoming markets for the footer context
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('market_days')
          .select('*')
          .eq('is_published', true)
          .gte('market_date', new Date().toISOString().split('T')[0])
          .order('market_date', { ascending: true })
          .limit(4)

        if (data) {
          setUpcomingMarkets(data)
        }
      } catch (error) {
        console.error('Error loading markets:', error)
      }
    }
    loadMarkets()
  }, [])

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Market', label: 'Markets' },
    { value: 'Workshop', label: 'Workshops' },
    { value: 'Meetup', label: 'Meetups' },
    { value: 'Sports', label: 'Sports' },
  ]

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      {/* Hero Section - Unified Events Branding */}
      <HubHero
        title="Discover"
        subtitle="From artisan workshops to community meetups, find something extraordinary happening near you."
        imageUrl="/images/events-hero.png"
        variant="events"
      >
        <button
          onClick={() => {
            const content = document.getElementById('discovery-content')
            content?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="px-8 py-4 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Browse All Events
        </button>
        <Link
          href="/contact"
          className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all"
        >
          Host an Event
        </Link>
      </HubHero>

      {/* Discovery Content (Anchor for Hero) */}
      <div id="discovery-content" className="sr-only" aria-hidden="true" />

      {/* Filters */}
      <section className="bg-white border-b border-neutral-200 py-6 sticky top-16 lg:top-20 z-20">
        <div className="container-custom max-w-7xl">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Intent Filter */}
            {user && (
              <div className="flex items-center gap-2 border-r border-neutral-200 pr-4">
                <span className="text-sm font-medium text-neutral-700 mr-2">Show:</span>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${filter === 'all'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('favourite')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${filter === 'favourite'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                  Saved
                </button>
                <button
                  onClick={() => setFilter('planning_to_attend')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${filter === 'planning_to_attend'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                  Planning to Attend
                </button>
              </div>
            )}

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700 mr-2">Category:</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container-custom max-w-7xl py-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-neutral-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* This Week Section */}
            {thisWeekEvents.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">This Week</h2>
                    <p className="text-neutral-600">
                      {filter === 'planning_to_attend'
                        ? "Events you're planning to attend"
                        : filter === 'favourite'
                          ? 'Your saved events'
                          : 'Upcoming events this week'}
                    </p>
                  </div>
                  {thisWeekEvents.length > 6 && (
                    <span className="text-sm text-neutral-500">
                      {thisWeekEvents.length} events
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {thisWeekEvents.map((event: Event) => (
                    <EventCard key={event.id} {...event} />
                  ))}
                </div>
              </section>
            )}

            {/* Next Week Section */}
            {nextWeekEvents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Next Week</h2>
                    <p className="text-neutral-600">Events coming up next week</p>
                  </div>
                  {nextWeekEvents.length > 6 && (
                    <span className="text-sm text-neutral-500">
                      {nextWeekEvents.length} events
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nextWeekEvents.map((event: Event) => (
                    <EventCard key={event.id} {...event} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {thisWeekEvents.length === 0 && nextWeekEvents.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
                <svg className="w-20 h-20 mx-auto text-neutral-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Events Found</h2>
                <p className="text-neutral-600 mb-6">
                  Love discovering local creators? Check back later for more events.
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Show All Events
                  </button>
                )}
              </div>
            )}

            {/* Load More (if needed) */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-6 py-3 bg-white border border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Load More Events
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Explore Local Markets - Supportive footer context */}
      {upcomingMarkets.length > 0 && (
        <section className="py-20 lg:py-32 bg-white border-t border-neutral-200">
          <div className="container-custom max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">Explore Local Markets</h2>
                <p className="text-lg text-neutral-600">
                  Love discovering local creators? Don't miss our weekly artisan market days happening nearby.
                </p>
              </div>
              <Link
                href="/markets/market-days"
                className="inline-flex items-center gap-2 px-6 py-3 text-primary-600 hover:text-primary-700 font-bold text-lg hover:bg-primary-50 rounded-xl transition-all"
              >
                View Full Market Schedule
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingMarkets.map((market: any) => (
                <Link
                  key={market.id}
                  href={`/markets/market-days/${market.id}`}
                  className="group bg-neutral-50 rounded-2xl p-6 border border-neutral-100 hover:border-primary-200 hover:bg-white hover:shadow-soft transition-all"
                >
                  <div className="text-primary-600 font-bold text-sm mb-2">
                    {new Date(market.market_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {market.location_name}
                  </h3>
                  <div className="text-sm text-neutral-500 mb-4">
                    {market.start_time && market.end_time ? `${market.start_time.slice(0, 5)} - ${market.end_time.slice(0, 5)}` : 'Full Day'}
                  </div>
                  <div className="flex items-center text-primary-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Market Details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

