import { updateBusiness } from '@/lib/actions/admin-businesses'
import BusinessForm from '@/components/admin/BusinessForm'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface EditBusinessPageProps {
  params: {
    id: string
  }
}

export default async function EditBusinessPage({ params }: EditBusinessPageProps) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: businessRaw, error } = await (supabase as any)
    .from('entities')
    .select('*')
    .eq('id', params.id)
    .eq('type', 'business')
    .single()
  const business = businessRaw as any

  if (error || !business) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <BusinessForm
        title={`Edit ${business.name}`}
        initialData={business}
        onSubmit={async (data) => {
          'use server'
          return await updateBusiness(params.id, data)
        }}
      />
    </main>
  )
}
