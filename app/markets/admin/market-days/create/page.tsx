import { requireAdmin } from '@/lib/auth/server-admin-check'
import { createClient } from '@/lib/supabase/server'
import { getAllHosts } from '@/lib/supabase/queries'
import CreateMarketDayPageClient from './page-client'

export default async function CreateMarketDayPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [hosts, propertiesResult] = await Promise.all([
    getAllHosts(),
    (supabase as any)
      .from('properties')
      .select('id, address, capacity')
      .eq('property_type', 'event_space')
      .eq('is_active', true)
      .order('address', { ascending: true }),
  ])

  return (
    <CreateMarketDayPageClient
      hosts={hosts}
      eventSpaceProperties={propertiesResult.data ?? []}
    />
  )
}
