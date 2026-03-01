import { createDeal } from '@/lib/actions/admin-deals'
import DealForm from '@/components/admin/DealForm'
import { requireAdmin } from '@/lib/auth/server-admin-check'

export default async function CreateDealPage() {
    await requireAdmin()

    return (
        <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <DealForm
                title="Create New Deal"
                onSubmit={async (data) => {
                    'use server'
                    return await createDeal(data)
                }}
            />
        </main>
    )
}
