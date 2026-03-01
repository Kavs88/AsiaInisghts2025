/**
 * Server-side authority resolver
 * This file is for server components and server actions only
 * For client components, use authority-client.ts
 */
import { cache } from 'react'

export type UserRole = 'customer' | 'vendor' | 'admin' | 'super_user' | 'superadmin' | 'founder' | 'landlord'
export type EffectiveRole = 'super_user' | 'admin' | 'landlord' | 'vendor' | 'customer' | 'visitor'

export type AgencyMembership = {
  id: string
  name: string
  slug: string
  role: string
}

export interface UserAuthority {
  isSuperUser: boolean
  isAdmin: boolean
  isLandlord: boolean
  role: UserRole | null
  effectiveRole: EffectiveRole
  hasVendorRecord: boolean
  vendorSlug: string | null
  agencies: AgencyMembership[]
}

/**
 * Default authority for unauthenticated users
 */
function getDefaultAuthority(): UserAuthority {
  return {
    isSuperUser: false,
    isAdmin: false,
    isLandlord: false,
    role: null,
    effectiveRole: 'visitor',
    hasVendorRecord: false,
    vendorSlug: null,
    agencies: [],
  }
}

/**
 * Get user authority (server-side)
 * Reads from cookies and queries both super_users and users tables.
 * Wrapped with React cache() to deduplicate DB calls within a single request.
 */
export const getUserAuthorityServer = cache(async (): Promise<UserAuthority> => {
  try {
    // Dynamic import to avoid pulling next/headers into client bundles
    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const supabase = await createServerClient()
    
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

    // Determine effective role (precedence: super_user > admin > landlord > vendor > customer)
    let effectiveRole: EffectiveRole = 'visitor'
    if (isSuperUser || role === 'super_user' || role === 'superadmin' || role === 'founder') {
      effectiveRole = 'super_user'
    } else if (role === 'admin') {
      effectiveRole = 'admin'
    } else if (role === 'landlord') {
      effectiveRole = 'landlord'
    } else if (role === 'vendor') {
      effectiveRole = 'vendor'
    } else if (role === 'customer') {
      effectiveRole = 'customer'
    }

    // Admin check: super user OR admin role OR super_user role OR founder/superadmin
    const isAdmin = isSuperUser || role === 'admin' || role === 'super_user' || role === 'superadmin' || role === 'founder'

    // Landlord check: landlord role (admins also have access to landlord routes)
    const isLandlord = role === 'landlord' || isAdmin

    return {
      isSuperUser,
      isAdmin,
      isLandlord,
      role,
      effectiveRole,
      hasVendorRecord,
      vendorSlug,
      agencies,
    }
  } catch (error) {
    console.error('[getUserAuthorityServer] Error:', error)
    return getDefaultAuthority()
  }
})

/**
 * Check if user has admin access (server-side)
 * Uses authority resolver
 */
export async function hasAdminAccessServer(): Promise<boolean> {
  const authority = await getUserAuthorityServer()
  return authority.isAdmin
}

/**
 * Check if user has vendor access (server-side)
 * Uses authority resolver
 */
export async function hasVendorAccessServer(): Promise<boolean> {
  const authority = await getUserAuthorityServer()
  return authority.effectiveRole === 'vendor' || authority.isAdmin
}

/**
 * Check if user has landlord access (server-side)
 * Landlords and admins both have access to landlord routes.
 */
export async function hasLandlordAccessServer(): Promise<boolean> {
  const authority = await getUserAuthorityServer()
  return authority.isLandlord
}

