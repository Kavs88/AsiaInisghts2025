import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminBusinessesPageClient from './page-client'

const PAGE_SIZE = 20

interface Props {
  searchParams: { page?: string }
}

export default async function AdminBusinessesPage({ searchParams }: Props) {
  await requireAdmin()
  const supabase = await createClient()

  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count, error } = await (supabase as any)
    .from('entities')
    .select(
      'id, name, slug, description, location_text, logo_url, tags, created_at',
      { count: 'exact' }
    )
    .eq('type', 'business')
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <AdminBusinessesPageClient
      businesses={error ? [] : (data ?? [])}
      page={page}
      totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)}
      total={count ?? 0}
      error={error?.message ?? null}
    />
  )
}
