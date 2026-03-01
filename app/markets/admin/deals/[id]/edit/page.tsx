import { updateDeal } from '@/lib/actions/admin-deals'
import DealForm from '@/components/admin/DealForm'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface EditDealPageProps {
    params: {
        id: string
    }
}

export default async function EditDealPage({ params }: EditDealPageProps) {
    await requireAdmin()
    const supabase = await createClient()

    const { data: dealRaw, error } = await (supabase as any)
        .from('deals')
        .select('*')
        .eq('id', params.id)
        .single()

    const deal = dealRaw as any

    if (error || !deal) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <DealForm
                title={`Edit ${deal.title}`}
                initialData={deal}
                onSubmit={async (data) => {
                    'use server'
                    return await updateDeal(params.id, data)
                }}
            />
        </main>
    )
}
