/**
 * Super user authentication and authorization utilities
 * Checks if a user has super user access (full site owner privileges)
 * 
 * Super users have full access to all data regardless of admin role.
 * This is separate from admin role to allow site owner access even if
 * they don't have admin role in the users table.
 */

import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Check if current user is a super user (client-side)
 * This reads from the browser session and queries the public.super_users table
 */
export async function isSuperUser(): Promise<boolean> {
  try {
    // Get client-side Supabase client (reads from browser session)
    const supabase = createClient()

    if (!supabase || !supabase.auth) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[isSuperUser] Supabase client or auth is not available')
      }
      return false
    }

    // Get current authenticated user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('[isSuperUser] Error getting user from session:', {
        message: userError.message,
        status: userError.status,
        name: userError.name
      })
      return false
    }

    if (!user) {
      console.warn('[isSuperUser] No authenticated user found in session')
      return false
    }

    /* REMOVED: Excessive logging causing browser freezes
    console.log('[isSuperUser] Checking super user status for authenticated user:', {
      id: user.id,
      email: user.email
    })
    */

    // Query public.super_users table for this user's UID
    // This query respects RLS policies - only super users and admins can read
    const { data, error } = await supabase
      .from('super_users')
      .select('uid')
      .eq('uid', user.id)
      .single()

    if (error) {
      // If error is "PGRST116" (no rows returned), user is not a super user
      if (error.code === 'PGRST116') {
        // console.log('[isSuperUser] User is not a super user')
        return false
      }

      console.error('[isSuperUser] Database query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: user.id
      })
      return false
    }

    const isSuperUserResult = !!data

    /* REMOVED: Excessive logging
    console.log('[isSuperUser] Super user check result:', {
      userId: user.id,
      email: user.email,
      isSuperUser: isSuperUserResult
    })
    */

    return isSuperUserResult
  } catch (error: any) {
    console.error('[isSuperUser] Unexpected exception:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return false
  }
}

/**
 * Check if current user is a super user (server-side)
 * This reads from cookies and queries the public.super_users table
 */
export async function isSuperUserServer(): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    if (!supabase || !supabase.auth) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[isSuperUserServer] Server client or auth is not available')
      }
      return false
    }

    // Try getSession first (reads from cookies)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('[isSuperUserServer] Session error:', sessionError.message)
    }

    /* REMOVED: Excessive logging
    if (session?.user) {
      console.log('[isSuperUserServer] Found session for user:', {
        id: session.user.id,
        email: session.user.email
      })
    } else {
      console.warn('[isSuperUserServer] No session found, trying getUser()...')
    }
    */

    // Also try getUser (validates token)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    let currentUser = user

    if (authError) {
      console.error('[isSuperUserServer] Auth error:', {
        message: authError.message,
        status: authError.status
      })
      // If getUser fails but we have a session, use session user
      if (session?.user) {
        console.log('[isSuperUserServer] Using session user since getUser failed')
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
      console.error('[isSuperUserServer] No authenticated user found')
      return false
    }

    /* REMOVED: Excessive logging
    console.log('[isSuperUserServer] Checking super user status for user:', {
      id: currentUser.id,
      email: currentUser.email
    })
    */

    // Query public.super_users table
    const { data, error } = await supabase
      .from('super_users')
      .select('uid')
      .eq('uid', currentUser.id)
      .single()

    if (error) {
      // If error is "PGRST116" (no rows returned), user is not a super user
      if (error.code === 'PGRST116') {
        // console.log('[isSuperUserServer] User is not a super user')
        return false
      }

      console.error('[isSuperUserServer] Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        userId: currentUser.id
      })
      return false
    }

    const isSuperUserResult = !!data
    /* REMOVED: Excessive logging
    console.log('[isSuperUserServer] Super user check result:', {
      userId: currentUser.id,
      email: currentUser.email,
      isSuperUser: isSuperUserResult
    })
    */

    return isSuperUserResult
  } catch (error: any) {
    console.error('[isSuperUserServer] Exception:', {
      message: error.message,
      stack: error.stack
    })
    return false
  }
}

/**
 * Check if current user is admin OR super user (client-side)
 * Useful for UI checks where either admin or super user should have access
 */
export async function isAdminOrSuperUser(): Promise<boolean> {
  const { isAdmin } = await import('./admin')
  const isAdminResult = await isAdmin()
  const isSuperUserResult = await isSuperUser()
  return isAdminResult || isSuperUserResult
}

/**
 * Check if current user is admin OR super user (server-side)
 * Useful for server-side checks where either admin or super user should have access
 */
export async function isAdminOrSuperUserServer(): Promise<boolean> {
  const { isAdminServer } = await import('./admin')
  const isAdminResult = await isAdminServer()
  const isSuperUserResult = await isSuperUserServer()
  return isAdminResult || isSuperUserResult
}

/**
 * Get super user info
 */
export async function getSuperUser() {
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
      .from('super_users')
      .select('uid, email, full_name, notes, created_at')
      .eq('uid', user.id)
      .single()

    if (error || !data) {
      return null
    }

    const userData = data as any

    return {
      uid: userData.uid,
      email: userData.email,
      fullName: userData.full_name,
      notes: userData.notes,
      createdAt: userData.created_at,
    }
  } catch (error) {
    console.error('[getSuperUser] Error:', error)
    return null
  }
}


