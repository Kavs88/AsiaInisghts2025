'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export type Business = Database['public']['Tables']['businesses']['Row']

export async function getBusinesses(category?: string, limit?: number) {
    const supabase = await createClient()
    if (!supabase) {
        console.error('[getBusinesses] Supabase client not available')
        return []
    }

    // Optimize: Select only needed fields instead of *
    let query = supabase
        .from('businesses')
        .select('id, name, slug, category, description, address, logo_url, is_verified, created_at')
        .eq('is_active', true)

    if (category) {
        query = query.eq('category', category)
    }

    if (limit) {
        query = query.limit(limit)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('[getBusinesses] Error fetching businesses:', error)
        return []
    }

    return (data || []) as Business[]
}

export async function getBusinessBySlug(slug: string) {
    const supabase = await createClient()
    if (!supabase) {
        console.error('[getBusinessBySlug] Supabase client not available')
        return null
    }

    console.log('[getBusinessBySlug] Fetching business with slug:', slug)

    // 1. Fetch the business record - select only needed fields
    const { data: biz, error: bizError } = await supabase
        .from('businesses')
        .select('id, name, slug, category, description, address, logo_url, is_verified, contact_phone, contact_email, website_url, owner_id, created_at, updated_at')
        .eq('slug', slug)
        .maybeSingle()

    if (bizError || !biz) {
        console.error('[getBusinessBySlug] Error or not found:', bizError?.message || 'Not found')
        return null
    }

    const business = biz as Business

    // 2. Fetch linked data in parallel (Events, Products via Vendors, and Deals)
    try {
        // Fetch vendors owned by this business
        const { data: vendors } = await supabase
            .from('vendors')
            .select('id')
            .eq('business_id', business.id)

        const vendorIds = (vendors as { id: string }[] | null)?.map(v => v.id) || []

        const [events, products, deals, activityStats] = await Promise.all([
            // Events hosted by business or its vendors
            supabase
                .from('events')
                .select('*')
                .or(`host_id.eq.${business.id},and(host_type.eq.business)${vendorIds.length > 0 ? `,vendor_id.in.(${vendorIds.join(',')})` : ''}`)
                .eq('status', 'published')
                .gte('end_at', new Date().toISOString())
                .order('start_at', { ascending: true })
                .then(({ data }) => data || []),

            // Products via its vendors
            vendorIds.length > 0 ?
                supabase
                    .from('products')
                    .select('*')
                    .in('vendor_id', vendorIds)
                    .eq('is_available', true)
                    .limit(12)
                    .then(({ data }) => data || []) :
                Promise.resolve([]),

            // Deals via its vendors
            vendorIds.length > 0 ?
                supabase
                    .from('deals')
                    .select('*')
                    .in('vendor_id', vendorIds)
                    .eq('status', 'active')
                    .gte('valid_to', new Date().toISOString())
                    .then(({ data }) => data || []) :
                Promise.resolve([]),

            // Activity Stats (Simple count for now)
            supabase
                .from('events')
                .select('id', { count: 'exact', head: true })
                .or(`host_id.eq.${business.id},and(host_type.eq.business)${vendorIds.length > 0 ? `,vendor_id.in.(${vendorIds.join(',')})` : ''}`)
                .then(({ count }) => ({
                    hostedEventsCount: count || 0,
                    isActiveThisMonth: (count || 0) > 0 // Simplified logic
                }))
        ])

        return {
            ...business,
            events,
            products,
            deals,
            activityStats
        }
    } catch (error) {
        console.error('[getBusinessBySlug] Error fetching linked data:', error)
        return {
            ...business,
            events: [],
            products: [],
            deals: [],
            activityStats: { hostedEventsCount: 0, isActiveThisMonth: false }
        }
    }
}

export async function getBusinessByOwnerId(ownerId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', ownerId)
        .single()

    if (error) return null
    return data as Business
}
