'use server'

import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EventVenue = {
  id: string
  address: string
  property_type: string | null
  capacity: number | null
  images: string[] | null
  hourly_rate: number | null
  contact_phone: string | null
  contact_email: string | null
}

export type MarketEventMeta = {
  theme: string | null
  expected_stalls: number | null
  featured_vendor_ids: string[]
  organiser_notes: string | null
}

export type EventDetail = {
  id: string
  title: string
  description: string | null
  event_type: string
  start_at: string
  end_at: string | null
  status: string
  property_id: string | null
  venue_name: string | null
  venue: EventVenue | null
  market_metadata: MarketEventMeta | null
}

export type MarketEvent = {
  id: string
  title: string
  event_type: 'market'
  start_at: string
  end_at: string | null
  status: string
  property_id: string | null
  venue_name: string | null
  venue: Pick<EventVenue, 'id' | 'address' | 'capacity'> | null
  market_metadata: Pick<MarketEventMeta, 'theme' | 'expected_stalls'> | null
}

// ---------------------------------------------------------------------------
// getEventById
// Full event detail for the event detail page.
// Joins venue property and market_metadata when present.
// Uses createClient (auth-aware) — the event may be a draft visible
// to a landlord (covered by RLS policy added in migration 033 Section 7).
// ---------------------------------------------------------------------------

export async function getEventById(id: string): Promise<EventDetail | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      event_type,
      start_at,
      end_at,
      status,
      property_id,
      venue_name,
      properties!events_property_id_fkey (
        id,
        address,
        property_type,
        capacity,
        images,
        hourly_rate,
        contact_phone,
        contact_email
      ),
      market_metadata (
        theme,
        expected_stalls,
        featured_vendor_ids,
        organiser_notes
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[getEventById] Error:', error)
    return null
  }

  if (!data) return null

  const row = data as any

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    event_type: row.event_type,
    start_at: row.start_at,
    end_at: row.end_at,
    status: row.status,
    property_id: row.property_id,
    venue_name: row.venue_name,
    venue: row.properties ?? null,
    market_metadata: row.market_metadata ?? null,
  }
}

// ---------------------------------------------------------------------------
// getMarketEvents
// Scoped to event_type = 'market'. Used by markets discovery and markets admin.
// Cached for public consumers. Pass { upcoming: true } to filter past events.
// ---------------------------------------------------------------------------

const _fetchMarketEvents = unstable_cache(
  async (upcoming: boolean, limit: number) => {
    const supabase = createPublicClient()
    const now = new Date().toISOString()

    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        event_type,
        start_at,
        end_at,
        status,
        property_id,
        venue_name,
        properties!events_property_id_fkey (
          id,
          address,
          capacity
        ),
        market_metadata (
          theme,
          expected_stalls
        )
      `)
      .eq('event_type', 'market')
      .eq('status', 'published')
      .order('start_at', { ascending: true })
      .limit(limit)

    if (upcoming) {
      query = query.gte('start_at', now)
    }

    const { data, error } = await query

    if (error) {
      console.error('[getMarketEvents] Error:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      event_type: 'market' as const,
      start_at: row.start_at,
      end_at: row.end_at,
      status: row.status,
      property_id: row.property_id,
      venue_name: row.venue_name,
      venue: row.properties ?? null,
      market_metadata: row.market_metadata ?? null,
    })) as MarketEvent[]
  },
  ['market-events-list'],
  { revalidate: 900, tags: ['events', 'market-events'] },
)

export async function getMarketEvents(options: {
  upcoming?: boolean
  limit?: number
} = {}): Promise<MarketEvent[]> {
  const { upcoming = true, limit = 20 } = options
  return _fetchMarketEvents(upcoming, limit)
}
