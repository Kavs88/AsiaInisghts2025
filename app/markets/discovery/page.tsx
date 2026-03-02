import { createClient } from '@/lib/supabase/server'
import EventCard from '@/components/ui/EventCard'
import HubHero from '@/components/ui/HubHero'
import Link from 'next/link'
import DiscoveryCategorySelect from './DiscoveryCategorySelect'

export const revalidate = 300

const PAGE_SIZE = 12

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
    business?: { name: string; slug: string } | null
  }>
  intents?: string[]
}

function buildUrl(params: { filter: string; category: string; page: number }) {
  const p = new URLSearchParams()
  if (params.filter && params.filter !== 'all') p.set('filter', params.filter)
  if (params.category) p.set('category', params.category)
  if (params.page > 1) p.set('page', String(params.page))
  const qs = p.toString()
  return `/markets/discovery${qs ? `?${qs}` : ''}`
}

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const filter = (
    typeof searchParams.filter === 'string' ? searchParams.filter : 'all'
  ) as 'all' | 'favourite' | 'planning_to_attend'

  const offset = (page - 1) * PAGE_SIZE

  // Server-side auth — drives hero personalisation and intent-filtered views
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  // Date ranges — mirrors existing API route exactly
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  const endOfNextWeek = new Date(endOfWeek)
  endOfNextWeek.setDate(endOfWeek.getDate() + 180) // 6 months to capture all seeded events

  // Fetch user intent bookmarks when auth filter is active
  const userIntents: Map<string, string[]> = new Map()
  if (userId) {
    let intentQuery = (supabase.from('user_event_bookmarks') as any)
      .select('market_day_id, intent_type')
      .eq('user_id', userId)

    if (filter === 'favourite') {
      intentQuery = intentQuery.eq('intent_type', 'saved')
    } else if (filter === 'planning_to_attend') {
      intentQuery = intentQuery.eq('intent_type', 'planning_to_attend')
    }

    const { data: intents } = await intentQuery
    if (intents) {
      intents.forEach((intent: any) => {
        if (!userIntents.has(intent.market_day_id)) {
          userIntents.set(intent.market_day_id, [])
        }
        userIntents.get(intent.market_day_id)!.push(intent.intent_type)
      })
    }
  }

  // Fetch market_days and events in parallel
  const [marketDaysResult, eventsResult] = await Promise.allSettled([
    (async () => {
      const { data, error } = await (supabase.from('market_days') as any)
        .select('id, market_date, location_name, location_address, start_time, end_time, is_published')
        .eq('is_published', true)
        .gte('market_date', startOfWeek.toISOString().split('T')[0])
        .lt('market_date', endOfNextWeek.toISOString().split('T')[0])
        .order('market_date', { ascending: true })
      if (error) {
        console.error('[Discovery] Market days query error:', error)
        return []
      }
      return data || []
    })(),
    (async () => {
      if (category === 'Market') return []
      const q = (supabase.from('events') as any)
        .select('id, title, description, start_at, end_at, location, category, status, image_url, host_id, host_type')
        .eq('status', 'published')
        .gte('start_at', startOfWeek.toISOString())
        .lt('start_at', endOfNextWeek.toISOString())
        .order('start_at', { ascending: true })
      if (category) q.eq('category', category)
      const { data, error } = await q
      if (error && error.code !== 'PGRST116') {
        console.warn('[Discovery] Events query error:', error)
        return []
      }
      return data || []
    })(),
  ])

  const marketDays = marketDaysResult.status === 'fulfilled' ? marketDaysResult.value : []
  const rawEvents = eventsResult.status === 'fulfilled' ? eventsResult.value : []

  // Combine and normalise
  const allEvents: any[] = []

  // Add market days
  marketDays.forEach((market: any) => {
    if (category && category !== 'Market') return
    const intents = userIntents.get(market.id) || []
    if (filter === 'favourite' && !intents.includes('saved')) return
    if (filter === 'planning_to_attend' && !intents.includes('planning_to_attend')) return

    allEvents.push({
      id: market.id,
      event_type: 'market_day',
      title: `Market Day - ${market.location_name}`,
      description: null,
      start_at: `${market.market_date}T${market.start_time || '00:00:00'}`,
      end_at: `${market.market_date}T${market.end_time || '23:59:59'}`,
      location: market.location_name,
      location_address: market.location_address,
      category: 'Market',
      hosting_business: null,
      intents,
    })
  })

  // Resolve vendor hosts for events
  const vendorHostIds = rawEvents
    .filter((e: any) => e.host_type === 'vendor' && e.host_id)
    .map((e: any) => e.host_id)

  const vendorsMap = new Map()
  if (vendorHostIds.length > 0) {
    const { data: vendors } = await (supabase.from('vendors') as any)
      .select('id, name, slug, logo_url')
      .in('id', vendorHostIds)
    if (vendors) vendors.forEach((v: any) => vendorsMap.set(v.id, v))
  }

  // Add events
  rawEvents.forEach((event: any) => {
    const intents = userIntents.get(event.id) || []
    if (filter === 'favourite' && !intents.includes('saved')) return
    if (filter === 'planning_to_attend' && !intents.includes('planning_to_attend')) return

    const hosting_business =
      event.host_type === 'vendor' && vendorsMap.has(event.host_id)
        ? { ...vendorsMap.get(event.host_id) }
        : null

    allEvents.push({
      id: event.id,
      event_type: 'event',
      title: event.title,
      description: event.description,
      start_at: event.start_at,
      end_at: event.end_at,
      location: event.location,
      location_address: null,
      category: event.category || 'Event',
      image_url: event.image_url,
      hosting_business,
      intents,
    })
  })

  // Sort chronologically
  allEvents.sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )

  // Split into This Week / Upcoming
  const thisWeekAll = allEvents.filter((e) => {
    const d = new Date(e.start_at)
    return d >= startOfWeek && d < endOfWeek
  })
  const nextWeekAll = allEvents.filter((e) => {
    const d = new Date(e.start_at)
    return d >= endOfWeek && d < endOfNextWeek
  })

  // Apply page-level slicing
  const thisWeekPaged = thisWeekAll.slice(offset, offset + PAGE_SIZE)
  const nextWeekPaged = nextWeekAll.slice(offset, offset + PAGE_SIZE)

  // Batch-fetch offers for visible events only
  const pageEventIds = [...thisWeekPaged, ...nextWeekPaged].map((e) => e.id)
  const offersByEvent = new Map()
  if (pageEventIds.length > 0) {
    const { data: offers } = await (supabase.from('deals') as any)
      .select('id, title, description, event_id, valid_to, vendors(name, slug)')
      .in('event_id', pageEventIds)
      .eq('status', 'active')
      .gte('valid_to', now.toISOString())
    if (offers) {
      offers.forEach((offer: any) => {
        if (!offersByEvent.has(offer.event_id)) offersByEvent.set(offer.event_id, [])
        offersByEvent.get(offer.event_id).push({
          id: offer.id,
          title: offer.title,
          description: offer.description,
          valid_to: offer.valid_to,
          business: offer.vendors
            ? { name: offer.vendors.name, slug: offer.vendors.slug }
            : null,
        })
      })
    }
  }

  const thisWeekEvents: Event[] = thisWeekPaged.map((e) => ({
    ...e,
    offers: offersByEvent.get(e.id) || [],
  }))
  const nextWeekEvents: Event[] = nextWeekPaged.map((e) => ({
    ...e,
    offers: offersByEvent.get(e.id) || [],
  }))

  const hasMore =
    offset + PAGE_SIZE < thisWeekAll.length ||
    offset + PAGE_SIZE < nextWeekAll.length
  const hasPrev = page > 1

  // Upcoming markets for footer
  const { data: upcomingMarkets } = await (supabase.from('market_days') as any)
    .select('id, market_date, location_name, start_time, end_time')
    .eq('is_published', true)
    .gte('market_date', now.toISOString().split('T')[0])
    .order('market_date', { ascending: true })
    .limit(4)

  // Hero copy — personalised server-side
  const heroTitle = user
    ? `Welcome Back, ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'Regular'}`
    : 'Discover'
  const heroSubtitle = user
    ? "The community is active. Here's what's happening based on your interests."
    : 'From artisan workshops to community meetups, find something extraordinary happening near you.'

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <HubHero
        title={heroTitle}
        subtitle={heroSubtitle}
        imageUrl="/images/events-hero.jpg"
        variant="events"
        className="min-h-fit"
        contentClassName="py-12 lg:py-20"
        titleClassName="text-4xl lg:text-6xl"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Native anchor — smooth scroll via CSS scroll-behavior, zero JS */}
          <a
            href="#discovery-content"
            className="px-8 py-4 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-md hover:shadow-xl"
          >
            {user ? 'View Feed' : 'Browse All Events'}
          </a>
          {!user && (
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all"
            >
              Host an Event
            </Link>
          )}
          {user && (
            <Link
              href={buildUrl({ filter: 'favourite', category, page: 1 })}
              className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg"
            >
              My Saved Events
            </Link>
          )}
        </div>
      </HubHero>

      {/* Discovery Content anchor */}
      <div id="discovery-content" className="sr-only" aria-hidden="true" />

      {/* Filters */}
      <section className="bg-white border-b border-neutral-200 py-4 sticky top-16 lg:top-20 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Intent Filter — auth-gated, Link-based (no JS) */}
            {user && (
              <div className="flex items-center gap-2 border-r border-neutral-200 pr-4">
                <span className="text-sm font-medium text-neutral-700 mr-2">Show:</span>
                {(
                  [
                    { value: 'all', label: 'All' },
                    { value: 'favourite', label: 'Saved' },
                    { value: 'planning_to_attend', label: 'Planning to Attend' },
                  ] as const
                ).map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ filter: opt.value, category, page: 1 })}
                    className={`px-4 py-3 text-sm font-medium rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                      filter === opt.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Category Filter — minimal client island for onChange navigation */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700 mr-2">Category:</span>
              <DiscoveryCategorySelect
                currentCategory={category}
                currentFilter={filter}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div
        className="max-w-7xl mx-auto px-6 lg:px-8 py-12 animate-fade-up"
        style={{ animationDelay: '200ms' }}
      >
        <>
          {/* This Week */}
          {thisWeekEvents.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
                    This Week
                  </h2>
                  <p className="text-neutral-600">
                    {filter === 'planning_to_attend'
                      ? "Events you're planning to attend"
                      : filter === 'favourite'
                        ? 'Your saved events'
                        : 'Upcoming events this week'}
                  </p>
                </div>
                {thisWeekAll.length > PAGE_SIZE && (
                  <span className="text-sm text-neutral-500">
                    {thisWeekAll.length} events
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {thisWeekEvents.map((event, idx) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    priority={page === 1 && idx === 0}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {nextWeekEvents.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
                    Upcoming
                  </h2>
                  <p className="text-neutral-600">Events coming up soon</p>
                </div>
                {nextWeekAll.length > PAGE_SIZE && (
                  <span className="text-sm text-neutral-500">
                    {nextWeekAll.length} events
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nextWeekEvents.map((event, idx) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    priority={page === 1 && thisWeekEvents.length === 0 && idx === 0}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {thisWeekEvents.length === 0 && nextWeekEvents.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200/60 shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Events Found</h2>
              <p className="text-neutral-600 mb-6">
                Love discovering local creators? Check back later for more events.
              </p>
              {filter !== 'all' && (
                <Link
                  href={buildUrl({ filter: 'all', category, page: 1 })}
                  className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all duration-300 inline-flex items-center mx-auto"
                >
                  Show All Events
                </Link>
              )}
            </div>
          )}

          {/* URL-based pagination — replaces infinite scroll / Load More state */}
          {(hasPrev || hasMore) && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {hasPrev && (
                <Link
                  href={buildUrl({ filter, category, page: page - 1 })}
                  className="px-6 py-3 bg-white border border-neutral-200 text-neutral-700 font-semibold rounded-2xl hover:bg-neutral-50 transition-all duration-300"
                >
                  ← Previous
                </Link>
              )}
              {hasMore && (
                <Link
                  href={buildUrl({ filter, category, page: page + 1 })}
                  className="px-6 py-3 bg-white border border-neutral-200 text-neutral-700 font-semibold rounded-2xl hover:bg-neutral-50 transition-all duration-300"
                >
                  Load More Events
                </Link>
              )}
            </div>
          )}
        </>
      </div>

      {/* Explore Local Markets — footer context */}
      {upcomingMarkets && upcomingMarkets.length > 0 && (
        <section className="py-12 bg-white border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                  Explore Local Markets
                </h2>
                <p className="text-lg text-neutral-600">
                  Love discovering local creators? Don't miss our weekly artisan market days
                  happening nearby.
                </p>
              </div>
              <Link
                href="/markets/market-days"
                className="inline-flex items-center gap-2 px-6 py-3 text-primary-600 hover:text-primary-700 font-bold text-lg hover:bg-primary-50 rounded-2xl transition-all duration-300"
              >
                View Full Market Schedule
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingMarkets.map((market: any) => (
                <Link
                  key={market.id}
                  href={`/markets/market-days/${market.id}`}
                  className="group bg-neutral-50 rounded-2xl p-6 border border-neutral-100 hover:border-primary-200 hover:bg-white hover:shadow-xl transition-all"
                >
                  <div className="text-primary-600 font-bold text-sm mb-2">
                    {new Date(market.market_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {market.location_name}
                  </h3>
                  <div className="text-sm text-neutral-500 mb-4">
                    {market.start_time && market.end_time
                      ? `${market.start_time.slice(0, 5)} - ${market.end_time.slice(0, 5)}`
                      : 'Full Day'}
                  </div>
                  <div className="flex items-center text-primary-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Market Details
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
