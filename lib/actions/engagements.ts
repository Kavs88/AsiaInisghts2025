'use server'

import { createClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// BUSINESS ENGAGEMENTS
// ─────────────────────────────────────────────

export async function toggleEngagement(
  businessId: string,
  type: 'recommend' | 'regular'
): Promise<{ active: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await (supabase as any)
    .from('business_engagements')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .eq('engagement_type', type)
    .maybeSingle()

  if (existing) {
    await (supabase as any)
      .from('business_engagements')
      .delete()
      .eq('id', existing.id)
    return { active: false }
  }

  await (supabase as any)
    .from('business_engagements')
    .insert({ user_id: user.id, business_id: businessId, engagement_type: type })
  return { active: true }
}

export async function getEngagementStatus(
  businessId: string
): Promise<{ isRecommended: boolean; isRegular: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isRecommended: false, isRegular: false }

  const { data } = await (supabase as any)
    .from('business_engagements')
    .select('engagement_type')
    .eq('user_id', user.id)
    .eq('business_id', businessId)

  const types = (data ?? []).map((r: any) => r.engagement_type)
  return {
    isRecommended: types.includes('recommend'),
    isRegular: types.includes('regular'),
  }
}

export async function getEngagementCounts(
  businessId: string
): Promise<{ recommend: number; regular: number }> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('business_engagement_counts')
    .select('engagement_type, count')
    .eq('business_id', businessId)

  const counts = { recommend: 0, regular: 0 }
  for (const row of data ?? []) {
    if (row.engagement_type === 'recommend') counts.recommend = Number(row.count)
    if (row.engagement_type === 'regular') counts.regular = Number(row.count)
  }
  return counts
}

export async function getUserEngagements(): Promise<{
  recommendations: any[]
  regulars: any[]
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { recommendations: [], regulars: [] }

  const { data } = await (supabase as any)
    .from('business_engagements')
    .select('engagement_type, businesses(id, name, slug, logo_url, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const recommendations: any[] = []
  const regulars: any[] = []
  for (const row of data ?? []) {
    if (row.engagement_type === 'recommend') recommendations.push(row.businesses)
    if (row.engagement_type === 'regular') regulars.push(row.businesses)
  }
  return { recommendations, regulars }
}

// ─────────────────────────────────────────────
// PROPERTY WATCHLIST
// ─────────────────────────────────────────────

export async function toggleWatchlist(
  propertyId: string
): Promise<{ watching: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await (supabase as any)
    .from('property_watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (existing) {
    await (supabase as any)
      .from('property_watchlist')
      .delete()
      .eq('id', existing.id)
    return { watching: false }
  }

  await (supabase as any)
    .from('property_watchlist')
    .insert({ user_id: user.id, property_id: propertyId })
  return { watching: true }
}

export async function getWatchlistStatus(propertyId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await (supabase as any)
    .from('property_watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .maybeSingle()

  return !!data
}

export async function getWatchlistCount(propertyId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('property_watchlist_counts')
    .select('count')
    .eq('property_id', propertyId)
    .maybeSingle()

  return Number(data?.count ?? 0)
}

export async function getUserWatchlist(): Promise<any[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await (supabase as any)
    .from('property_watchlist')
    .select('id, property_id, created_at, properties(id, address, type, price, images, property_type, bedrooms, bathrooms, capacity, is_verified, businesses(name, slug))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? [])
    .filter((r: any) => r.properties)
    .map((r: any) => ({ ...r.properties, watchlist_id: r.id, watchlist_created_at: r.created_at }))
}
