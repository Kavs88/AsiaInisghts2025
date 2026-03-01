import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import { notFound } from 'next/navigation'
import AdminOrderDetailsPageClient from './page-client'

interface Props {
  params: { id: string }
}

export default async function AdminOrderDetailsPage({ params }: Props) {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('orders')
    .select(`
      id, order_number, status, total_amount,
      customer_name, customer_email, customer_phone,
      created_at,
      vendors(id, name, slug),
      order_items(id, quantity, price, products(id, name, slug, image_urls))
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) {
    notFound()
  }

  return <AdminOrderDetailsPageClient order={data} />
}
