import { NextResponse } from 'next/server'
import { getUpcomingMarketDays } from '@/lib/supabase/queries'

export async function GET() {
  try {
    const markets = await getUpcomingMarketDays(1)
    const next = markets[0] ?? null
    return NextResponse.json({ market: next }, { headers: { 'Cache-Control': 'public, max-age=3600' } })
  } catch {
    return NextResponse.json({ market: null })
  }
}
