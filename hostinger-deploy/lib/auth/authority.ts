/**
 * Server-side authority resolver
 * This file is for server components and server actions only
 * For client components, use authority-client.ts
 */

export type UserRole = 'customer' | 'vendor' | 'admin' | 'super_user'
export type EffectiveRole = 'super_user' | 'admin' | 'vendor' | 'customer' | 'visitor'

export interface UserAuthority {
  isSuperUser: boolean
  isAdmin: boolean
  role: UserRole | null
  effectiveRole: EffectiveRole
  hasVendorRecord: boolean
  vendorSlug: string | null
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
  }
}

/**
 * Get user authority (server-side)
 * Reads from cookies and queries both super_users and users tables
 */
export async function getUserAuthorityServer(): Promise<UserAuthority> {
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

    // Check super_users table first (highest authority)
    const { data: superUserData } = await supabase
      .from('super_users')
      .select('uid')
      .eq('uid', user.id)
      .maybeSingle()

    const isSuperUser = !!superUserData

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

    // Determine effective role (precedence: super_user > admin > vendor > customer)
    let effectiveRole: EffectiveRole = 'visitor'
    if (isSuperUser || role === 'super_user') {
      effectiveRole = 'super_user'
    } else if (role === 'admin') {
      effectiveRole = 'admin'
    } else if (role === 'vendor') {
      effectiveRole = 'vendor'
    } else if (role === 'customer') {
      effectiveRole = 'customer'
    }

    // Admin check: super user OR admin role OR super_user role
    const isAdmin = isSuperUser || role === 'admin' || role === 'super_user'

    return {
      isSuperUser,
      isAdmin,
      role,
      effectiveRole,
      hasVendorRecord,
      vendorSlug,
    }
  } catch (error) {
    console.error('[getUserAuthorityServer] Error:', error)
    return getDefaultAuthority()
  }
}

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

