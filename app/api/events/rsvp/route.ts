import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/events/rsvp - Create or update RSVP
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id, market_day_id, status, notes, agreed_to_policy, attendee_count } = body

    if (!status || !['going', 'interested', 'not_going'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (!agreed_to_policy) {
      return NextResponse.json({ error: 'Policy agreement required' }, { status: 400 })
    }

    // Standardized on market_day_id only (use event_id as market_day_id if market_day_id not provided)
    const finalMarketDayId = market_day_id || event_id
    if (!finalMarketDayId) {
      return NextResponse.json({ error: 'market_day_id required' }, { status: 400 })
    }

    // Check if RSVP already exists
    const { data: existing } = await (supabase
      .from('user_event_rsvps') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('market_day_id', finalMarketDayId)
      .maybeSingle() as any

    const rsvpData: any = {
      user_id: user.id,
      market_day_id: finalMarketDayId,
      status,
      notes: notes || null,
      agreed_to_policy: agreed_to_policy,
      attendee_count: attendee_count || 1,
    }

    if (existing) {
      // Update existing RSVP (using composite PK)
      const { data, error } = await (supabase
        .from('user_event_rsvps') as any)
        .update(rsvpData as any)
        .eq('user_id', user.id)
        .eq('market_day_id', finalMarketDayId)
        .select()
        .single() as any

      if (error) throw error
      return NextResponse.json({ success: true, rsvp: data })
    } else {
      // Create new RSVP
      const { data, error } = await (supabase
        .from('user_event_rsvps') as any)
        .insert(rsvpData as any)
        .select()
        .single() as any

      if (error) throw error
      return NextResponse.json({ success: true, rsvp: data })
    }
  } catch (error: any) {
    console.error('[POST /api/events/rsvp] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/rsvp - Cancel RSVP
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id, market_day_id } = body

    // Standardized on market_day_id only
    const finalMarketDayId = market_day_id || event_id
    if (!finalMarketDayId) {
      return NextResponse.json({ error: 'market_day_id required' }, { status: 400 })
    }

    const { error } = await (supabase
      .from('user_event_rsvps') as any)
      .delete()
      .eq('user_id', user.id)
      .eq('market_day_id', finalMarketDayId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE /api/events/rsvp] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

