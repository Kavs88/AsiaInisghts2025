import { createClient } from '@/lib/supabase/server'

export async function getProperties(options: {
    property_type?: 'rental' | 'event_space',
    type?: string,
    limit?: number,
    vettedOnly?: boolean,
    featuredOnly?: boolean
} = {}) {
    const { property_type, type, limit, vettedOnly, featuredOnly } = options;
    const supabase = await createClient()

    // Select all fields needed by components
    // Include business_id for the join to work properly
    // NOTE: host_phone and host_email excluded pending migration 016
    let query = supabase
        .from('properties')
        .select(`
            id,
            address,
            type,
            property_type,
            price,
            bedrooms,
            bathrooms,
            capacity,
            images,
            location_coords,
            description,
            hourly_rate,
            daily_rate,
            contact_phone,
            contact_email,
            business_id,
            availability,
            created_at,
            businesses (
                id,
                name,
                slug,
                logo_url,
                is_verified
            )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (options.property_type) {
        query = query.eq('property_type', options.property_type)
    }

    if (options.type) {
        query = query.eq('type', options.type)
    }

    if (vettedOnly) {
        // Find properties where the business is vetted (high confidence)
        query = query.not('businesses', 'is', null).gte('businesses.is_verified', true)
    }

    if (featuredOnly) {
        query = query.eq('availability', 'available').order('created_at', { ascending: false })
    }

    if (limit) {
        query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
        console.error('[getProperties] Query error:', error)
        return []
    }

    return data || []
}

export async function getPropertyById(id: string) {
    const supabase = await createClient()

    // Select all fields needed by components
    // Include business_id for the join to work properly
    // NOTE: host_phone and host_email excluded pending migration 016
    const { data, error } = await supabase
        .from('properties')
        .select(`
            id,
            address,
            type,
            property_type,
            price,
            bedrooms,
            bathrooms,
            capacity,
            images,
            location_coords,
            description,
            hourly_rate,
            daily_rate,
            contact_phone,
            contact_email,
            business_id,
            created_at,
            businesses (
                id,
                name,
                slug,
                description,
                logo_url,
                is_verified,
                address,
                contact_phone
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching property by id:', error)
        return null
    }

    return data
}

export async function getPropertiesByBusiness(businessId: string) {
    const supabase = await createClient()

    // NOTE: host_phone and host_email excluded pending migration 016
    const { data, error } = await supabase
        .from('properties')
        .select(`
            id,
            address,
            type,
            property_type,
            price,
            bedrooms,
            bathrooms,
            capacity,
            images,
            location_coords,
            description,
            hourly_rate,
            daily_rate,
            contact_phone,
            contact_email,
            business_id,
            availability,
            created_at
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)

    if (error) {
        console.error('Error fetching properties for business:', error)
        return []
    }

    return data || []
}
