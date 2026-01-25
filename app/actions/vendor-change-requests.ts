'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Server actions for vendor change requests
 * These actions handle vendor request submission and admin approval/rejection
 */

interface VendorChangeRequestData {
  name?: string
  tagline?: string
  bio?: string
  logo_url?: string | null
  hero_image_url?: string | null
  category?: string
  contact_email?: string
  contact_phone?: string
  website_url?: string
  instagram_handle?: string
  facebook_url?: string
  delivery_available?: boolean
  pickup_available?: boolean
}

/**
 * Submit a vendor change request
 * Only vendors can submit requests for their own vendor profile
 */
export async function submitVendorChangeRequest(
  vendorId: string,
  requestedChanges: VendorChangeRequestData
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get current user
    const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !sessionUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify vendor belongs to user
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, user_id')
      .eq('id', vendorId)
      .single()

    if (vendorError || !vendor) {
      return { success: false, error: 'Vendor not found' }
    }

    if ((vendor as any).user_id !== sessionUser.id) {
      return { success: false, error: 'Unauthorized: This vendor does not belong to you' }
    }

    // Check if there's already a pending request
    const { data: existingRequest } = await (supabase
      .from('vendor_change_requests')
      .select('id')
      .eq('vendor_id', vendorId)
      .eq('status', 'pending')
      .maybeSingle() as any)

    if (existingRequest) {
      return {
        success: false,
        error: 'You already have a pending request. Please wait for admin review or cancel the existing request.'
      }
    }

    // Filter out null/undefined values and build requested_changes JSONB
    const changes: Record<string, any> = {}
    Object.entries(requestedChanges).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        changes[key] = value
      }
    })

    if (Object.keys(changes).length === 0) {
      return { success: false, error: 'No changes to submit' }
    }

    // Create the request
    const { data: request, error: insertError } = await (supabase
      .from('vendor_change_requests') as any)
      .insert({
        vendor_id: vendorId,
        requested_by_user_id: sessionUser.id,
        requested_changes: changes,
        status: 'pending',
      })
      .select('id')
      .single() as any

    if (insertError) {
      console.error('Error creating vendor change request:', insertError)
      return { success: false, error: insertError.message || 'Failed to submit request' }
    }

    return { success: true, requestId: request.id }
  } catch (error: any) {
    console.error('Error in submitVendorChangeRequest:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Cancel a pending vendor change request
 * Only the vendor who created it can cancel it
 */
export async function cancelVendorChangeRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !sessionUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify request belongs to user and is pending
    const { data: request, error: requestError } = await (supabase
      .from('vendor_change_requests')
      .select('id, requested_by_user_id, status')
      .eq('id', requestId)
      .single() as any)

    if (requestError || !request) {
      return { success: false, error: 'Request not found' }
    }

    if (request.requested_by_user_id !== sessionUser.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Only pending requests can be cancelled' }
    }

    // Delete the request
    const { error: deleteError } = await supabase
      .from('vendor_change_requests')
      .delete()
      .eq('id', requestId)

    if (deleteError) {
      return { success: false, error: deleteError.message || 'Failed to cancel request' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in cancelVendorChangeRequest:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Admin: Approve a vendor change request
 * This applies the changes to the vendors table
 */
export async function approveVendorChangeRequest(
  requestId: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !sessionUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify user is admin
    const { data: user, error: userError } = await (supabase
      .from('users')
      .select('role')
      .eq('id', sessionUser.id)
      .single() as any)

    if (userError || !user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' }
    }

    // Get the request
    const { data: request, error: requestError } = await (supabase
      .from('vendor_change_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single() as any)

    if (requestError || !request) {
      return { success: false, error: 'Request not found or already processed' }
    }

    // Use service role client to apply changes (bypasses RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return { success: false, error: 'Service role key not configured' }
    }

    const serviceClient = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    // Apply changes using the database function
    const { error: applyError } = await serviceClient.rpc('apply_vendor_change_request', {
      p_request_id: requestId,
    } as any)

    if (applyError) {
      console.error('Error applying vendor change request:', applyError)
      return { success: false, error: applyError.message || 'Failed to apply changes' }
    }

    // Update request status
    const { error: updateError } = await (supabase
      .from('vendor_change_requests') as any)
      .update({
        status: 'approved',
        admin_notes: adminNotes || null,
        reviewed_by_user_id: sessionUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating request status:', updateError)
      // Changes were applied but status update failed - log but don't fail
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in approveVendorChangeRequest:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Admin: Reject a vendor change request
 */
export async function rejectVendorChangeRequest(
  requestId: string,
  adminNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !sessionUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify user is admin
    const { data: user, error: userError } = await (supabase
      .from('users')
      .select('role')
      .eq('id', sessionUser.id)
      .single() as any)

    if (userError || !user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' }
    }

    // Get the request
    const { data: request, error: requestError } = await (supabase
      .from('vendor_change_requests')
      .select('id, status')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single() as any)

    if (requestError || !request) {
      return { success: false, error: 'Request not found or already processed' }
    }

    // Update request status
    const { error: updateError } = await (supabase
      .from('vendor_change_requests') as any)
      .update({
        status: 'rejected',
        admin_notes: adminNotes,
        reviewed_by_user_id: sessionUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) {
      return { success: false, error: updateError.message || 'Failed to reject request' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in rejectVendorChangeRequest:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Admin: Get all pending vendor change requests
 */
export async function getPendingVendorChangeRequests(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !sessionUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify user is admin
    const { data: user, error: userError } = await (supabase
      .from('users')
      .select('role')
      .eq('id', sessionUser.id)
      .single() as any)

    if (userError || !user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' }
    }

    // Get all pending requests with vendor and user info
    const { data: requests, error: requestsError } = await (supabase
      .from('vendor_change_requests')
      .select(`
        *,
        vendors (
          id,
          name,
          slug,
          user_id
        ),
        requested_by:users!vendor_change_requests_requested_by_user_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }) as any)

    if (requestsError) {
      return { success: false, error: requestsError.message || 'Failed to fetch requests' }
    }

    return { success: true, data: requests || [] }
  } catch (error: any) {
    console.error('Error in getPendingVendorChangeRequests:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Get vendor change requests for the current vendor
 */
export async function getVendorChangeRequests(vendorId: string): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !sessionUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify vendor belongs to user
    const { data: vendor, error: vendorError } = await (supabase
      .from('vendors')
      .select('id, user_id')
      .eq('id', vendorId)
      .single() as any)

    if (vendorError || !vendor) {
      return { success: false, error: 'Vendor not found' }
    }

    if (vendor.user_id !== sessionUser.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get requests for this vendor
    const { data: requests, error: requestsError } = await (supabase
      .from('vendor_change_requests')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }) as any)

    if (requestsError) {
      return { success: false, error: requestsError.message || 'Failed to fetch requests' }
    }

    return { success: true, data: requests || [] }
  } catch (error: any) {
    console.error('Error in getVendorChangeRequests:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

