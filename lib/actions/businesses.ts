'use server'

import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { Database } from '@/types/database'
import { unstable_cache } from 'next/cache'

// We technically expect Business shape, but we are sourcing from Entities.
// We will map Entity -> Business to keep frontend compatible.
export type Business = {
    id: string
    name: string
    slug: string
    category: string
    description: string | null
    address: string | null
    logo_url: string | null
    cover_image_url?: string | null
    is_verified: boolean
    confidence_score: number | null
    created_at: string
    contact_phone?: string | null
    contact_email?: string | null
    website_url?: string | null
}

// unstable_cache defined at module level — created once, not re-instantiated per call.
// Arguments are serialised into the cache key automatically.
const _fetchBusinesses = unstable_cache(
    async (cat?: string, lim?: number, vetted?: boolean, featured?: boolean) => {
        // Use the cookie-free public client — unstable_cache runs outside request context
        // so cookies() from next/headers is not available here.
        const supabase = createPublicClient()

        let query = supabase
            .from('entities')
            .select('id, name, slug, tags, description, location_text, logo_url, confidence_score, last_verified_at, created_at')
            .eq('type', 'business')

        if (cat) {
            if (cat === 'setup') {
                const setupTags = ['visa', 'legal', 'banking', 'internet', 'health', 'transport', 'housing']
                query = query.filter('tags', 'ov', `{${setupTags.join(',')}}`)
            } else if (cat !== 'all') {
                query = query.contains('tags', [cat])
            }
        }

        if (vetted) query = query.gte('confidence_score', 90)
        if (featured) query = query.gte('confidence_score', 75)
        if (lim) query = query.limit(lim)

        const { data, error } = await query
            .order('confidence_score', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[getBusinesses] Error fetching entities:', error)
            return []
        }

        return data || []
    },
    ['businesses-list'],
    { revalidate: 1800, tags: ['businesses'] },
)

export async function getBusinesses(
    options: { category?: string; limit?: number; vettedOnly?: boolean; featuredOnly?: boolean } = {},
): Promise<Business[]> {
    const { category, limit, vettedOnly, featuredOnly } = options
    const data = await _fetchBusinesses(category, limit, vettedOnly, featuredOnly)

    return data.map((entity: any) => ({
        id: entity.id,
        name: entity.name,
        slug: entity.slug,
        category: entity.tags?.[0] || 'Local Business',
        description: entity.description,
        address: entity.location_text,
        logo_url: entity.logo_url,
        is_verified: !!entity.last_verified_at,
        confidence_score: entity.confidence_score,
        created_at: entity.created_at,
    }))
}

export async function getBusinessBySlug(slug: string) {
    const supabase = createPublicClient()

    const { data: entity, error: entityError } = await (supabase
        .from('entities') as any)
        .select('*, founder_tags(tag), founder_notes(note, visibility)')
        .eq('slug', slug)
        .maybeSingle()

    if (entityError || !entity) {
        console.error('[getBusinessBySlug] Error or not found in entities:', entityError?.message || 'Not found')
        return null
    }

    const typedEntity = entity as any
    const legacyBusinessId = typedEntity.legacy_business_id
    const legacyVendorId = typedEntity.legacy_vendor_id

    try {
        const promises = []

        if (legacyVendorId) {
            promises.push(
                supabase
                    .from('products')
                    .select('*')
                    .eq('vendor_id', legacyVendorId)
                    .eq('is_available', true)
                    .limit(12)
                    .then(({ data }) => ({ type: 'products', data: data || [] }))
            )
        }

        if (legacyBusinessId) {
            promises.push(
                (supabase
                    .from('events') as any)
                    .select('*')
                    .eq('host_id', legacyBusinessId)
                    .eq('host_type', 'business')
                    .eq('status', 'published')
                    .gte('end_at', new Date().toISOString())
                    .order('start_at', { ascending: true })
                    .then(({ data }: any) => ({ type: 'events', data: data || [] }))
            )

            promises.push(
                (supabase
                    .from('events') as any)
                    .select('id', { count: 'exact', head: true })
                    .eq('host_id', legacyBusinessId)
                    .eq('host_type', 'business')
                    .then(({ count }: any) => ({ type: 'activityStats', data: { hostedEventsCount: count || 0, isActiveThisMonth: (count || 0) > 0 } }))
            )

            promises.push(
                supabase
                    .from('properties')
                    .select('*')
                    .eq('business_id', legacyBusinessId)
                    .eq('is_active', true)
                    .limit(6)
                    .then(({ data }) => ({ type: 'properties', data: data || [] }))
            )
        }

        const results = await Promise.all(promises)

        return {
            ...typedEntity,
            id: typedEntity.id,
            category: typedEntity.tags?.[0] || 'Local Business',
            address: typedEntity.location_text,
            logo_url: typedEntity.logo_url,
            contact_phone: typedEntity.contact_info?.phone,
            contact_email: typedEntity.contact_info?.email,
            owner_id: typedEntity.owner_id,
            products: results.find(r => r.type === 'products')?.data || [],
            events: results.find(r => r.type === 'events')?.data || [],
            properties: results.find(r => r.type === 'properties')?.data || [],
            activityStats: results.find(r => r.type === 'activityStats')?.data || { hostedEventsCount: 0, isActiveThisMonth: false },
            legacy_vendor_id: legacyVendorId,
            legacy_business_id: legacyBusinessId,
        } as Business & { products: any[]; events: any[]; properties: any[]; activityStats: any }

    } catch (error) {
        console.error('[getBusinessBySlug] Error fetching linked data:', error)
        return {
            ...typedEntity,
            category: typedEntity.tags?.[0] || 'Local Business',
            address: typedEntity.location_text,
            products: [],
            events: [],
            properties: [],
            activityStats: { hostedEventsCount: 0, isActiveThisMonth: false },
        }
    }
}

export async function getBusinessReviewSummary(businessId: string) {
    const supabase = createPublicClient()
    try {
        const { data } = await (supabase
            .from('review_summaries') as any)
            .select('*')
            .eq('subject_id', businessId)
            .eq('subject_type', 'business')
            .maybeSingle()
        if (data) {
            return {
                averageRating: parseFloat(data.average_rating || '0'),
                totalReviews: data.total_reviews || 0,
            }
        }
        return { averageRating: 0, totalReviews: 0 }
    } catch {
        return { averageRating: 0, totalReviews: 0 }
    }
}

export async function getBusinessRecommendCount(slug: string) {
    const supabase = createPublicClient()
    try {
        const { data: entityRow } = await (supabase
            .from('entities') as any)
            .select('id')
            .eq('slug', slug)
            .maybeSingle()
        if (!entityRow?.id) return 0
        const { count } = await supabase
            .from('user_entity_signals')
            .select('id', { count: 'exact', head: true })
            .eq('entity_id', entityRow.id)
            .eq('signal_type', 'recommend')
        return count || 0
    } catch {
        return 0
    }
}

export async function getBusinessByOwnerId(ownerId: string) {
    const supabase = await createClient()
    const { data: rawData, error } = await (supabase as any)
        .from('entities')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('type', 'business')
        .single()

    if (error || !rawData) return null
    const data = rawData as any

    return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        category: data.tags?.[0] || 'Local Business',
        description: data.description,
        address: data.location_text,
        logo_url: data.logo_url,
        is_verified: !!data.last_verified_at,
        confidence_score: data.confidence_score,
        created_at: data.created_at,
    } as Business
}
