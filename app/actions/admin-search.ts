'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function askAsiaInsights(query: string) {
    const cookieStore = cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    // 1. Check Auth (Redundant if middleware works, but good practice)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 2. Simple Semantic Search Stub (Keyword match for now until pgvector is wired up in app)
    // In Phase 2, this will be replaced by `embedding` similarity search.
    const { data: entities, error: entityError } = await supabase
        .from('entities')
        .select('id, name, type, description, location_text, tags, confidence_score')
        .textSearch('name', query, { type: 'websearch', config: 'english' }) // Fallback to basic text search
        .limit(5)

    if (entityError) {
        console.error('Entity Search Error:', entityError)
        // Don't crash, just return empty
    }

    // 3. Search Insights Drafts
    const { data: insights, error: insightError } = await supabase
        .from('insights_drafts')
        .select('id, raw_text, source_url, detected_topic, status')
        .ilike('raw_text', `%${query}%`) // Simple LIKE for now
        .limit(3)

    return {
        query,
        results: {
            entities: entities || [],
            insights: insights || []
        }
    }
}
