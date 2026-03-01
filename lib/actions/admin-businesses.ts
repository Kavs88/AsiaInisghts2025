'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin, getAdminUserId } from '../auth/server-admin-check'

export type BusinessInput = {
    name: string
    slug: string
    description?: string
    tags?: string[]
    location_text?: string
    logo_url?: string
    hero_image_url?: string
    confidence_score?: number
    owner_id?: string
}

/**
 * Admin: Create a new business (entity)
 */
export async function createBusiness(input: BusinessInput) {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
        .from('entities')
        .insert([{ ...input, type: 'business' }])
        .select()
        .single()

    if (error) {
        console.error('[createBusiness] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/businesses')
    revalidateTag('businesses')
    return data
}

/**
 * Admin: Update an existing business
 */
export async function updateBusiness(id: string, input: Partial<BusinessInput>) {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
        .from('entities')
        .update({ ...input })
        .eq('id', id)
        .eq('type', 'business')
        .select()
        .single()

    if (error) {
        console.error('[updateBusiness] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/businesses')
    revalidatePath(`/markets/admin/businesses/${id}`)
    revalidatePath(`/markets/discovery/${data.slug}`)
    revalidateTag('businesses')
    return data
}

/**
 * Admin: Delete a business
 */
export async function deleteBusiness(id: string) {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any)
        .from('entities')
        .delete()
        .eq('id', id)
        .eq('type', 'business')

    if (error) {
        console.error('[deleteBusiness] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/businesses')
    revalidateTag('businesses')
    return { success: true }
}
