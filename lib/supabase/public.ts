/**
 * A cookie-free Supabase client for public (unauthenticated) server-side reads.
 *
 * Use this inside unstable_cache callbacks and anywhere you need to read
 * publicly-accessible data without a request context (no cookies needed).
 *
 * Do NOT use this for writes or auth-protected queries.
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let _client: ReturnType<typeof createClient<Database>> | null = null

export function createPublicClient() {
  if (_client) return _client
  _client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return _client
}
