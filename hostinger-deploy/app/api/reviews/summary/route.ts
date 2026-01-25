import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/reviews/summary
 * Get review summary statistics for a subject
 * 
 * Query params:
 * - subject_id: UUID of the subject
 * - subject_type: 'business' | 'vendor' | 'market_day'
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const subjectId = searchParams.get('subject_id')
        const subjectType = searchParams.get('subject_type') as 'business' | 'vendor' | 'market_day' | null

        if (!subjectId || !subjectType) {
            return NextResponse.json(
                { error: 'subject_id and subject_type are required' },
                { status: 400 }
            )
        }

        if (!['business', 'vendor', 'market_day'].includes(subjectType)) {
            return NextResponse.json(
                { error: 'subject_type must be business, vendor, or market_day' },
                { status: 400 }
            )
        }

        // Query review_summaries view
        const { data, error } = await (supabase
            .from('review_summaries') as any)
            .select('*')
            .eq('subject_id', subjectId)
            .eq('subject_type', subjectType)
            .maybeSingle() as any

        if (error) {
            console.error('[GET /api/reviews/summary] Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch review summary', details: error.message },
                { status: 500 }
            )
        }

        // If no reviews exist, return default values
        if (!data) {
            return NextResponse.json({
                total_reviews: 0,
                average_rating: 0,
                five_star_count: 0,
                four_star_count: 0,
                three_star_count: 0,
                two_star_count: 0,
                one_star_count: 0,
                verified_reviews_count: 0,
                latest_review_at: null
            })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('[GET /api/reviews/summary] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}



