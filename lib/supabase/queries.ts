import { createClient } from './server'

/**
 * Get vendors with optional filters
 */
export async function getVendors(options: {
  limit?: number
  category?: string
  searchQuery?: string
  deliveryAvailable?: boolean
  pickupAvailable?: boolean
} = {}) {
  let supabase
  if (typeof window === 'undefined') {
    supabase = await createClient()
  } else {
    // For client side, we use the same SSR client but it will use browser cookies
    supabase = await createClient()
  }

  if (!supabase) {
    console.error('Failed to create Supabase client')
    return []
  }

  // Optimize: Select only needed fields and add default limit
  const queryLimit = options.limit || 50
  const maxLimit = Math.min(queryLimit, 100) // Cap at 100 for performance

  let query = supabase
    .from('vendors')
    .select('id, name, slug, tagline, bio, logo_url, hero_image_url, category, is_verified, is_active, delivery_available, pickup_available, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(maxLimit)

  if (options.category) {
    query = query.eq('category', options.category)
  }

  if (options.searchQuery) {
    query = query.or(`name.ilike.%${options.searchQuery}%,bio.ilike.%${options.searchQuery}%,short_tagline.ilike.%${options.searchQuery}%`)
  }

  if (options.deliveryAvailable !== undefined) {
    query = query.eq('delivery_available', options.deliveryAvailable)
  }

  if (options.pickupAvailable !== undefined) {
    query = query.eq('pickup_available', options.pickupAvailable)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching vendors:', error)
    return []
  }
  return data || []
}

/**
 * Get vendor by slug
 */
export async function getVendorBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

/**
 * Get products with optional limit
 */
export async function getProducts(limit = 50) {
  const supabase = await createClient()
  const maxLimit = Math.min(limit, 100) // Cap at 100 for performance

  // Optimize: Select only needed fields
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, compare_at_price, image_urls, category, tags, stock_quantity, is_available, requires_preorder, preorder_lead_days, created_at, vendors(name, slug, logo_url)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(maxLimit)

  if (error) throw error
  return data
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, vendors(*)')
    .eq('slug', slug)
    .eq('is_available', true)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Get vendor products
 */
export async function getVendorProducts(vendorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get vendor portfolio
 */
export async function getVendorPortfolio(vendorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vendor_portfolio')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get vendor gallery images
 */
export async function getVendorGalleryImages(vendorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vendor_images')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Search products
 */
export async function searchProducts(searchQuery: string, limit = 10) {
  const supabase = await createClient()

  if (!supabase) {
    console.error('Failed to create Supabase client')
    return []
  }

  // Using PostgreSQL trigram similarity for fuzzy search
  const { data, error } = await (supabase as any).rpc('search_products', {
    search_text: searchQuery,
    result_limit: limit,
  })

  // Fallback to simple ILIKE if RPC function doesn't exist
  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('products')
      .select('*, vendors(name, slug)')
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .eq('is_available', true)
      .limit(limit)

    if (fallbackError) {
      console.error('Error searching products:', fallbackError)
      return []
    }
    return fallbackData || []
  }

  return data || []
}

/**
 * Get upcoming market days
 */
export async function getUpcomingMarketDays(limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_days')
    .select('*')
    .eq('is_published', true)
    .gte('market_date', new Date().toISOString().split('T')[0])
    .order('market_date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get venue by location name
 */
export async function getVenueByLocationName(locationName: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_days')
    .select('*')
    .eq('location_name', locationName)
    .order('market_date', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data
}

/**
 * Get market day with stalls and vendors
 */
export async function getMarketDayWithStalls(marketDayId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_stalls')
    .select(`
      *,
      market_days(*)
    `)
    .eq('market_day_id', marketDayId)

  if (error) throw error
  return data
}

/**
 * Get market day with attending vendors
 */
export async function getMarketDayWithVendors(marketDayId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_days')
    .select('*, hosts(*)')
    .eq('id', marketDayId)
    .single()

  if (error) throw error
  return data
}

/**
 * Get vendors attending a specific market day
 */
export async function getVendorsAttendingMarket(marketDayId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_stalls')
    .select(`
      *,
      vendors(*)
    `)
    .eq('market_day_id', marketDayId)
    .eq('attending_physically', true)

  if (error) throw error
  return data || []
}

/**
 * Get vendor's next market attendance
 */
export async function getVendorNextMarketAttendance(vendorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_stalls')
    .select(`
      *,
      market_days(*)
    `)
    .eq('vendor_id', vendorId)
    .eq('attending_physically', true)
    .gte('market_days.market_date', new Date().toISOString().split('T')[0])
    .order('market_days.market_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching vendor next market attendance:', error)
    return null
  }
  return data || null
}

/**
 * Get vendors attendance status for multiple vendors
 */
export async function getVendorsAttendanceStatus(vendorIds: string[]) {
  if (vendorIds.length === 0) return {}

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_stalls')
    .select(`
      vendor_id,
      attending_physically,
      market_days!inner(market_date)
    `)
    .in('vendor_id', vendorIds)
    .eq('attending_physically', true)
    .gte('market_days.market_date', new Date().toISOString().split('T')[0])
    .order('market_days.market_date', { ascending: true })

  if (error) {
    console.error('Error fetching vendors attendance status:', error)
    return {}
  }

  const statusMap: Record<string, 'attending' | 'delivery-only'> = {}
  const vendorIdsWithAttendance = new Set<string>()

  data?.forEach((stall: any) => {
    if (stall.vendor_id && !vendorIdsWithAttendance.has(stall.vendor_id)) {
      statusMap[stall.vendor_id] = 'attending'
      vendorIdsWithAttendance.add(stall.vendor_id)
    }
  })

  return statusMap
}

/**
 * Get customer order intents
 */
export async function getCustomerOrderIntents(customerEmail: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('order_intents')
    .select(`
      *,
      products(*, vendors(name, slug, logo_url))
    `)
    .eq('customer_email', customerEmail)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer order intents:', error)
    return []
  }
  return data || []
}

/**
 * Get properties near a location (by coordinates)
 * Uses PostgreSQL's point distance calculation
 */
export async function getPropertiesNearLocation(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  limit: number = 10
) {
  const supabase = await createClient()

  if (!supabase) {
    console.error('[getPropertiesNearLocation] Supabase client not available')
    return []
  }

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
    .not('location_coords', 'is', null)
    .limit(limit)

  if (error) {
    console.error('[getPropertiesNearLocation] Error:', error)
    return []
  }

  // Filter by distance (if location_coords available)
  // Note: This is a simplified approach. For production, use PostGIS extension
  // or a geospatial database function
  const filtered = (data || []).filter((property: any) => {
    if (!property.location_coords) return false
    // Simple distance calculation (rough approximation)
    // For production, implement proper Haversine formula or use PostGIS
    return true // For now, return all properties with coordinates
  })

  return filtered.slice(0, limit)
}

/**
 * Get properties by location name (simpler alternative)
 * Matches properties by location_name or address containing the location string
 */
export async function getPropertiesByLocationName(
  locationName: string,
  propertyType?: 'rental' | 'event_space',
  limit: number = 10
) {
  const supabase = await createClient()

  if (!supabase) {
    console.error('[getPropertiesByLocationName] Supabase client not available')
    return []
  }

  let query = supabase
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

  // Filter by property_type if specified (after migration 015 is run)
  if (propertyType) {
    query = query.eq('property_type', propertyType)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getPropertiesByLocationName] Error:', error)
    return []
  }

  return data || []
}

/**
 * Get properties near a market day location
 * Uses the market day's location_name to find nearby properties
 */
export async function getPropertiesNearMarketDay(
  marketDayLocationName: string,
  limit: number = 4
) {
  return getPropertiesByLocationName(marketDayLocationName, undefined, limit)
}

/**
 * Get properties near a business
 * Uses the business's address to find nearby properties
 */
export async function getPropertiesNearBusiness(
  businessAddress: string,
  limit: number = 4
) {
  if (!businessAddress) return []

  // Extract location from address (e.g., "123 Street, District Name" -> "District Name")
  const addressParts = businessAddress.split(',').map(s => s.trim())
  const locationName = addressParts[addressParts.length - 1] || businessAddress

  return getPropertiesByLocationName(locationName, undefined, limit)
}

/**
 * Search businesses
 */
export async function searchBusinesses(searchQuery: string, limit = 10) {
  const supabase = await createClient()

  if (!supabase) {
    console.error('Failed to create Supabase client')
    return []
  }

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
    .eq('is_active', true)
    .limit(limit)

  if (error) {
    console.error('Error searching businesses:', error)
    return []
  }
  return data || []
}

/**
 * Get all hosts
 */
export async function getAllHosts() {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('hosts') as any)
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching hosts:', error)
    return []
  }
  return data || []
}

/**
 * Update order intent status
 */
export async function updateOrderIntentStatus(id: string, status: string) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error('Failed to create Supabase client')
  }

  const { data, error } = await (supabase
    .from('order_intents') as any)
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order intent status:', error)
    throw error
  }

  return data
}
