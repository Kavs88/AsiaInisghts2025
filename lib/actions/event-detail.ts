'use server'

import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'

const _fetchEventDetail = unstable_cache(
  async (id: string) => {
    const supabase = createPublicClient()
    const { data, error } = await (supabase
      .from('events') as any)
      .select(`
        *,
        hosting_business:host_id (
          id,
          name,
          slug,
          logo_url,
          is_verified
        ),
        participating_entities (
          role,
          entity:entity_id (
            id,
            name,
            slug,
            logo_url,
            trust_badges,
            confidence_score
          )
        )
      `)
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },
  ['event-detail'],
  { revalidate: 1800, tags: ['events'] }
)

export async function getPublicEventDetail(id: string) {
  return _fetchEventDetail(id)
}

const _fetchMarketDayForEvent = unstable_cache(
  async (id: string) => {
    const supabase = createPublicClient()
    const { data } = await (supabase
      .from('market_days') as any)
      .select('*, hosts:hosts (id, name, slug, logo_url)')
      .eq('id', id)
      .single()
    return data || null
  },
  ['market-day-for-event'],
  { revalidate: 1800, tags: ['market-days'] }
)

export async function getPublicMarketDayForEvent(id: string) {
  return _fetchMarketDayForEvent(id)
}

const _fetchEventReviewSummary = unstable_cache(
  async (subjectId: string, subjectType: string) => {
    const supabase = createPublicClient()
    const { data } = await (supabase
      .from('review_summaries') as any)
      .select('*')
      .eq('subject_id', subjectId)
      .eq('subject_type', subjectType)
      .maybeSingle()
    if (!data) return { averageRating: 0, totalReviews: 0 }
    return {
      averageRating: parseFloat(data.average_rating || '0'),
      totalReviews: data.total_reviews || 0,
    }
  },
  ['event-review-summary'],
  { revalidate: 1800, tags: ['reviews'] }
)

export async function getEventReviewSummary(subjectId: string, subjectType: string) {
  return _fetchEventReviewSummary(subjectId, subjectType)
}
