import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/my-events - Get user's saved and planned events
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const intentType = searchParams.get('type') // 'saved' | 'planning_to_attend' | null (all)

    // Get user's event intents
    let query = (supabase
      .from('user_event_bookmarks') as any)
      .select('market_day_id, intent_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (intentType && ['saved', 'planning_to_attend'].includes(intentType)) {
      query = query.eq('intent_type', intentType)
    }

    const { data: intents, error: intentsError } = await query

    if (intentsError) throw intentsError

    if (!intents || intents.length === 0) {
      return NextResponse.json({ events: [] })
    }

    // Get market day IDs (standardized on market_days only)
    const marketDayIds = [...new Set(intents.map((i: any) => i.market_day_id))]

    // Fetch from market_days table (standardized on market_days only)
    const { data: marketDaysData } = await (supabase
      .from('market_days') as any)
      .select('*')
      .in('id', marketDayIds)
      .eq('is_published', true)
      .order('market_date', { ascending: true })

    // Map with intent types
    const eventsMap = new Map()

    // Add market days
    if (marketDaysData) {
      marketDaysData.forEach((market: any) => {
        const marketIntents = intents.filter((i: any) => i.market_day_id === market.id)
        eventsMap.set(market.id, {
          ...market,
          event_type: 'market_day',
          title: `Market Day - ${market.location_name}`,
          start_at: `${market.market_date}T${market.start_time || '00:00:00'}`,
          end_at: `${market.market_date}T${market.end_time || '23:59:59'}`,
          intents: marketIntents.map((i: any) => i.intent_type),
        })
      })
    }

    const events = Array.from(eventsMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.start_at || a.market_date).getTime()
        const dateB = new Date(b.start_at || b.market_date).getTime()
        return dateA - dateB
      })

    return NextResponse.json({ events }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error: any) {
    console.error('[GET /api/my-events] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

