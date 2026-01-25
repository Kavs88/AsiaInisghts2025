import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/vendor/deals/[id] - Get specific deal
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()

        const { data, error } = await (supabase
            .from('deals') as any)
            .select('*')
            .eq('id', params.id)
            .single() as any

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        return NextResponse.json({ deal: data })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/vendor/deals/[id] - Update deal
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get vendor
        const { data: vendor, error: vendorError } = await (supabase
            .from('vendors') as any)
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (vendorError || !vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
        }

        // Verify ownership
        const { data: existingDeal, error: checkError } = await (supabase
            .from('deals') as any)
            .select('vendor_id')
            .eq('id', params.id)
            .single() as any

        if (checkError || !existingDeal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
        }

        if (existingDeal.vendor_id !== vendor.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()

        // Update deal
        const { data, error } = await (supabase
            .from('deals') as any)
            .update({
                title: body.title,
                description: body.description,
                valid_from: body.valid_from,
                valid_to: body.valid_to,
                status: body.status,
                updated_at: new Date().toISOString(),
            } as any)
            .eq('id', params.id)
            .select()
            .single() as any

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ deal: data })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/vendor/deals/[id] - Archive deal
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get vendor
        const { data: vendor, error: vendorError } = await (supabase
            .from('vendors') as any)
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (vendorError || !vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
        }

        // Verify ownership
        const { data: existingDeal, error: checkError } = await (supabase
            .from('deals') as any)
            .select('vendor_id')
            .eq('id', params.id)
            .single() as any

        if (checkError || !existingDeal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
        }

        if (existingDeal.vendor_id !== vendor.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Soft delete - set status to expired
        const { error } = await (supabase
            .from('deals') as any)
            .update({ status: 'expired', updated_at: new Date().toISOString() } as any)
            .eq('id', params.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
