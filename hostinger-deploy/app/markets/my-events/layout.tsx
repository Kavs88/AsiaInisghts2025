import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server-side protection for My Events page
 * Requires authentication
 */
export default async function MyEventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  if (!supabase) {
    redirect('/auth/login?redirect=/markets/my-events')
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login?redirect=/markets/my-events')
  }

  return <>{children}</>
}

