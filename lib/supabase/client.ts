import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Singleton client instance to prevent multiple client instances
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Create Supabase client for client components
 * Uses singleton pattern to prevent multiple client instances
 * Uses @supabase/ssr to ensure cookies are synchronized for server access
 */
export const createClient = () => {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    // We can't easily mock the SSR client, so we throw or return null implies broken setup
    // But for safety, we'll try to create it anyway if keys are missing (will fail on flush)
    // or just Log header.
  }

  // Create client with cookie handling
  supabaseClient = createBrowserClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!
  )

  return supabaseClient
}

