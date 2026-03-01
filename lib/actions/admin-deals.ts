'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '../auth/server-admin-check'

export type DealInput = {
    title: string
    description?: string
    vendor_id: string
    valid_from?: string
    valid_to?: string
    status: 'active' | 'expired' | 'draft'
}

/**
 * Admin: Create a new deal
 */
export async function createDeal(input: DealInput) {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
        .from('deals')
        .insert([{ ...input }])
        .select()
        .single()

    if (error) {
        console.error('[createDeal] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/deals')
    revalidateTag('deals')
    return data
}

/**
 * Admin: Update an existing deal
 */
export async function updateDeal(id: string, input: Partial<DealInput>) {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
        .from('deals')
        .update({ ...input })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('[updateDeal] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/deals')
    revalidatePath(`/markets/admin/deals/${id}`)
    revalidateTag('deals')
    return data
}

/**
 * Admin: Delete a deal
 */
export async function deleteDeal(id: string) {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any)
        .from('deals')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('[deleteDeal] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/deals')
    revalidateTag('deals')
    return { success: true }
}
