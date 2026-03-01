import { requireAdmin } from '@/lib/auth/server-admin-check'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminProductEditPageClient from './page-client'

interface Props {
  params: { id: string }
}

export default async function AdminProductEditPage({ params }: Props) {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('products')
    .select('*, vendors(id, name, slug)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    notFound()
  }

  return <AdminProductEditPageClient product={data} />
}
