'use server'

import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'

const _fetchVendorBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
    if (error) throw error
    return data || null
  },
  ['vendor-by-slug'],
  { revalidate: 1800, tags: ['vendors'] }
)

export async function getVendorBySlug(slug: string) {
  return _fetchVendorBySlug(slug)
}

export async function getVendorPortfolio(vendorId: string) {
  const supabase = createPublicClient()
  const { data, error } = await (supabase
    .from('vendor_portfolio') as any)
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(24)
  if (error) throw error
  return data || []
}

export async function getVendorEvents(vendorId: string) {
  const supabase = createPublicClient()
  const { data } = await (supabase
    .from('events') as any)
    .select('*')
    .or(`vendor_id.eq.${vendorId},and(host_id.eq.${vendorId},host_type.eq.vendor)`)
    .eq('status', 'published')
    .gte('end_at', new Date().toISOString())
    .order('start_at', { ascending: true })
  return data || []
}

export async function getVendorDeals(vendorId: string) {
  const supabase = createPublicClient()
  const { data } = await (supabase
    .from('deals') as any)
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('status', 'active')
    .gte('valid_to', new Date().toISOString())
    .order('valid_to', { ascending: true })
  return data || []
}

export async function getVendorActivityStats(vendorId: string) {
  const supabase = createPublicClient()
  try {
    const { data } = await (supabase
      .from('market_stalls') as any)
      .select('market_day_id, market_days!inner(market_date)')
      .eq('vendor_id', vendorId)
    const pastMarkets = (data || []).filter(
      (stall: any) => new Date(stall.market_days.market_date) < new Date()
    ).length
    const { count: totalEvents } = await (supabase
      .from('events') as any)
      .select('id', { count: 'exact', head: true })
      .or(`vendor_id.eq.${vendorId},and(host_id.eq.${vendorId},host_type.eq.vendor)`)
    return {
      pastMarkets,
      totalEvents: totalEvents || 0,
      isActiveThisMonth: pastMarkets > 0 || (totalEvents || 0) > 0,
    }
  } catch {
    return { pastMarkets: 0, totalEvents: 0, isActiveThisMonth: false }
  }
}
