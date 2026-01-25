'use client'

import { useState, useEffect } from 'react'
import ReviewCard from './ReviewCard'
import { cn } from '@/lib/utils'
import { Database } from '@/types/database'

type Review = Database['public']['Tables']['reviews']['Row'] & {
    users: {
        id: string
        full_name: string | null
        avatar_url: string | null
    }
}

interface ReviewTabProps {
    subjectId: string
    subjectType: 'business' | 'vendor' | 'market_day'
    currentUserId?: string | null
    onReviewCreate?: () => void
    className?: string
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
type FilterOption = 'all' | 'verified' | '5star' | '4star' | '3star' | '2star' | '1star'

export default function ReviewTab({
    subjectId,
    subjectType,
    currentUserId,
    onReviewCreate,
    className
}: ReviewTabProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sort, setSort] = useState<SortOption>('newest')
    const [filter, setFilter] = useState<FilterOption>('all')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({})

    const fetchReviews = async (reset = false) => {
        try {
            setLoading(true)
            setError(null)

            const currentPage = reset ? 1 : page
            const params = new URLSearchParams({
                subject_id: subjectId,
                subject_type: subjectType,
                page: currentPage.toString(),
                limit: '20',
                sort,
                filter
            })

            const response = await fetch(`/api/reviews?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch reviews')
            }

            const data = await response.json()
            setReviews(reset ? data.reviews : (prev => [...prev, ...data.reviews]))
            setHasMore(data.pagination.hasMore)
            if (reset) {
                setPage(1)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load reviews')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort, filter, subjectId, subjectType])

    const handleHelpfulClick = async (reviewId: string, isHelpful: boolean) => {
        try {
            const endpoint = `/api/reviews/${reviewId}/helpful`
            const method = isHelpful ? 'POST' : 'DELETE'

            const response = await fetch(endpoint, { method })
            if (!response.ok) {
                throw new Error('Failed to update helpful vote')
            }

            setHelpfulVotes(prev => ({
                ...prev,
                [reviewId]: isHelpful
            }))
        } catch (err) {
            console.error('Failed to vote helpful:', err)
            // Revert optimistic update
            setHelpfulVotes(prev => {
                const updated = { ...prev }
                delete updated[reviewId]
                return updated
            })
        }
    }

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1)
            fetchReviews(false)
        }
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    {(['all', 'verified', '5star', '4star'] as FilterOption[]).map((option) => (
                        <button
                            key={option}
                            onClick={() => setFilter(option)}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                                filter === option
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            )}
                        >
                            {option === 'all' && 'All'}
                            {option === 'verified' && 'Verified'}
                            {option === '5star' && '5 Stars'}
                            {option === '4star' && '4 Stars'}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                </select>
            </div>

            {/* Reviews List */}
            {loading && reviews.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">Loading reviews...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-600">{error}</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                    No reviews yet. Be the first to review!
                </div>
            ) : (
                <>
                    <div className="space-y-0">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                id={review.id}
                                user={review.users}
                                rating={review.rating}
                                comment={review.comment}
                                images={review.images}
                                isVerified={review.is_verified}
                                helpfulCount={review.helpful_count}
                                createdAt={review.created_at}
                                currentUserId={currentUserId}
                                onHelpfulClick={handleHelpfulClick}
                                hasVotedHelpful={helpfulVotes[review.id] || false}
                            />
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="text-center">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Load More Reviews'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

