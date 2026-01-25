import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

/**
 * Middleware for server-side admin route protection
 * Protects all /admin and /markets/admin routes
 * Uses Supabase auth helpers for proper cookie-based session handling
 */

// Explicitly set runtime to Node.js for Hostinger compatibility
export const runtime = 'nodejs'

async function isAdminUser(request: NextRequest): Promise<boolean> {
  try {
    // Get Supabase URL and anon key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return false
    }

    // Create Supabase client for middleware
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return false
    }

    // Check super_users table first (highest authority)
    const { data: superUserData } = await supabase
      .from('super_users')
      .select('uid')
      .eq('uid', user.id)
      .maybeSingle()

    if (superUserData) {
      return true // Super user has admin access
    }

    // Check user role in database
    const { data: userRecord, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (dbError || !userRecord) {
      return false
    }

    // Check if user is admin
    return userRecord.role === 'admin'
  } catch (error) {
    // Fail silently in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[middleware] Error checking admin status:', error)
    }
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is an admin route
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/markets/admin')

  if (!isAdminRoute) {
    // Not an admin route, allow through
    return NextResponse.next()
  }

  // Check if user is admin
  const isAdmin = await isAdminUser(request)

  if (!isAdmin) {
    // Not an admin, redirect to login or home
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin user, allow through
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/markets/admin/:path*',
  ],
}

