import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/events/[id]/intent - Create or toggle event intent
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { intent_type } = await request.json()

    if (!intent_type || !['saved', 'planning_to_attend'].includes(intent_type)) {
      return NextResponse.json({ error: 'Invalid intent_type' }, { status: 400 })
    }

    const marketDayId = params.id

    // Check if intent already exists
    const { data: existing } = await (supabase
      .from('user_event_bookmarks') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('market_day_id', marketDayId)
      .eq('intent_type', intent_type)
      .single() as any

    if (existing) {
      // Remove intent (toggle off)
      const { error } = await (supabase
        .from('user_event_bookmarks') as any)
        .delete()
        .eq('id', existing.id)

      if (error) throw error

      return NextResponse.json({
        success: true,
        action: 'removed',
        intent_type
      })
    } else {
      // Create intent (toggle on)
      const { data, error } = await (supabase
        .from('user_event_bookmarks') as any)
        .insert({
          user_id: user.id,
          market_day_id: marketDayId,
          intent_type,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        action: 'added',
        intent_type,
        intent: data
      })
    }
  } catch (error: any) {
    console.error('[POST /api/events/[id]/intent] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// GET /api/events/[id]/intent - Get user's intent for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ intents: [] })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ intents: [] })
    }

    const marketDayId = params.id

    const { data, error } = await (supabase
      .from('user_event_bookmarks') as any)
      .select('intent_type')
      .eq('user_id', user.id)
      .eq('market_day_id', marketDayId)

    if (error) throw error

    const intents = (data || []).map((i: any) => i.intent_type)

    return NextResponse.json({ intents })
  } catch (error: any) {
    console.error('[GET /api/events/[id]/intent] Error:', error)
    return NextResponse.json({ intents: [] })
  }
}

