import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/discovery - Time-based event discovery
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    // Allow unauthenticated access - they can see all events without intents

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // 'all' | 'saved' | 'planning_to_attend'
    const category = searchParams.get('category') // 'Market' | 'Workshop' | 'Meetup' | 'Sports' | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Get user if authenticated, otherwise continue with empty intents
    const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } }
    const userId = user?.id

    // Calculate date ranges
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const endOfNextWeek = new Date(endOfWeek)
    endOfNextWeek.setDate(endOfWeek.getDate() + 7)

    // Get user's intents if authenticated
    let userIntents: Map<string, string[]> = new Map()
    if (userId) {
      let intentQuery = (supabase
        .from('user_event_bookmarks') as any)
        .select('market_day_id, intent_type')
        .eq('user_id', userId)

      if (filter === 'saved') {
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

    // Fetch market_days (Market events)
    // Only query if supabase client exists
    let marketDays: any[] = []
    if (supabase) {
      const marketDaysQuery = (supabase
        .from('market_days') as any)
        .select(`
          id,
          market_date,
          location_name,
          location_address,
          start_time,
          end_time,
          is_published
        `)
        .eq('is_published', true)
        .gte('market_date', startOfWeek.toISOString().split('T')[0])
        .lt('market_date', endOfNextWeek.toISOString().split('T')[0])
        .order('market_date', { ascending: true })

      const { data: marketDaysData, error: marketDaysError } = await marketDaysQuery

      if (marketDaysError) {
        console.error('[Discovery API] Market days query error:', marketDaysError)
        // Continue with empty array
      } else {
        marketDays = marketDaysData || []
      }
    }

    // Fetch events table (Workshop, Meetup, Sports, etc.)
    // Note: If events table doesn't exist, this will return empty array
    let events: any[] = []
    if (!category || category !== 'Market') {
      const eventsQuery = (supabase
        .from('events') as any)
        .select(`
          id,
          title,
          description,
          start_at,
          end_at,
          location,
          category,
          status,
          image_url,
          host_id,
          host_type
        `)
        .eq('status', 'published')
        .gte('start_at', startOfWeek.toISOString())
        .lt('start_at', endOfNextWeek.toISOString())
        .order('start_at', { ascending: true })

      // Filter by category if specified
      if (category) {
        eventsQuery.eq('category', category)
      }

      const { data: eventsData, error: eventsError } = await eventsQuery

      // If table doesn't exist, continue with empty array
      if (eventsError && eventsError.code !== 'PGRST116') {
        console.warn('[Discovery API] Events table query error:', eventsError)
      } else if (eventsData) {
        events = eventsData
      }
    }

    // Combine and normalize events
    const allEvents: any[] = []

    // Add market days
    if (marketDays) {
      marketDays.forEach((market: any) => {
        // Skip if filtering by category and not Market
        if (category && category !== 'Market') return

        const eventId = market.id
        const intents = userIntents.get(eventId) || []

        // Apply filter
        if (filter === 'saved' && !intents.includes('saved')) return
        if (filter === 'planning_to_attend' && !intents.includes('planning_to_attend')) return

        allEvents.push({
          id: eventId,
          event_type: 'market_day',
          title: `Market Day - ${market.location_name}`,
          description: null,
          start_at: `${market.market_date}T${market.start_time || '00:00:00'}`,
          end_at: `${market.market_date}T${market.end_time || '23:59:59'}`,
          location: market.location_name,
          location_address: market.location_address,
          category: 'Market',
          hosting_business: market.hosts ? {
            id: market.hosts.id,
            name: market.hosts.name,
            slug: market.hosts.slug,
            logo_url: market.hosts.logo_url,
          } : null,
          intents,
          market_date: market.market_date,
        })
      })
    }

    // Add events
    if (events) {
      // Get hosting business info for vendor-hosted events
      const vendorHostIds = events
        .filter((e: any) => e.host_type === 'vendor' && e.host_id)
        .map((e: any) => e.host_id)

      let vendorsMap = new Map()
      if (vendorHostIds.length > 0) {
        const { data: vendors } = await (supabase
          .from('vendors') as any)
          .select('id, name, slug, logo_url')
          .in('id', vendorHostIds)

        if (vendors) {
          vendors.forEach((v: any) => vendorsMap.set(v.id, v))
        }
      }

      events.forEach((event: any) => {
        const eventId = event.id
        const intents = userIntents.get(eventId) || []

        // Apply filter
        if (filter === 'saved' && !intents.includes('saved')) return
        if (filter === 'planning_to_attend' && !intents.includes('planning_to_attend')) return

        const hostingBusiness = event.host_type === 'vendor' && vendorsMap.has(event.host_id)
          ? {
            id: vendorsMap.get(event.host_id).id,
            name: vendorsMap.get(event.host_id).name,
            slug: vendorsMap.get(event.host_id).slug,
            logo_url: vendorsMap.get(event.host_id).logo_url,
          }
          : null

        allEvents.push({
          id: eventId,
          event_type: 'event',
          title: event.title,
          description: event.description,
          start_at: event.start_at,
          end_at: event.end_at,
          location: event.location,
          location_address: null,
          category: event.category || 'Event',
          hosting_business: hostingBusiness,
          intents,
        })
      })
    }

    // Sort chronologically
    allEvents.sort((a, b) => {
      const dateA = new Date(a.start_at).getTime()
      const dateB = new Date(b.start_at).getTime()
      return dateA - dateB
    })

    // Split into This Week and Next Week
    const thisWeekEvents = allEvents.filter((e: any) => {
      const eventDate = new Date(e.start_at)
      return eventDate >= startOfWeek && eventDate < endOfWeek
    })

    const nextWeekEvents = allEvents.filter((e: any) => {
      const eventDate = new Date(e.start_at)
      return eventDate >= endOfWeek && eventDate < endOfNextWeek
    })

    // Get offers for events (efficient batch query)
    // Only query if we have events and supabase client
    const eventIds = allEvents.map((e: any) => e.id)
    let offersByEvent = new Map()

    if (eventIds.length > 0 && supabase) {
      const { data: offers } = await (supabase
        .from('deals') as any)
        .select('id, title, description, event_id, vendor_id, valid_to, vendors(name, slug)')
        .in('event_id', eventIds)
        .eq('status', 'active')
        .gte('valid_to', now.toISOString())

      // Map offers to events
      if (offers) {
        offers.forEach((offer: any) => {
          if (!offersByEvent.has(offer.event_id)) {
            offersByEvent.set(offer.event_id, [])
          }
          offersByEvent.get(offer.event_id).push({
            id: offer.id,
            title: offer.title,
            description: offer.description,
            valid_to: offer.valid_to,
            business: offer.vendors ? {
              name: offer.vendors.name,
              slug: offer.vendors.slug,
            } : null,
          })
        })
      }
    }

    // Attach offers to events
    thisWeekEvents.forEach((event: any) => {
      event.offers = offersByEvent.get(event.id) || []
    })
    nextWeekEvents.forEach((event: any) => {
      event.offers = offersByEvent.get(event.id) || []
    })

    // Apply pagination (if needed)
    const paginatedThisWeek = thisWeekEvents.slice(offset, offset + limit)
    const paginatedNextWeek = nextWeekEvents.slice(offset, offset + limit)

    return NextResponse.json({
      thisWeek: {
        events: paginatedThisWeek,
        total: thisWeekEvents.length,
        hasMore: offset + limit < thisWeekEvents.length,
      },
      nextWeek: {
        events: paginatedNextWeek,
        total: nextWeekEvents.length,
        hasMore: offset + limit < nextWeekEvents.length,
      },
      page,
      limit,
    })
  } catch (error: any) {
    console.error('[GET /api/discovery] Error:', error)
    try {
      const fs = require('fs')
      fs.writeFileSync('discovery_error.log', (error?.message || error) + '\n' + (error?.stack || ''))
    } catch (e) {
      console.error('Failed to write log', e)
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
