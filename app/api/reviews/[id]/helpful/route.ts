import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/reviews/[id]/helpful
 * Vote a review as helpful
 * Requires authentication
 */
export async function POST(
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

        // Check if review exists
        const { data: review, error: reviewError } = await (supabase
            .from('reviews') as any)
            .select('id, user_id')
            .eq('id', reviewId)
            .single() as any

        if (reviewError || !review) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            )
        }

        // Users can't vote on their own reviews
        if (review.user_id === user.id) {
            return NextResponse.json(
                { error: 'You cannot vote on your own review' },
                { status: 400 }
            )
        }

        // Check if user already voted
        const { data: existingVote } = await (supabase
            .from('review_helpful_votes') as any)
            .select('id')
            .eq('review_id', reviewId)
            .eq('user_id', user.id)
            .maybeSingle() as any

        if (existingVote) {
            return NextResponse.json(
                { error: 'You have already voted on this review' },
                { status: 400 }
            )
        }

        // Create helpful vote (trigger will update helpful_count)
        const { data: vote, error: insertError } = await (supabase
            .from('review_helpful_votes') as any)
            .insert({
                review_id: reviewId,
                user_id: user.id
            } as any)
            .select()
            .single() as any

        if (insertError) {
            console.error('[POST /api/reviews/[id]/helpful] Insert error:', insertError)
            return NextResponse.json(
                { error: 'Failed to vote', details: insertError.message },
                { status: 500 }
            )
        }

        // Get updated helpful count
        const { data: updatedReview } = await (supabase
            .from('reviews')
            .select('helpful_count')
            .eq('id', reviewId)
            .single() as any)

        return NextResponse.json({
            message: 'Vote recorded',
            helpful_count: updatedReview?.helpful_count || 0
        })
    } catch (error: any) {
        console.error('[POST /api/reviews/[id]/helpful] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/reviews/[id]/helpful
 * Remove helpful vote
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

        // Delete helpful vote (trigger will update helpful_count)
        const { error: deleteError } = await (supabase
            .from('review_helpful_votes') as any)
            .delete()
            .eq('review_id', reviewId)
            .eq('user_id', user.id) as any

        if (deleteError) {
            console.error('[DELETE /api/reviews/[id]/helpful] Delete error:', deleteError)
            return NextResponse.json(
                { error: 'Failed to remove vote', details: deleteError.message },
                { status: 500 }
            )
        }

        // Get updated helpful count
        const { data: updatedReview } = await (supabase
            .from('reviews')
            .select('helpful_count')
            .eq('id', reviewId)
            .single() as any)

        return NextResponse.json({
            message: 'Vote removed',
            helpful_count: updatedReview?.helpful_count || 0
        })
    } catch (error: any) {
        console.error('[DELETE /api/reviews/[id]/helpful] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}





