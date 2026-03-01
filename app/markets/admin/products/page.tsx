import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminProductsPageClient from './page-client'

const PAGE_SIZE = 20

interface Props {
  searchParams: { page?: string }
}

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireAdmin()
  const supabase = await createClient()

  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count, error } = await (supabase as any)
    .from('products')
    .select(
      'id, name, slug, price, compare_at_price, stock_quantity, is_available, image_urls, created_at, vendors(id, name, slug)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <AdminProductsPageClient
      products={error ? [] : (data ?? [])}
      page={page}
      totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)}
      total={count ?? 0}
      error={error?.message ?? null}
    />
  )
}
