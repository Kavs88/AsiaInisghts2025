import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/events - Public events listing (published only)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        const limit = parseInt(searchParams.get('limit') || '20')
        const category = searchParams.get('category')

        let query = (supabase
            .from('events') as any)
            .select('*, vendors(id, name, slug, logo_url)')
            .eq('status', 'published')
            .gte('start_at', new Date().toISOString())
            .order('start_at', { ascending: true })
            .limit(limit)

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) {
            console.error('[GET /api/events] Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ events: data || [] }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
    } catch (error: any) {
        console.error('[GET /api/events] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
