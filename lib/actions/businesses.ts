'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

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
    // Add other fields as needed by UI
}

export async function getBusinesses(options: { category?: string, limit?: number, vettedOnly?: boolean, featuredOnly?: boolean } = {}) {
    const { category, limit, vettedOnly, featuredOnly } = options;
    const supabase = await createClient()

    // Query ENTITIES directly (Source of Truth)
    let query = supabase
        .from('entities')
        .select('id, name, slug, tags, description, location_text, logo_url, confidence_score, last_verified_at, created_at')
        .eq('type', 'business')

    // is_active column does not exist in unified entities table yet
    // .eq('is_active', true)

    if (category) {
        if (category === 'setup') {
            // Setup Stack: Filter for survival-related tags
            const setupTags = ['visa', 'legal', 'banking', 'internet', 'health', 'transport', 'housing'];
            // Using overlap filter .ov() to find any entity with at least one of these tags
            query = query.filter('tags', 'ov', `{${setupTags.join(',')}}`)
        } else if (category !== 'all') {
            query = query.contains('tags', [category])
        }
    }

    if (vettedOnly) {
        query = query.gte('confidence_score', 90)
    }

    if (featuredOnly) {
        query = query.gte('confidence_score', 75)
    }

    if (limit) {
        query = query.limit(limit)
    }

    const { data, error } = await query.order('confidence_score', { ascending: false }).order('created_at', { ascending: false })

    if (error) {
        console.error('[getBusinesses] Error fetching entities:', error)
        return []
    }

    console.log(`[getBusinesses] Found ${data?.length || 0} entities`)

    // Map Entity -> Business
    const businesses: Business[] = (data || []).map((entity: any) => ({
        id: entity.id,
        name: entity.name,
        slug: entity.slug,
        category: entity.tags?.[0] || 'Local Business',
        description: entity.description,
        address: entity.location_text,
        logo_url: entity.logo_url,
        is_verified: !!entity.last_verified_at,
        confidence_score: entity.confidence_score,
        created_at: entity.created_at
    }))

    return businesses
}

export async function getBusinessBySlug(slug: string) {
    const supabase = await createClient()

    // 1. Fetch the unified entity record
    const { data: entity, error: entityError } = await supabase
        .from('entities')
        .select('*, founder_tags(tag), founder_notes(note, visibility)')
        .eq('slug', slug)
        .maybeSingle()

    if (entityError || !entity) {
        console.error('[getBusinessBySlug] Error or not found in entities:', entityError?.message || 'Not found')
        return null
    }

    // 2. Fetch linked data
    // Note: We still use legacy_ids if they exist to find relations, 
    // OR we should verify if relations are migrated to use entity_id.
    // Assuming relations (products, events) might still point to old IDs or new IDs.
    // For safety, we check both if possible, or strictly legacy if that's the current state.
    // Phase 6.2 mandate is "Data Truth Unification".

    // Simplification: We map the entity to the business shape.
    // We will attempt to fetch products/events.

    const typedEntity = entity as any
    const legacyBusinessId = typedEntity.legacy_business_id
    const legacyVendorId = typedEntity.legacy_vendor_id

    try {
        const promises = []

        // Products
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

        // Events
        if (legacyBusinessId) {
            promises.push(
                supabase
                    .from('events')
                    .select('*')
                    .or(`host_id.eq.${legacyBusinessId},and(host_type.eq.business)`)
                    .eq('status', 'published')
                    .gte('end_at', new Date().toISOString())
                    .order('start_at', { ascending: true })
                    .then(({ data }) => ({ type: 'events', data: data || [] }))
            )

            // Activity Stats
            promises.push(
                supabase
                    .from('events')
                    .select('id', { count: 'exact', head: true })
                    .or(`host_id.eq.${legacyBusinessId},and(host_type.eq.business)`)
                    .then(({ count }) => ({ type: 'activityStats', data: { hostedEventsCount: count || 0, isActiveThisMonth: (count || 0) > 0 } }))
            )
        }

        // Properties (using Business ID)
        // If properties are linked to the unified ID, we should change this. 
        // For now, assuming they are linked to legacy ID.
        if (legacyBusinessId) {
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

        const products = results.find(r => r.type === 'products')?.data || []
        const events = results.find(r => r.type === 'events')?.data || []
        const properties = results.find(r => r.type === 'properties')?.data || []
        const activityStats = results.find(r => r.type === 'activityStats')?.data || { hostedEventsCount: 0, isActiveThisMonth: false }

        return {
            ...typedEntity,
            id: typedEntity.id, // Ensure Entity ID is used
            category: typedEntity.tags?.[0] || 'Local Business',
            address: typedEntity.location_text,
            logo_url: typedEntity.logo_url,
            contact_phone: typedEntity.contact_info?.phone,
            contact_email: typedEntity.contact_info?.email,
            owner_id: typedEntity.owner_id, // Might be null for entities
            products,
            events,
            properties,
            activityStats,
            legacy_vendor_id: legacyVendorId,
            legacy_business_id: legacyBusinessId
        } as Business & { products: any[], events: any[], properties: any[], activityStats: any }

    } catch (error) {
        console.error('[getBusinessBySlug] Error fetching linked data:', error)
        return {
            ...typedEntity,
            category: typedEntity.tags?.[0] || 'Local Business',
            address: typedEntity.location_text,
            products: [],
            events: [],
            properties: [],
            activityStats: { hostedEventsCount: 0, isActiveThisMonth: false }
        }
    }
}

export async function getBusinessByOwnerId(ownerId: string) {
    // This might be tricky if owner_id is not filtered on entities.
    // We will query entities.
    const supabase = await createClient()
    const { data: rawData, error } = await (supabase as any)
        .from('entities')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('type', 'business')
        .single()

    if (error || !rawData) return null
    const data = rawData as any

    // Map
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
        created_at: data.created_at
    } as Business
}
