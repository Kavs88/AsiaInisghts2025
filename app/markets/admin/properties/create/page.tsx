import { createProperty } from '@/lib/actions/admin-properties'
import PropertyForm from '@/components/admin/PropertyForm'
import { requireAdmin } from '@/lib/auth/server-admin-check'

export default async function CreatePropertyPage() {
  await requireAdmin()

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <PropertyForm
        title="Create New Property"
        onSubmit={async (data) => {
          'use server'
          return await createProperty(data)
        }}
      />
    </main>
  )
}
