import { createBusiness } from '@/lib/actions/admin-businesses'
import BusinessForm from '@/components/admin/BusinessForm'
import { requireAdmin } from '@/lib/auth/server-admin-check'

export default async function CreateBusinessPage() {
  await requireAdmin()

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <BusinessForm
        title="Create New Business"
        onSubmit={async (data) => {
          'use server'
          return await createBusiness(data)
        }}
      />
    </main>
  )
}
