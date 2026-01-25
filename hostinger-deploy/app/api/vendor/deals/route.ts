import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/vendor/deals - Get current vendor's deals
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

        // Get vendor's deals
        const { data, error } = await (supabase
            .from('deals') as any)
            .select('*')
            .eq('vendor_id', (vendor as any).id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[GET /api/vendor/deals] Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ deals: data || [] })
    } catch (error: any) {
        console.error('[GET /api/vendor/deals] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/vendor/deals - Create new deal
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

        // Create deal
        const { data, error } = await (supabase
            .from('deals') as any)
            .insert({
                title: body.title,
                description: body.description,
                vendor_id: (vendor as any).id,
                valid_from: body.valid_from || new Date().toISOString(),
                valid_to: body.valid_to,
                status: body.status || 'draft',
            } as any)
            .select()
            .single() as any

        if (error) {
            console.error('[POST /api/vendor/deals] Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ deal: data }, { status: 201 })
    } catch (error: any) {
        console.error('[POST /api/vendor/deals] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
