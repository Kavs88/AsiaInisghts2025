import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/deals - Public deals listing (active only)
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        const limit = parseInt(searchParams.get('limit') || '20')
        const vendorId = searchParams.get('vendor_id')

        let query = (supabase
            .from('deals') as any)
            .select('*, vendors(id, name, slug, logo_url)')
            .eq('status', 'active')
            .gte('valid_to', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(limit)

        if (vendorId) {
            query = query.eq('vendor_id', vendorId)
        }

        const { data, error } = await query

        if (error) {
            console.error('[GET /api/deals] Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ deals: data || [] }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
    } catch (error: any) {
        console.error('[GET /api/deals] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
