'use client'

/**
 * Client-side authority resolver
 * This file is safe to import in client components
 */

import { createClient } from '@/lib/supabase/client'

export type UserRole = 'customer' | 'vendor' | 'admin' | 'super_user' | 'superadmin' | 'founder' | 'landlord'
export type EffectiveRole = 'super_user' | 'admin' | 'vendor' | 'customer' | 'visitor'

export type AgencyMembership = {
  id: string
  name: string
  slug: string
  role: string
}

export interface UserAuthority {
  isSuperUser: boolean
  isAdmin: boolean
  role: UserRole | null
  effectiveRole: EffectiveRole
  hasVendorRecord: boolean
  vendorSlug: string | null
  agencies: AgencyMembership[]
}

/**
 * Get user authority (client-side)
 * Reads from browser session and queries both super_users and users tables
 */
export async function getUserAuthority(): Promise<UserAuthority> {
  try {
    const supabase = createClient()

    if (!supabase || !supabase.auth) {
      return getDefaultAuthority()
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return getDefaultAuthority()
    }

    // super_users table was dropped — role-based checks handle authority
    const isSuperUser = false

    // Get user role from users table
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const role = userRecord ? ((userRecord as any).role as UserRole) : null

    // Check if user has vendor record
    const { data: vendorRecord } = await supabase
      .from('vendors')
      .select('slug')
      .eq('user_id', user.id)
      .maybeSingle()

    const hasVendorRecord = !!vendorRecord
    const vendorSlug = vendorRecord ? ((vendorRecord as any).slug as string) : null

    // Get all agency memberships for this user
    const { data: agencyMemberships } = await supabase
      .from('agency_members')
      .select('role, agencies(id, name, slug)')
      .eq('user_id', user.id)

    const agencies: AgencyMembership[] = (agencyMemberships ?? []).map((m: any) => ({
      id: m.agencies.id,
      name: m.agencies.name,
      slug: m.agencies.slug,
      role: m.role,
    }))

    // Determine effective role (precedence: super_user > admin > vendor > customer)
    let effectiveRole: EffectiveRole = 'visitor'
    if (isSuperUser || role === 'super_user' || role === 'superadmin' || role === 'founder') {
      effectiveRole = 'super_user'
    } else if (role === 'admin') {
      effectiveRole = 'admin'
    } else if (role === 'vendor') {
      effectiveRole = 'vendor'
    } else if (role === 'customer') {
      effectiveRole = 'customer'
    }

    // Admin check: super user OR admin role OR super_user/superadmin/founder roles
    const isAdmin = isSuperUser || role === 'admin' || role === 'super_user' || role === 'superadmin' || role === 'founder'

    return {
      isSuperUser,
      isAdmin,
      role,
      effectiveRole,
      hasVendorRecord,
      vendorSlug,
      agencies,
    }
  } catch (error) {
    console.error('[getUserAuthority] Error:', error)
    return getDefaultAuthority()
  }
}

/**
 * Default authority for unauthenticated users
 */
function getDefaultAuthority(): UserAuthority {
  return {
    isSuperUser: false,
    isAdmin: false,
    role: null,
    effectiveRole: 'visitor',
    hasVendorRecord: false,
    vendorSlug: null,
    agencies: [],
  }
}

/**
 * Check if user has admin access (client-side)
 * Uses authority resolver
 */
export async function hasAdminAccess(): Promise<boolean> {
  const authority = await getUserAuthority()
  return authority.isAdmin
}

/**
 * Check if user has vendor access (client-side)
 * Uses authority resolver
 */
export async function hasVendorAccess(): Promise<boolean> {
  const authority = await getUserAuthority()
  return authority.effectiveRole === 'vendor' || authority.isAdmin
}



