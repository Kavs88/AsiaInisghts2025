import { requireAdmin } from '@/lib/auth/server-admin-check'
import { getVendors } from '@/lib/supabase/queries'
import CreateStoryPageClient from './page-client'

export const dynamic = 'force-dynamic'

export default async function CreateStoryPage() {
  await requireAdmin()
  const vendors = await getVendors({ limit: 200 }).catch(() => [])

  return (
    <CreateStoryPageClient
      vendors={vendors.map((v: any) => ({ id: v.id, name: v.name }))}
    />
  )
}
