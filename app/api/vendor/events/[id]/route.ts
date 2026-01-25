import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/vendor/events/[id] - Get specific event
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()

        const { data, error } = await (supabase
            .from('events') as any)
            .select('*')
            .eq('id', params.id)
            .single() as any

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        return NextResponse.json({ event: data })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/vendor/events/[id] - Update event
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
        const { data: existingEvent, error: checkError } = await (supabase
            .from('events') as any)
            .select('host_id, host_type')
            .eq('id', params.id)
            .single() as any

        if (checkError || !existingEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        if (existingEvent.host_type !== 'vendor' || existingEvent.host_id !== vendor.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()

        // Update event
        const { data, error } = await (supabase
            .from('events') as any)
            .update({
                title: body.title,
                description: body.description,
                start_at: body.start_at,
                end_at: body.end_at,
                venue_type: body.venue_type,
                venue_id: body.venue_id,
                venue_address_json: body.venue_address_json,
                status: body.status,
                updated_at: new Date().toISOString(),
            } as any)
            .eq('id', params.id)
            .select()
            .single() as any

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ event: data })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/vendor/events/[id] - Archive event
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
        const { data: existingEvent, error: checkError } = await (supabase
            .from('events') as any)
            .select('host_id, host_type')
            .eq('id', params.id)
            .single() as any

        if (checkError || !existingEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        if (existingEvent.host_type !== 'vendor' || existingEvent.host_id !== vendor.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Soft delete - archive the event
        const { error } = await (supabase
            .from('events') as any)
            .update({ status: 'archived', updated_at: new Date().toISOString() } as any)
            .eq('id', params.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
