/**
 * Admin functions for creating vendor accounts
 * Uses Supabase Edge Function for atomic user + vendor creation
 */

import { createClient } from '@/lib/supabase/client'

export interface CreateVendorAccountData {
  // User account info
  email: string
  password: string
  fullName: string
  phone?: string

  // Vendor info
  vendorName: string
  slug?: string
  agencyId?: string // UUID of an existing agency; auto-provisioned when omitted
  tagline?: string
  bio?: string
  contactEmail?: string
  contactPhone?: string
  category?: string
  websiteUrl?: string
  instagramHandle?: string
  facebookUrl?: string
  deliveryAvailable?: boolean
  pickupAvailable?: boolean
  isActive?: boolean // Default: true for admin-created accounts
  isVerified?: boolean // Default: false
}

export interface CreateVendorAccountResult {
  success: boolean
  userId?: string
  vendorId?: string
  vendorSlug?: string
  error?: string
}

export interface UpdateVendorData {
  // Vendor info only (no user account changes)
  vendorName: string
  tagline?: string
  bio?: string
  contactEmail?: string
  contactPhone?: string
  category?: string
  websiteUrl?: string
  instagramHandle?: string
  facebookUrl?: string
  deliveryAvailable?: boolean
  pickupAvailable?: boolean
  isActive?: boolean
  isVerified?: boolean
}

export interface UpdateVendorResult {
  success: boolean
  vendorId?: string
  vendorSlug?: string
  error?: string
}

/**
 * Create a vendor account (user + vendor record)
 * Uses Supabase Edge Function for atomic creation
 * This is an admin-only function
 */
export async function createVendorAccount(
  data: CreateVendorAccountData
): Promise<CreateVendorAccountResult> {
  try {
    const supabase = createClient()

    // Get current session for authorization
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Authentication required. Please log in.',
      }
    }

    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return {
        success: false,
        error: 'Supabase URL not configured',
      }
    }

    // Call Edge Function for atomic vendor creation
    const response = await fetch(`${supabaseUrl}/functions/v1/create-vendor-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        vendorName: data.vendorName,
        slug: data.slug,
        agencyId: data.agencyId || undefined,
        tagline: data.tagline,
        bio: data.bio,
        category: data.category,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        websiteUrl: data.websiteUrl,
        instagramHandle: data.instagramHandle,
        facebookUrl: data.facebookUrl,
        deliveryAvailable: data.deliveryAvailable,
        pickupAvailable: data.pickupAvailable,
        isActive: data.isActive !== undefined ? data.isActive : true, // Default true for admin-created
        isVerified: data.isVerified !== undefined ? data.isVerified : false,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create vendor account',
      }
    }

    return {
      success: true,
      userId: result.userId,
      vendorId: result.vendorId,
      vendorSlug: result.vendorSlug,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unexpected error creating vendor account',
    }
  }
}

/**
 * Update an existing vendor account
 * This is an admin-only function
 */
export async function updateVendor(
  vendorId: string,
  data: UpdateVendorData
): Promise<UpdateVendorResult> {
  try {
    const supabase = createClient()

    // Get current vendor to check if name changed (affects slug)
    const { data: vendorDataRaw, error: fetchError } = await supabase
      .from('vendors')
      .select('name, slug, user_id')
      .eq('id', vendorId)
      .single()

    const currentVendor = vendorDataRaw as any

    if (fetchError || !currentVendor) {
      return {
        success: false,
        error: `Failed to fetch vendor: ${fetchError?.message || 'Vendor not found'}`,
      }
    }

    // Generate new slug if name changed
    let finalSlug = currentVendor.slug
    if (data.vendorName !== currentVendor.name) {
      const baseSlug = data.vendorName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      let slugCounter = 1
      let attempts = 0
      const maxAttempts = 100
      finalSlug = baseSlug

      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('vendors')
          .select('id')
          .eq('slug', finalSlug)
          .neq('id', vendorId) // Exclude current vendor
          .maybeSingle()

        if (!existing) break

        finalSlug = `${baseSlug}-${slugCounter}`
        slugCounter++
        attempts++
      }

      if (attempts >= maxAttempts) {
        finalSlug = `${baseSlug}-${vendorId.slice(0, 8)}`
      }
    }

    // Update vendor record
    // @ts-ignore
    const { data: updatedVendorRaw, error: vendorError } = await supabase
      .from('vendors')
      // @ts-ignore
      .update({
        name: data.vendorName,
        slug: finalSlug,
        tagline: data.tagline,
        bio: data.bio,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        category: data.category,
        website_url: data.websiteUrl,
        instagram_handle: data.instagramHandle,
        facebook_url: data.facebookUrl,
        delivery_available: data.deliveryAvailable !== undefined ? data.deliveryAvailable : false,
        pickup_available: data.pickupAvailable !== undefined ? data.pickupAvailable : true,
        is_active: data.isActive !== undefined ? data.isActive : true,
        is_verified: data.isVerified !== undefined ? data.isVerified : false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select('id, slug')
      .single()

    if (vendorError) {
      return {
        success: false,
        error: `Failed to update vendor profile: ${vendorError.message}`,
      }
    }

    const vendorData = updatedVendorRaw as any

    return {
      success: true,
      vendorId: vendorData.id,
      vendorSlug: vendorData.slug,
    }
  } catch (error: any) {
    console.error('[updateVendor] Error:', error)
    return {
      success: false,
      error: error.message || 'Unexpected error updating vendor account',
    }
  }
}

