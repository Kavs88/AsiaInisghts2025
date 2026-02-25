'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Follow Actions

export async function followEntity(entityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await (supabase
        .from('user_follows') as any)
        .insert({ user_id: user.id, entity_id: entityId })

    if (error) {
        console.error('Error following entity:', error)
        throw new Error('Failed to follow entity')
    }

    revalidatePath(`/makers/[slug]`, 'page')
    return { success: true }
}

export async function unfollowEntity(entityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('user_id', user.id)
        .eq('entity_id', entityId)

    if (error) {
        console.error('Error unfollowing entity:', error)
        throw new Error('Failed to unfollow entity')
    }

    revalidatePath(`/makers/[slug]`, 'page')
    return { success: true }
}

export async function getFollowStatus(entityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const { data, error } = await supabase
        .from('user_follows')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('entity_id', entityId)
        .maybeSingle()

    if (error) {
        console.error('Error checking follow status:', error)
        return false
    }

    return !!data
}

// Save Actions

export async function saveItem(itemType: 'event' | 'product' | 'property' | 'entity', itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await (supabase
        .from('user_saved_items') as any)
        .insert({
            user_id: user.id,
            item_type: itemType,
            item_id: itemId
        })

    if (error) {
        console.error('Error saving item:', error)
        throw new Error('Failed to save item')
    }

    return { success: true }
}

export async function unsaveItem(itemType: 'event' | 'product' | 'property' | 'entity', itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('user_saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)

    if (error) {
        console.error('Error unsaving item:', error)
        throw new Error('Failed to unsave item')
    }

    return { success: true }
}

export async function getSavedStatus(itemType: 'event' | 'product' | 'property' | 'entity', itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const { data, error } = await supabase
        .from('user_saved_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .maybeSingle()

    if (error) {
        console.error('Error checking saved status:', error)
        return false
    }

    return !!data
}
