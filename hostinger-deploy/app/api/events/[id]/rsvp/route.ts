import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/events/[id]/rsvp - Get RSVP status and counts for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const eventId = params.id
    const { searchParams } = new URL(request.url)
    const marketDayId = searchParams.get('market_day_id')

    // Get user if authenticated
    let userId: string | null = null
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    }

    // Get event counts (public data) - standardized on market_day_id
    const marketDayIdForQuery = marketDayId || eventId // Use market_day_id if provided, otherwise use eventId as market_day_id
    
    const { data: countsData } = await (supabase
      .from('event_counts') as any)
      .select('going_count, interested_count, total_attendees')
      .eq('market_day_id', marketDayIdForQuery)
      .single() as any

    // Get user's RSVP if authenticated - standardized on market_day_id
    let userRSVP: any = null
    if (userId) {
      const { data: rsvpData } = await (supabase
        .from('user_event_rsvps') as any)
        .select('status, notes, attendee_count')
        .eq('user_id', userId)
        .eq('market_day_id', marketDayIdForQuery)
        .single() as any
      userRSVP = rsvpData
    }

    return NextResponse.json({
      status: userRSVP?.status || null,
      notes: userRSVP?.notes || null,
      goingCount: countsData?.going_count || 0,
      interestedCount: countsData?.interested_count || 0,
      totalAttendees: countsData?.total_attendees || 0,
    })
  } catch (error: any) {
    console.error('[GET /api/events/[id]/rsvp] Error:', error)
    // Return empty data on error (graceful degradation)
    return NextResponse.json({
      status: null,
      notes: null,
      goingCount: 0,
      interestedCount: 0,
      totalAttendees: 0,
    })
  }
}



