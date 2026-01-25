import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/reviews/[id]
 * Update own review
 * Requires authentication
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            )
        }

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const reviewId = params.id
        const body = await request.json()
        const { rating, comment, images } = body

        // Check if review exists and belongs to user
        const { data: existingReview, error: fetchError } = await (supabase
            .from('reviews') as any)
            .select('user_id')
            .eq('id', reviewId)
            .single() as any

        if (fetchError || !existingReview) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            )
        }

        if (existingReview.user_id !== user.id) {
            return NextResponse.json(
                { error: 'You can only update your own reviews' },
                { status: 403 }
            )
        }

        // Build update object
        const updateData: any = {}
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return NextResponse.json(
                    { error: 'rating must be between 1 and 5' },
                    { status: 400 }
                )
            }
            updateData.rating = rating
        }
        if (comment !== undefined) updateData.comment = comment || null
        if (images !== undefined) updateData.images = Array.isArray(images) ? images : null

        // Update review
        const { data: review, error: updateError } = await (supabase
            .from('reviews') as any)
            .update(updateData as any)
            .eq('id', reviewId)
            .select(`
                *,
                users:user_id (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .single() as any

        if (updateError) {
            console.error('[PUT /api/reviews/[id]] Update error:', updateError)
            return NextResponse.json(
                { error: 'Failed to update review', details: updateError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            review,
            message: 'Review updated successfully'
        })
    } catch (error: any) {
        console.error('[PUT /api/reviews/[id]] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/reviews/[id]
 * Delete own review
 * Requires authentication
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            )
        }

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const reviewId = params.id

        // Check if review exists and belongs to user
        const { data: existingReview, error: fetchError } = await (supabase
            .from('reviews') as any)
            .select('user_id')
            .eq('id', reviewId)
            .single() as any

        if (fetchError || !existingReview) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            )
        }

        if (existingReview.user_id !== user.id) {
            return NextResponse.json(
                { error: 'You can only delete your own reviews' },
                { status: 403 }
            )
        }

        // Delete review
        const { error: deleteError } = await (supabase
            .from('reviews') as any)
            .delete()
            .eq('id', reviewId)

        if (deleteError) {
            console.error('[DELETE /api/reviews/[id]] Delete error:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete review', details: deleteError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: 'Review deleted successfully'
        })
    } catch (error: any) {
        console.error('[DELETE /api/reviews/[id]] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}





