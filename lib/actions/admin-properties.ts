'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin, getAdminUserId } from '../auth/server-admin-check'

export type PropertyInput = {
    address: string
    type: 'apartment' | 'house' | 'condo' | 'villa' | 'commercial' | 'land' | 'other'
    availability: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
    price: number
    bedrooms?: number
    bathrooms?: number
    square_meters?: number
    description?: string
    contact_phone?: string
    contact_email?: string
    is_active?: boolean
    owner_id?: string
    images?: string[]
}

/**
 * Admin: Create a new property
 */
export async function createProperty(input: PropertyInput) {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
        .from('properties')
        .insert([{ ...input }])
        .select()
        .single()

    if (error) {
        console.error('[createProperty] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/properties')
    revalidateTag('properties')
    return data
}

/**
 * Admin: Update an existing property
 */
export async function updateProperty(id: string, input: Partial<PropertyInput>) {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
        .from('properties')
        .update({ ...input })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('[updateProperty] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/properties')
    revalidatePath(`/markets/admin/properties/${id}`)
    revalidateTag('properties')
    return data
}

/**
 * Admin: Delete a property
 */
export async function deleteProperty(id: string) {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any)
        .from('properties')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('[deleteProperty] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/properties')
    revalidateTag('properties')
    return { success: true }
}
