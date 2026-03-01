'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin, getAdminUserId } from '../auth/server-admin-check'

export type EventInput = {
    title: string
    description?: string
    event_type: 'market' | 'pantry' | 'workshop' | 'gathering' | 'other'
    start_at: string
    end_at: string
    status: 'draft' | 'published' | 'cancelled' | 'archived'
    property_id?: string | null
    location?: string | null
    organizer_id?: string
}

/**
 * Admin: Create a new event
 */
export async function createEvent(input: EventInput) {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
        .from('events')
        .insert([{ ...input }])
        .select()
        .single()

    if (error) {
        console.error('[createEvent] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/events')
    revalidateTag('events')
    return data
}

/**
 * Admin: Update an existing event
 */
export async function updateEvent(id: string, input: Partial<EventInput>) {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
        .from('events')
        .update({ ...input })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('[updateEvent] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/events')
    revalidatePath(`/markets/admin/events/${id}`)
    revalidatePath(`/markets/discovery/events/${id}`)
    revalidateTag('events')
    return data
}

/**
 * Admin: Delete an event
 */
export async function deleteEvent(id: string) {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any)
        .from('events')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('[deleteEvent] Error:', error.message)
        throw new Error(error.message)
    }

    revalidatePath('/markets/admin/events')
    revalidateTag('events')
    return { success: true }
}
