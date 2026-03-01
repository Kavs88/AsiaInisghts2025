import { requireAdmin } from '@/lib/auth/server-admin-check'
import { getAllLegendsAdmin } from '@/lib/supabase/local-legends'
import AdminStoriesPageClient from './page-client'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  await requireAdmin()

  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const { data, count } = await getAllLegendsAdmin(page, PAGE_SIZE)

  return (
    <AdminStoriesPageClient
      stories={data}
      page={page}
      totalPages={Math.ceil(count / PAGE_SIZE)}
      total={count}
    />
  )
}
