'use server'

import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'

// unstable_cache defined at module level — created once, not re-instantiated per call.
const _fetchProperties = unstable_cache(
  async (
    prop_type?: string,
    prop_t?: string,
    lim?: number,
    vetted?: boolean,
    featured?: boolean,
  ) => {
    // Use the cookie-free public client — unstable_cache runs outside request context
    const supabase = createPublicClient()

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

    if (prop_type) query = query.eq('property_type', prop_type as 'rental' | 'event_space')
    if (prop_t) query = query.eq('type', prop_t)
    if (vetted) query = query.not('businesses', 'is', null).gte('businesses.is_verified', true)
    if (featured) query = query.eq('availability', 'available').order('created_at', { ascending: false })
    if (lim) query = query.limit(lim)

    const { data, error } = await query

    if (error) {
      console.error('[getProperties] Query error:', error)
      return []
    }

    return data || []
  },
  ['properties-list'],
  { revalidate: 1800, tags: ['properties'] },
)

export async function getProperties(options: {
  property_type?: 'rental' | 'event_space'
  type?: string
  limit?: number
  vettedOnly?: boolean
  featuredOnly?: boolean
} = {}) {
  const { property_type, type, limit, vettedOnly, featuredOnly } = options
  return _fetchProperties(property_type, type, limit, vettedOnly, featuredOnly)
}

const _fetchPropertyById = unstable_cache(
  async (id: string) => {
    const supabase = createPublicClient()
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
  },
  ['property-by-id'],
  { revalidate: 1800, tags: ['properties'] }
)

export async function getPropertyById(id: string) {
  return _fetchPropertyById(id)
}

export async function getPropertiesNearBusiness(businessAddress: string, limit: number = 4) {
  if (!businessAddress) return []
  const supabase = createPublicClient()
  const addressParts = businessAddress.split(',').map((s: string) => s.trim())
  const locationName = addressParts[addressParts.length - 1] || businessAddress
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      businesses:business_id (
        id,
        name,
        slug,
        logo_url
      )
    `)
    .eq('is_active', true)
    .eq('availability', 'available')
    .ilike('address', `%${locationName}%`)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('[getPropertiesNearBusiness] Error:', error)
    return []
  }
  return data || []
}

export async function getUpcomingEventsForProperty(propertyId: string) {
  const supabase = createPublicClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_type, start_at, end_at, status')
    .eq('property_id', propertyId)
    .eq('status', 'published')
    .gte('start_at', now)
    .order('start_at', { ascending: true })
    .limit(5)

  if (error) {
    console.error('[getUpcomingEventsForProperty] Query error:', error)
    return []
  }

  return data || []
}

export async function getEventSpaceProperties() {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('properties')
    .select('id, address, capacity')
    .eq('property_type', 'event_space')
    .eq('is_active', true)
    .order('address', { ascending: true })

  if (error) {
    console.error('[getEventSpaceProperties] Query error:', error)
    return []
  }

  return data || []
}

export async function getPropertiesByBusiness(businessId: string) {
  const supabase = await createClient()

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
