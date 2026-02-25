'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Recommend Actions ---

export async function recommendEntity(entityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await (supabase
        .from('user_entity_signals') as any)
        .insert({
            user_id: user.id,
            entity_id: entityId,
            signal_type: 'recommend'
        })

    if (error) {
        // Ignore duplicate key error for idempotency
        if (error.code === '23505') {
            return { success: true }
        }
        console.error('Error recommending entity:', error)
        throw new Error('Failed to recommend entity')
    }

    revalidatePath(`/makers/[slug]`, 'page')
    return { success: true }
}

export async function unrecommendEntity(entityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('user_entity_signals')
        .delete()
        .eq('user_id', user.id)
        .eq('entity_id', entityId)
        .eq('signal_type', 'recommend')

    if (error) {
        console.error('Error unrecommending entity:', error)
        throw new Error('Failed to unrecommend entity')
    }

    revalidatePath(`/makers/[slug]`, 'page')
    return { success: true }
}

// --- Regular Actions ---

export async function markRegular(entityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await (supabase
        .from('user_entity_signals') as any)
        .insert({
            user_id: user.id,
            entity_id: entityId,
            signal_type: 'regular'
        })

    if (error) {
        // Ignore duplicate key error for idempotency
        if (error.code === '23505') {
            return { success: true }
        }
        console.error('Error marking regular:', error)
        throw new Error('Failed to mark as regular')
    }

    revalidatePath(`/makers/[slug]`, 'page')
    return { success: true }
}

export async function unmarkRegular(entityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('user_entity_signals')
        .delete()
        .eq('user_id', user.id)
        .eq('entity_id', entityId)
        .eq('signal_type', 'regular')

    if (error) {
        console.error('Error unmarking regular:', error)
        throw new Error('Failed to unmark as regular')
    }

    revalidatePath(`/makers/[slug]`, 'page')
    return { success: true }
}

// --- Fetch Actions ---

export async function getEntitySignals(entityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Get aggregate counts (silent graph, but optionally useful for summary if we wanted it later)
    // For now, we only need "Does this user signal?" AND "Are there others?"
    // The requirement says "No visible counts by default", but "Recommended by community members" implies we need to know IF there are recommendations.

    // Fetch user's own status
    let userContext = {
        isRecommended: false,
        isRegular: false
    }

    if (user) {
        const { data: userSignals } = await supabase
            .from('user_entity_signals')
            .select('signal_type')
            .eq('user_id', user.id)
            .eq('entity_id', entityId)

        if (userSignals) {
            userContext.isRecommended = (userSignals as any[]).some(s => s.signal_type === 'recommend')
            userContext.isRegular = (userSignals as any[]).some(s => s.signal_type === 'regular')
        }
    }

    // Fetch founder recommendation
    const { data: entityData } = await (supabase
        .from('entities') as any)
        .select('founder_recommended')
        .eq('id', entityId)
        .single()

    const isFounderRecommended = entityData?.founder_recommended || false

    // Fetch general community signals presence (Boolean only, not exact count to avoid query load if huge? Or count head?)
    // "Recommended by community members" -> implies > 0.
    const { count: recommendCount } = await supabase
        .from('user_entity_signals')
        .select('*', { count: 'exact', head: true })
        .eq('entity_id', entityId)
        .eq('signal_type', 'recommend')

    const { count: regularCount } = await supabase
        .from('user_entity_signals')
        .select('*', { count: 'exact', head: true })
        .eq('entity_id', entityId)
        .eq('signal_type', 'regular')

    return {
        user: userContext,
        community: {
            hasRecommendations: (recommendCount || 0) > 0,
            hasRegulars: (regularCount || 0) > 0,
            recommendCount: recommendCount || 0, // Keeping for internal logic, UI decides to show or not
            regularCount: regularCount || 0
        },
        founder: {
            isRecommended: isFounderRecommended
        }
    }
}
