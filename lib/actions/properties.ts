import { createClient } from '@/lib/supabase/server'

export async function getProperties(options: {
    property_type?: 'rental' | 'event_space',
    type?: string,
    limit?: number
} = {}) {
    const supabase = await createClient()
    if (!supabase) return []

    // Select all fields needed by components
    // Include business_id for the join to work properly
    // Note: property_type may be NULL for older properties (added in migration 015)
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
            host_phone,
            host_email,
            contact_phone,
            contact_email,
            business_id,
            availability,
            created_at,
            businesses (
                id,
                name,
                slug,
                logo_url
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

    if (options.limit) {
        query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
        console.error('[getProperties] Query error:', error.message)
        return []
    }

    return data || []
}

export async function getPropertyById(id: string) {
    const supabase = await createClient()
    if (!supabase) return null

    // Select all fields needed by components
    // Include business_id for the join to work properly
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
            host_phone,
            host_email,
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
                address,
                contact_phone
            )
        `)
        .eq('id', id)
        .maybeSingle()

    if (error) {
        console.error('[getPropertyById] Query error:', error.message)
        return null
    }

    return data
}

export async function getPropertiesByBusiness(businessId: string) {
    const supabase = await createClient()
    if (!supabase) return []

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)

    if (error) {
        console.error('Error fetching properties for business:', error)
        return []
    }

    return data || []
}
