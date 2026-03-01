import { updateProperty } from '@/lib/actions/admin-properties'
import PropertyForm from '@/components/admin/PropertyForm'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface EditPropertyPageProps {
  params: {
    id: string
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: propertyRaw, error } = await (supabase as any)
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()
  const property = propertyRaw as any

  if (error || !property) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <PropertyForm
        title={`Edit ${property.address}`}
        initialData={property}
        onSubmit={async (data) => {
          'use server'
          return await updateProperty(params.id, data)
        }}
      />
    </main>
  )
}
