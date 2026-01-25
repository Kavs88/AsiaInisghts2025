import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Singleton client instance to prevent multiple GoTrueClient instances
let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

/**
 * Create Supabase client for client components
 * Uses singleton pattern to prevent multiple GoTrueClient instances
 * Simple browser client for client-side operations
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
    // Return a mock client to prevent crashes
    supabaseClient = createSupabaseClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
    return supabaseClient
  }

  supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}

