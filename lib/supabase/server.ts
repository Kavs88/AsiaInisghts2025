/**
 * Server-side Supabase client utilities
 * This file is only used on the server and should not be imported in client components
 */

import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Create a Supabase client for Server Components and Server Actions
 * This is the recommended approach for Next.js 14+ App Router
 * 
 * IMPORTANT: This function uses dynamic imports to avoid pulling next/headers into client bundles
 */
/**
 * Create a Supabase client for Server Components, Server Actions, and Route Handlers.
 * This is the consolidated approach using @supabase/ssr.
 */
export async function createClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}








