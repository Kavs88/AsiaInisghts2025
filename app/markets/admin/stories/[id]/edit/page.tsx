import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import { getLegendByIdAdmin } from '@/lib/supabase/local-legends'
import { getVendors } from '@/lib/supabase/queries'
import EditStoryPageClient from './page-client'

export const dynamic = 'force-dynamic'

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  await requireAdmin()

  const [story, vendors] = await Promise.all([
    getLegendByIdAdmin(params.id),
    getVendors({ limit: 200 }).catch(() => []),
  ])

  if (!story) notFound()

  return (
    <EditStoryPageClient
      story={story}
      vendors={vendors.map((v: any) => ({ id: v.id, name: v.name }))}
    />
  )
}
