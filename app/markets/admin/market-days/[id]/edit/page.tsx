import { requireAdmin } from '@/lib/auth/server-admin-check'
import { createClient } from '@/lib/supabase/server'
import { getAllHosts } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import EditMarketDayPageClient from './page-client'

interface Props {
  params: { id: string }
}

export default async function EditMarketDayPage({ params }: Props) {
  await requireAdmin()
  const supabase = await createClient()

  const [marketDayResult, hosts, propertiesResult] = await Promise.all([
    (supabase as any)
      .from('market_days')
      .select('*')
      .eq('id', params.id)
      .single(),
    getAllHosts(),
    (supabase as any)
      .from('properties')
      .select('id, address, capacity')
      .eq('property_type', 'event_space')
      .eq('is_active', true)
      .order('address', { ascending: true }),
  ])

  if (marketDayResult.error || !marketDayResult.data) {
    notFound()
  }

  return (
    <EditMarketDayPageClient
      marketDay={marketDayResult.data}
      marketDayId={params.id}
      hosts={hosts}
      eventSpaceProperties={propertiesResult.data ?? []}
    />
  )
}
