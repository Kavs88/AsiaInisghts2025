'use server'

import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'

const _fetchMarketDayDetail = unstable_cache(
  async (id: string) => {
    const supabase = createPublicClient()
    const { data, error } = await (supabase
      .from('market_days') as any)
      .select('*, hosts(id, name, slug, logo_url)')
      .eq('id', id)
      .eq('is_published', true)
      .single()
    if (error || !data) return null
    return data
  },
  ['market-day-detail'],
  { revalidate: 1800, tags: ['market-days'] }
)

export async function getMarketDayDetail(id: string) {
  return _fetchMarketDayDetail(id)
}

const _fetchMarketDayStalls = unstable_cache(
  async (marketDayId: string) => {
    const supabase = createPublicClient()
    const { data } = await (supabase
      .from('market_stalls') as any)
      .select(`
        *,
        vendors(
          id, name, slug, tagline, logo_url, hero_image_url,
          category, is_verified, delivery_available, pickup_available
        )
      `)
      .eq('market_day_id', marketDayId)
      .eq('attending_physically', true)
    return data || []
  },
  ['market-day-stalls'],
  { revalidate: 1800, tags: ['market-days'] }
)

export async function getMarketDayStalls(marketDayId: string) {
  return _fetchMarketDayStalls(marketDayId)
}

const _fetchMarketDayOffers = unstable_cache(
  async (marketDayId: string, hostId: string) => {
    const supabase = createPublicClient()
    const { data } = await (supabase
      .from('deals') as any)
      .select('*, vendors(name, slug)')
      .or(`event_id.eq.${marketDayId},vendor_id.eq.${hostId}`)
      .eq('status', 'active')
      .gte('valid_to', new Date().toISOString())
      .limit(6)
    return data || []
  },
  ['market-day-offers'],
  { revalidate: 1800, tags: ['market-days', 'deals'] }
)

export async function getMarketDayOffers(marketDayId: string, hostId: string) {
  return _fetchMarketDayOffers(marketDayId, hostId)
}
