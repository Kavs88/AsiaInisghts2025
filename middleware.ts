import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware for server-side admin route protection
 * Protects all /admin and /markets/admin routes
 * Uses Supabase auth helpers for proper cookie-based session handling
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/markets/admin') || pathname.startsWith('/landlord')

  try {

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

    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/markets/admin')
    const isLandlordRoute = pathname.startsWith('/landlord')

    if (isAdminRoute || isLandlordRoute) {
      if (error || !user) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check user role in database — super_user role handled via users.role column
      const { data: userRecord, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = userRecord?.role

      if (dbError || !role) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const adminRoles = ['admin', 'super_user', 'superadmin', 'founder']

      if (isAdminRoute && !adminRoles.includes(role)) {
        return NextResponse.redirect(new URL('/?error=access_denied', request.url))
      }

      if (isLandlordRoute && role !== 'landlord' && !adminRoles.includes(role)) {
        // Redirect non-landlords to home with a message
        return NextResponse.redirect(new URL('/?error=access_denied', request.url))
      }
    }

    return response

  } catch (e) {
    // Supabase client failure — deny access to protected routes rather than failing open
    console.error('[middleware] Supabase client error on %s:', pathname, e)
    if (isProtectedRoute) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/markets/admin/:path*',
    '/landlord/:path*',
  ],
}

