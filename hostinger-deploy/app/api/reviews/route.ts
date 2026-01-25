import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/reviews
 * Fetch reviews for a subject (business, vendor, or market_day)
 * 
 * Query params:
 * - subject_id: UUID of the subject
 * - subject_type: 'business' | 'vendor' | 'market_day'
 * - page: page number (default: 1)
 * - limit: items per page (default: 20)
 * - sort: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' (default: 'newest')
 * - filter: 'all' | 'verified' | '5star' | '4star' | '3star' | '2star' | '1star' (default: 'all')
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
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
        const sort = searchParams.get('sort') || 'newest'
        const filter = searchParams.get('filter') || 'all'

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

        // Build query
        let query = supabase
            .from('reviews')
            .select(`
                *,
                users:user_id (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .eq('subject_id', subjectId)
            .eq('subject_type', subjectType)
            .eq('status', 'published')

        // Apply filters
        if (filter === 'verified') {
            query = query.eq('is_verified', true)
        } else if (['5star', '4star', '3star', '2star', '1star'].includes(filter)) {
            const rating = parseInt(filter.charAt(0))
            query = query.eq('rating', rating)
        }

        // Apply sorting
        switch (sort) {
            case 'newest':
                query = query.order('created_at', { ascending: false })
                break
            case 'oldest':
                query = query.order('created_at', { ascending: true })
                break
            case 'highest':
                query = query.order('rating', { ascending: false }).order('created_at', { ascending: false })
                break
            case 'lowest':
                query = query.order('rating', { ascending: true }).order('created_at', { ascending: false })
                break
            case 'helpful':
                query = query.order('helpful_count', { ascending: false }).order('created_at', { ascending: false })
                break
            default:
                query = query.order('created_at', { ascending: false })
        }

        // Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) {
            console.error('[GET /api/reviews] Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch reviews', details: error.message },
                { status: 500 }
            )
        }

        // Get total count for pagination
        const { count: totalCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subjectId)
            .eq('subject_type', subjectType)
            .eq('status', 'published')

        return NextResponse.json({
            reviews: data || [],
            pagination: {
                page,
                limit,
                total: totalCount || 0,
                totalPages: Math.ceil((totalCount || 0) / limit),
                hasMore: (totalCount || 0) > to + 1
            }
        })
    } catch (error: any) {
        console.error('[GET /api/reviews] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * POST /api/reviews
 * Create a new review
 * Requires authentication
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const { subject_id, subject_type, rating, comment, images } = body

        // Validation
        if (!subject_id || !subject_type || !rating) {
            return NextResponse.json(
                { error: 'subject_id, subject_type, and rating are required' },
                { status: 400 }
            )
        }

        if (!['business', 'vendor', 'market_day'].includes(subject_type)) {
            return NextResponse.json(
                { error: 'subject_type must be business, vendor, or market_day' },
                { status: 400 }
            )
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'rating must be between 1 and 5' },
                { status: 400 }
            )
        }

        // Check if user already reviewed this subject
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', user.id)
            .eq('subject_id', subject_id)
            .eq('subject_type', subject_type)
            .maybeSingle()

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this item' },
                { status: 400 }
            )
        }

        // Check verified purchase (optional, but set if applicable)
        let isVerified = false
        try {
            const { data: verifiedData } = await (supabase as any).rpc('check_verified_purchase', {
                p_user_id: user.id,
                p_subject_id: subject_id,
                p_subject_type: subject_type
            })
            isVerified = verifiedData || false
        } catch (error) {
            // Function might not exist yet, continue without verification
            console.warn('[POST /api/reviews] Could not check verified purchase:', error)
        }

        // Create review
        const { data: review, error: insertError } = await (supabase
            .from('reviews') as any)
            .insert({
                user_id: user.id,
                subject_id,
                subject_type,
                rating,
                comment: comment || null,
                images: images && Array.isArray(images) ? images : null,
                is_verified: isVerified,
                status: 'published'
            })
            .select(`
                *,
                users:user_id (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .single()

        if (insertError) {
            console.error('[POST /api/reviews] Insert error:', insertError)
            return NextResponse.json(
                { error: 'Failed to create review', details: insertError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            review,
            message: 'Review created successfully'
        }, { status: 201 })
    } catch (error: any) {
        console.error('[POST /api/reviews] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}



