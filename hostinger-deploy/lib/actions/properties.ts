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

    console.log('[getProperties] Executing query with filters:', options)
    
    const { data, error } = await query

    if (error) {
        console.error('[getProperties] Query error:', error)
        console.error('[getProperties] Error code:', error.code)
        console.error('[getProperties] Error message:', error.message)
        console.error('[getProperties] Error details:', JSON.stringify(error, null, 2))
        
        // Check if error is due to missing columns (host_phone, host_email)
        if (error.message && error.message.includes('column') && (error.message.includes('host_phone') || error.message.includes('host_email'))) {
            console.error('[getProperties] Missing columns detected. Please run migration 016_add_property_host_fields.sql in Supabase.')
            console.error('[getProperties] Attempting query without host fields...')
            
            // Retry without host fields
            let fallbackQuery = supabase
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
                        logo_url
                    )
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
            
            if (options.property_type) {
                fallbackQuery = fallbackQuery.eq('property_type', options.property_type)
            }
            if (options.type) {
                fallbackQuery = fallbackQuery.eq('type', options.type)
            }
            if (options.limit) {
                fallbackQuery = fallbackQuery.limit(options.limit)
            }
            
            const { data: fallbackData, error: fallbackError } = await fallbackQuery
            if (fallbackError) {
                console.error('[getProperties] Fallback query also failed:', fallbackError)
                console.error('[getProperties] Fallback error code:', fallbackError.code)
                console.error('[getProperties] Fallback error message:', fallbackError.message)
                return []
            }
            console.log(`[getProperties] Fallback query succeeded: Found ${fallbackData?.length || 0} properties`)
            return fallbackData || []
        }
        
        return []
    }

    // Debug: Log if no data returned
    if (!data || data.length === 0) {
        console.log('[getProperties] ⚠️ No properties found with filters:', options)
        console.log('[getProperties] This could be due to:')
        console.log('[getProperties] 1. No properties in database')
        console.log('[getProperties] 2. RLS policy blocking (properties must have is_active=true AND availability IN (\'available\', \'pending\'))')
        console.log('[getProperties] 3. Filters too restrictive')
        
        // Try a simple count query to see if RLS is the issue
        const { count, error: countError } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
        
        if (countError) {
            console.error('[getProperties] Count query error (likely RLS):', countError)
        } else {
            console.log(`[getProperties] Total properties in table (before RLS): ${count}`)
        }
    } else {
        console.log(`[getProperties] ✅ Found ${data.length} properties`)
        if (data.length > 0 && data[0]) {
            console.log('[getProperties] Sample property:', {
                id: (data[0] as any).id,
                address: (data[0] as any).address,
                property_type: (data[0] as any).property_type,
                has_business: !!(data[0] as any).businesses
            })
        }
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
        .single()

    if (error) {
        console.error('Error fetching property by id:', error)
        
        // Check if error is due to missing columns
        if (error.message && error.message.includes('column') && (error.message.includes('host_phone') || error.message.includes('host_email'))) {
            console.error('[getPropertyById] Missing columns detected. Please run migration 016_add_property_host_fields.sql in Supabase.')
            console.error('[getPropertyById] Attempting query without host fields...')
            
            // Retry without host fields
            const { data: fallbackData, error: fallbackError } = await supabase
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
                        address,
                        contact_phone
                    )
                `)
                .eq('id', id)
                .single()
            
            if (fallbackError) {
                console.error('Fallback query also failed:', fallbackError)
                return null
            }
            return fallbackData
        }
        
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
