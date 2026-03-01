import { requireAdmin } from '@/lib/auth/server-admin-check'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminVendorEditPageClient from './page-client'

interface Props {
  params: { id: string }
}

export default async function AdminVendorEditPage({ params }: Props) {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('vendors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    notFound()
  }

  return <AdminVendorEditPageClient vendor={data} vendorId={params.id} />
}
