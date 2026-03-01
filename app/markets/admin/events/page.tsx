import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminEventsPageClient from './page-client'

const PAGE_SIZE = 20

interface Props {
  searchParams: { page?: string }
}

export default async function AdminEventsPage({ searchParams }: Props) {
  await requireAdmin()
  const supabase = await createClient()

  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count, error } = await (supabase as any)
    .from('events')
    .select(
      'id, title, event_type, status, start_at, end_at, location, image_url, created_at',
      { count: 'exact' }
    )
    .order('start_at', { ascending: false })
    .range(from, to)

  return (
    <AdminEventsPageClient
      events={error ? [] : (data ?? [])}
      page={page}
      totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)}
      total={count ?? 0}
      error={error?.message ?? null}
    />
  )
}
