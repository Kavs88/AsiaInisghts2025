'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Returns the next upcoming published market day, or null if none scheduled.
 * Used by the homepage widget to display a live date.
 */
export async function getNextMarketDay(): Promise<{ market_date: string; location_name: string | null } | null> {
    const supabase = await createClient()
    if (!supabase) return null

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('market_days')
        .select('market_date, location_name')
        .eq('is_published', true)
        .gte('market_date', today)
        .order('market_date', { ascending: true })
        .limit(1)
        .maybeSingle()

    if (error || !data) return null
    return data
}
