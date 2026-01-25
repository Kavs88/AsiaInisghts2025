import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware for server-side admin route protection
 * Protects all /admin and /markets/admin routes
 * Uses Supabase auth helpers for proper cookie-based session handling
 */

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string, value: string, options: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser()

    // Check if this is an admin route
    // Protected admin routes require the user to be an admin
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/markets/admin')

    if (isAdminRoute) {
      if (error || !user) {
        // Not logged in, redirect to login
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check admin status
      // Check super_users table first (highest authority)
      const { data: superUserData } = await supabase
        .from('super_users')
        .select('uid')
        .eq('uid', user.id)
        .maybeSingle()

      if (superUserData) {
        return response // Super user has admin access
      }

      // Check user role in database
      const { data: userRecord, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (dbError || !userRecord || userRecord.role !== 'admin') {
        // Not an admin, redirect to login or home
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }

    return response

  } catch (e) {
    // If you are here, a Supabase client could not be created!
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

