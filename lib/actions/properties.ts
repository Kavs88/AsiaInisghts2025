import { createClient } from '@/lib/supabase/server'

export async function getProperties(options: {
    property_type?: 'rental' | 'event_space',
    type?: string,
    limit?: number
} = {}) {
    const supabase = await createClient()
    if (!supabase) return []

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
            created_at
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

    const { data: properties, error } = await query

    if (error) {
        console.error('[getProperties] Query error:', error.message)
        return []
    }

    if (!properties || properties.length === 0) return []

    // Fetch associated businesses separately (no FK constraint in schema)
    const businessIds = [...new Set(
        properties.map((p: any) => p.business_id).filter(Boolean)
    )]

    let businessMap: Record<string, any> = {}
    if (businessIds.length > 0) {
        const { data: businesses } = await supabase
            .from('businesses')
            .select('id, name, slug, logo_url')
            .in('id', businessIds)

        if (businesses) {
            businessMap = Object.fromEntries(businesses.map((b: any) => [b.id, b]))
        }
    }

    return properties.map((p: any) => ({
        ...p,
        businesses: p.business_id ? (businessMap[p.business_id] ?? null) : null
    }))
}

export async function getPropertyById(id: string) {
    const supabase = await createClient()
    if (!supabase) return null

    const { data: property, error } = await supabase
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
            created_at
        `)
        .eq('id', id)
        .maybeSingle()

    if (error) {
        console.error('[getPropertyById] Query error:', error.message)
        return null
    }

    if (!property) return null

    // Fetch associated business separately (no FK constraint in schema)
    let businesses = null
    if ((property as any).business_id) {
        const { data: biz } = await supabase
            .from('businesses')
            .select('id, name, slug, description, logo_url, address, contact_phone')
            .eq('id', (property as any).business_id)
            .maybeSingle()
        businesses = biz ?? null
    }

    return { ...property, businesses }
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
