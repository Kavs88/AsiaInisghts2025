'use client'

/**
 * Client-side authority resolver
 * This file is safe to import in client components
 */

import { createClient } from '@/lib/supabase/client'

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



