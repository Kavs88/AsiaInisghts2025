/**
 * Authentication utilities for vendor authentication
 * Uses Supabase Auth for email/password authentication
 */

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Vendor {
  id: string
  slug: string
  name: string
  logo_url?: string | null
}

interface AuthResult {
  user: User
  vendor: Vendor
}

/**
 * Sign up a new vendor
 * Creates both the auth user and vendor record
 */
export async function signUpVendor(data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Promise<AuthResult> {
  const supabase = createClient()

  // Validate passwords match
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match')
  }

  // Validate password strength
  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  })

  if (authError) {
    throw new Error(authError.message || 'Failed to create account')
  }

  if (!authData.user) {
    throw new Error('Failed to create user account')
  }

  // Wait for trigger to create user record (trigger handles this automatically)
  // Give it more time to ensure the trigger fires
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Verify user record exists (created by trigger)
  // Try multiple times in case trigger is slow
  let userRecord = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', authData.user.id)
      .single()

    if (data && !error) {
      userRecord = data as any
      break
    }

    // Wait before next attempt
    if (attempt < 4) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  if (!userRecord) {
    // Trigger didn't create it - provide helpful error message
    throw new Error(
      'User profile was not created automatically. ' +
      'Please run: supabase/manual_create_user_for_existing_auth.sql in Supabase SQL Editor ' +
      'to create your user record manually, or contact support.'
    )
  }

  // Update user role to vendor if needed
  if (userRecord.role !== 'vendor') {
    const { error: roleUpdateError } = await supabase
      .from('users')
      // @ts-ignore
      .update({ role: 'vendor', full_name: data.name })
      .eq('id', authData.user.id)

    if (roleUpdateError) {
      console.warn('Could not update user role to vendor:', roleUpdateError)
      // Continue anyway - vendor creation is more important
    }
  }

  // Provision a new agency for this vendor and make them the owner.
  // Uses a SECURITY DEFINER RPC to bypass the RLS chicken-and-egg:
  // a user cannot INSERT into agencies/agency_members until they are
  // already an owner, but they can't become an owner without those rows.
  const { data: agencyId, error: agencyError } = await supabase
    .rpc('provision_vendor_agency', {
      p_user_id: authData.user.id,
      p_vendor_name: data.name,
    } as any)

  if (agencyError || !agencyId) {
    throw new Error(
      `Failed to set up vendor agency: ${agencyError?.message || 'Unknown error'}`
    )
  }

  // Generate slug from vendor name
  const baseSlug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Ensure slug is unique by appending number if needed
  let finalSlug = baseSlug
  let slugCounter = 1
  let attempts = 0
  const maxAttempts = 100 // Prevent infinite loop

  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('vendors')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle()

    if (!existing) break

    finalSlug = `${baseSlug}-${slugCounter}`
    slugCounter++
    attempts++
  }

  if (attempts >= maxAttempts) {
    // Fallback: use UUID snippet for slug if too many conflicts
    finalSlug = `${baseSlug}-${authData.user.id.slice(0, 8)}`
  }

  // Create vendor record
  const { data: vendorData, error: vendorError } = await supabase
    .from('vendors')
    // @ts-ignore
    .insert({
      name: data.name,
      slug: finalSlug,
      contact_email: data.email,
      is_active: true,
      user_id: authData.user.id,
      agency_id: agencyId,
    })
    .select('id, slug')
    .single()

  if (vendorError) {
    console.error('Failed to create vendor record:', vendorError)

    // Provide specific error message based on error type
    if (vendorError.message?.includes('row-level security') || vendorError.message?.includes('policy')) {
      throw new Error('Vendor creation blocked. Please run this SQL in Supabase: supabase/fix_vendor_insert_policy.sql')
    }

    if (vendorError.code === '23505') {
      throw new Error('A vendor with this name already exists. Please choose a different name.')
    }

    // Don't clean up user record - let admin handle it if needed
    throw new Error(`Failed to create vendor profile: ${vendorError.message || 'Unknown error'}. Error code: ${vendorError.code || 'N/A'}`)
  }

  return {
    user: authData.user,
    vendor: vendorData || {
      id: authData.user.id,
      slug: finalSlug,
    },
  }
}

/**
 * Sign in a user (role-agnostic)
 * Replaces signInVendor() - works for all user roles
 */
export async function signInUser(email: string, password: string): Promise<{ user: User; authority: any }> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message || 'Invalid email or password')
  }

  if (!data.user) {
    throw new Error('Failed to sign in')
  }

  // Get user authority using the authority resolver (client-side)
  const { getUserAuthority } = await import('./authority-client')
  const authority = await getUserAuthority()

  return {
    user: data.user,
    authority,
  }
}

/**
 * Sign in a vendor (DEPRECATED - use signInUser instead)
 * Kept for backward compatibility
 */
export async function signInVendor(email: string, password: string): Promise<AuthResult> {
  const { user, authority } = await signInUser(email, password)

  // For backward compatibility, return vendor object if exists
  if (authority.hasVendorRecord && authority.vendorSlug) {
    return {
      user,
      vendor: {
        id: user.id,
        slug: authority.vendorSlug,
        name: 'Vendor', // Will be fetched by caller if needed
      },
    }
  }

  // Return minimal vendor object for compatibility
  return {
    user,
    vendor: {
      id: user.id,
      slug: authority.effectiveRole === 'admin' ? 'admin' : 'user',
      name: authority.effectiveRole === 'admin' ? 'Admin' : 'User',
    },
  }
}

/**
 * Sign out current vendor
 */
export async function signOutVendor() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message || 'Failed to sign out')
  }
}

/**
 * Get current vendor session
 */
export async function getCurrentVendor() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch vendor record
  // Note: This may return 406 for admin/super users without vendor records (expected)
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id, slug, name, logo_url')
    .eq('user_id', user.id)
    .maybeSingle() // Use maybeSingle() instead of single() to avoid errors when no record exists

  // Handle errors gracefully - 406 is expected for admins without vendor records
  if (vendorError) {
    // PGRST116 = no rows returned (expected for admins)
    // 406 = Not Acceptable (RLS blocking, but expected for admins without vendor records)
    if (vendorError.code === 'PGRST116' || vendorError.code === '406' || vendorError.message?.includes('406')) {
      // This is expected - user is admin/super user without vendor record
      return null
    }
    // Log other errors but don't throw
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getCurrentVendor] Vendor query error (expected for admins):', vendorError.code, vendorError.message)
    }
    return null
  }

  if (!vendor) {
    return null
  }

  return {
    user,
    vendor,
  }
}

/**
 * Get current session (for checking auth state)
 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

