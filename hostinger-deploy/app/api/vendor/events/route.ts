import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/vendor/events - Get current vendor's events
export async function GET() {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get vendor for this user
        const { data: vendor, error: vendorError } = await (supabase
            .from('vendors') as any)
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (vendorError || !vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
        }

        // Get vendor's events
        const { data, error } = await (supabase
            .from('events') as any)
            .select('*')
            .eq('host_id', (vendor as any).id)
            .eq('host_type', 'vendor')
            .order('start_at', { ascending: false }) as any

        if (error) {
            console.error('[GET /api/vendor/events] Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ events: data || [] })
    } catch (error: any) {
        console.error('[GET /api/vendor/events] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/vendor/events - Create new event
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get vendor for this user
        const { data: vendor, error: vendorError } = await (supabase
            .from('vendors') as any)
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (vendorError || !vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
        }

        const body = await request.json()

        // Create event
        const { data, error } = await (supabase
            .from('events') as any)
            .insert({
                title: body.title,
                description: body.description,
                start_at: body.start_at,
                end_at: body.end_at,
                host_type: 'vendor',
                host_id: (vendor as any).id,
                venue_type: body.venue_type || 'vendor',
                venue_id: body.venue_id || (vendor as any).id,
                venue_address_json: body.venue_address_json || null,
                status: body.status || 'draft',
            } as any)
            .select()
            .single() as any

        if (error) {
            console.error('[POST /api/vendor/events] Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ event: data }, { status: 201 })
    } catch (error: any) {
        console.error('[POST /api/vendor/events] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
