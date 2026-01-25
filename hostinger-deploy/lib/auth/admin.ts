/**
 * Admin authentication and authorization utilities
 * Checks if a user has admin role
 * 
 * IMPORTANT: This uses the client-side Supabase client which reads from browser session
 */

import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Check if current user is admin (client-side)
 * This reads from the browser session and queries the public.users table
 */
export async function isAdmin(): Promise<boolean> {
  try {
    // Get client-side Supabase client (reads from browser session)
    const supabase = createClient()

    if (!supabase || !supabase.auth) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[isAdmin] Supabase client or auth is not available')
      }
      return false
    }

    // Get current authenticated user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('[isAdmin] Error getting user from session:', {
        message: userError.message,
        status: userError.status,
        name: userError.name
      })
      return false
    }

    if (!user) {
      console.warn('[isAdmin] No authenticated user found in session')
      return false
    }

    /* REMOVED: Excessive logging causing browser freezes
    console.log('[isAdmin] Checking admin role for authenticated user:', {
      id: user.id,
      email: user.email
    })
    */

    // Query public.users table for this user's role
    // This query respects RLS policies - user can only read their own record
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[isAdmin] Database query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: user.id
      })
      return false
    }

    if (!data) {
      console.error('[isAdmin] User record not found in public.users table:', {
        userId: user.id,
        email: user.email,
        note: 'User exists in auth.users but not in public.users. Run create_both_users.sql'
      })
      return false
    }

    // Check if role is exactly 'admin' (case-sensitive)
    const isAdminResult = (data as any).role === 'admin'

    /* REMOVED: Excessive logging causing browser freezes
    console.log('[isAdmin] Admin check result:', {
      userId: user.id,
      email: user.email,
      roleInDatabase: (data as any).role,
      isAdmin: isAdminResult,
      roleType: typeof (data as any).role,
      roleLength: (data as any).role?.length
    })
    */

    if (!isAdminResult) {
      console.warn('[isAdmin] User is NOT admin. Current role:', (data as any).role, 'Expected: "admin"')
    }

    return isAdminResult
  } catch (error: any) {
    console.error('[isAdmin] Unexpected exception:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return false
  }
}

/**
 * Check if current user is admin (server-side)
 * This reads from cookies and queries the public.users table
 */
export async function isAdminServer(): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    if (!supabase || !supabase.auth) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[isAdminServer] Server client or auth is not available')
      }
      return false
    }

    // Try getSession first (reads from cookies)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('[isAdminServer] Session error:', sessionError.message)
    }

    /* REMOVED: Excessive logging
    if (session?.user) {
      console.log('[isAdminServer] Found session for user:', {
        id: session.user.id,
        email: session.user.email
      })
    } else {
      console.warn('[isAdminServer] No session found, trying getUser()...')
    }
    */

    // Also try getUser (validates token)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    let currentUser = user

    if (authError) {
      console.error('[isAdminServer] Auth error:', {
        message: authError.message,
        status: authError.status
      })
      // If getUser fails but we have a session, use session user
      if (session?.user) {
        console.log('[isAdminServer] Using session user since getUser failed')
        currentUser = session.user
      } else {
        return false
      }
    }

    // Fallback to session user if getUser didn't return a user
    if (!currentUser && session?.user) {
      currentUser = session.user
    }

    if (!currentUser) {
      console.error('[isAdminServer] No authenticated user found')
      return false
    }

    /* REMOVED: Excessive logging
    console.log('[isAdminServer] Checking admin role for user:', {
      id: currentUser.id,
      email: currentUser.email
    })
    */

    // Query public.users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', currentUser.id)
      .single()

    if (error) {
      console.error('[isAdminServer] Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        userId: currentUser.id
      })
      return false
    }

    if (!data) {
      console.error('[isAdminServer] User record not found in public.users table:', {
        userId: currentUser.id,
        email: currentUser.email
      })
      return false
    }

    const isAdminResult = (data as any).role === 'admin'
    /* REMOVED: Excessive logging
    console.log('[isAdminServer] Admin check result:', {
      userId: currentUser.id,
      email: currentUser.email,
      role: (data as any).role,
      isAdmin: isAdminResult
    })
    */

    if (!isAdminResult) {
      console.warn('[isAdminServer] User is NOT admin. Role:', (data as any).role, 'Expected: "admin"')
    }

    return isAdminResult
  } catch (error: any) {
    console.error('[isAdminServer] Exception:', {
      message: error.message,
      stack: error.stack
    })
    return false
  }
}

/**
 * Get admin user info
 */
export async function getAdminUser() {
  try {
    const supabase = createClient()
    if (!supabase || !supabase.auth) {
      return null
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .eq('id', user.id)
      .single()

    const userData = data as any

    if (error || !userData || userData.role !== 'admin') {
      return null
    }

    return {
      id: userData.id,
      email: userData.email,
      fullName: userData.full_name,
      role: userData.role,
    }
  } catch (error) {
    console.error('[getAdminUser] Error:', error)
    return null
  }
}

/**
 * Check if current user is admin OR super user (client-side)
 * This is the recommended function to use for admin page access checks
 * DEPRECATED: Use hasAdminAccess() from authority.ts instead
 */
export async function isAdminOrSuperUser(): Promise<boolean> {
  const { hasAdminAccess } = await import('./authority-client')
  return await hasAdminAccess()
}

/**
 * Check if current user is admin OR super user (server-side)
 * This is the recommended function to use for server-side admin checks
 * DEPRECATED: Use hasAdminAccessServer() from authority.ts instead
 */
export async function isAdminOrSuperUserServer(): Promise<boolean> {
  const { hasAdminAccessServer } = await import('./authority')
  return await hasAdminAccessServer()
}
