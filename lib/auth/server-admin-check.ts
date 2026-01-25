/**
 * Server-side admin check utilities
 * Use these in Server Components and Server Actions
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if current user is admin (server-side)
 * Uses authority resolver - checks super_users table and users.role
 */
export async function isAdminServer(): Promise<boolean> {
  try {
    const { hasAdminAccessServer } = await import('./authority')
    return await hasAdminAccessServer()
  } catch (error) {
    return false
  }
}

/**
 * Require admin access - redirects to login if not admin
 * Use this in Server Components at the top level
 * Uses authority resolver to check super_users table and users.role
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await isAdminServer()

  if (!isAdmin) {
    redirect('/auth/login?error=unauthorized')
  }
}

/**
 * Get admin user ID (server-side)
 * Returns user ID if admin, null otherwise
 * Uses authority resolver to check super_users table and users.role
 */
export async function getAdminUserId(): Promise<string | null> {
  try {
    const { hasAdminAccessServer } = await import('./authority')
    const isAdmin = await hasAdminAccessServer()
    
    if (!isAdmin) {
      return null
    }

    const supabase = await createClient()
    if (!supabase) {
      return null
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    return user.id
  } catch (error) {
    return null
  }
}




