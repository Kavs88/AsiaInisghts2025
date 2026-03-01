'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserAuthorityServer } from '@/lib/auth/authority'

/**
 * Get properties owned by the current user (landlord dashboard).
 * Returns all (including archived) so landlord can see and restore them.
 */
export async function getLandlordProperties() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      address,
      type,
      property_type,
      availability,
      is_active,
      capacity,
      hourly_rate,
      daily_rate,
      price,
      images,
      created_at,
      updated_at
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getLandlordProperties] Error:', error)
    return []
  }

  return data || []
}

/**
 * Get upcoming events at properties owned by the current user.
 * Joins events → market_days via market_days.property_id.
 */
export async function getLandlordUpcomingEvents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // First get the landlord's property IDs
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('owner_id', user.id)

  if (!properties || properties.length === 0) return []

  const propertyIds = properties.map((p: any) => p.id)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      event_type,
      start_at,
      end_at,
      status,
      property_id,
      properties!events_property_id_fkey (
        id,
        address
      )
    `)
    .in('property_id', propertyIds)
    .eq('status', 'published')
    .gte('start_at', now)
    .order('start_at', { ascending: true })
    .limit(10)

  if (error) {
    console.error('[getLandlordUpcomingEvents] Error:', error)
    return []
  }

  return data || []
}

/**
 * Get pending enquiries for properties owned by the current user.
 */
export async function getLandlordEnquiries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get property IDs
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('owner_id', user.id)

  if (!properties || properties.length === 0) return []

  const propertyIds = properties.map((p: any) => p.id)

  const { data, error } = await supabase
    .from('property_enquiries')
    .select(`
      id,
      property_id,
      name,
      email,
      message,
      status,
      created_at,
      properties!property_enquiries_property_id_fkey (
        id,
        address
      )
    `)
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[getLandlordEnquiries] Error:', error)
    return []
  }

  return data || []
}

/**
 * Update landlord-editable fields on a property.
 * Validates that the current user owns the property before updating.
 * Allowed fields: availability, is_active.
 * Not allowed: owner_id.
 */
export async function updateLandlordProperty(
  propertyId: string,
  updates: {
    availability?: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
    is_active?: boolean
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify ownership before update
  const { data: property } = await supabase
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('owner_id', user.id)
    .single()

  if (!property) return { error: 'Property not found or access denied' }

  const updatePayload = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('properties')
    // @ts-ignore - Supabase type generation is overly strict with the update union
    .update(updatePayload)
    .eq('id', propertyId)
    .eq('owner_id', user.id)

  if (error) {
    console.error('[updateLandlordProperty] Error:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Bulk update operational fields across multiple properties.
 * Ownership of every property is verified before any update is applied.
 * Allowed fields: availability, is_active.
 * Fails fast if any property ID is not owned by the current user.
 */
export async function bulkUpdateLandlordProperties(
  propertyIds: string[],
  updates: {
    availability?: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
    is_active?: boolean
  }
) {
  if (!propertyIds.length) return { error: 'No property IDs provided' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify ownership of all supplied IDs in a single query
  const { data: owned, error: ownershipError } = await supabase
    .from('properties')
    .select('id')
    .eq('owner_id', user.id)
    .in('id', propertyIds)

  if (ownershipError) {
    console.error('[bulkUpdateLandlordProperties] Ownership check error:', ownershipError)
    return { error: ownershipError.message }
  }

  const ownedIds = (owned || []).map((p: any) => p.id)
  const unauthorised = propertyIds.filter(id => !ownedIds.includes(id))

  if (unauthorised.length > 0) {
    console.error('[bulkUpdateLandlordProperties] Unauthorised property IDs:', unauthorised)
    return { error: 'One or more properties not found or access denied' }
  }

  const updatePayload = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('properties')
    // @ts-ignore - Supabase type generation is overly strict with the update union
    .update(updatePayload)
    .eq('owner_id', user.id)
    .in('id', ownedIds)

  if (error) {
    console.error('[bulkUpdateLandlordProperties] Update error:', error)
    return { error: error.message }
  }

  return { success: true, updatedCount: ownedIds.length }
}

/**
 * Archive a property. Admin/founder only — landlords cannot self-archive.
 * Sets is_active = false.
 */
export async function archiveProperty(propertyId: string) {
  const authority = await getUserAuthorityServer()
  if (!authority.isAdmin) return { error: 'Admin access required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const updatePayload = {
    is_active: false,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('properties')
    // @ts-ignore
    .update(updatePayload)
    .eq('id', propertyId)

  if (error) {
    console.error('[archiveProperty] Error:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Restore an archived property. Admin/founder only.
 * Sets is_active = true.
 */
export async function restoreProperty(propertyId: string) {
  const authority = await getUserAuthorityServer()
  if (!authority.isAdmin) return { error: 'Admin access required' }

  const supabase = await createClient()

  const updatePayload = {
    is_active: true,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('properties')
    // @ts-ignore
    .update(updatePayload)
    .eq('id', propertyId)

  if (error) {
    console.error('[restoreProperty] Error:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Get full detail for a single landlord property.
 * Includes upcoming events at this venue and open enquiry count.
 * Validates ownership — only the property's owner can call this.
 */
export async function getLandlordPropertyDetail(propertyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date().toISOString()

  const propertyQuery = supabase
    .from('properties')
    .select(`
      id,
      address,
      type,
      property_type,
      availability,
      is_active,
      capacity,
      hourly_rate,
      daily_rate,
      price,
      images,
      created_at,
      updated_at
    `)
    .eq('id', propertyId)
    .eq('owner_id', user.id)
    .single() as any

  const [propertyResult, eventsResult, enquiriesResult] = await Promise.all([
    propertyQuery,
    supabase
      .from('events')
      .select(`
        id,
        title,
        event_type,
        start_at,
        end_at,
        status,
        venue_name
      `)
      .eq('property_id', propertyId)
      .gte('start_at', now)
      .order('start_at', { ascending: true })
      .limit(10),
    supabase
      .from('property_enquiries')
      .select('id, status', { count: 'exact', head: false })
      .eq('property_id', propertyId)
      .in('status', ['new', 'pending']),
  ])

  if (propertyResult.error || !propertyResult.data) {
    console.error('[getLandlordPropertyDetail] Property error:', propertyResult.error)
    return null
  }

  return {
    ...propertyResult.data,
    upcomingEvents: eventsResult.data || [],
    openEnquiryCount: (enquiriesResult.data || []).length,
  }
}
