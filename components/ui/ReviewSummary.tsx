'use client'

import StarRating from './StarRating'
import { cn } from '@/lib/utils'

interface ReviewSummaryProps {
    averageRating: number
    totalReviews: number
    size?: 'sm' | 'md' | 'lg'
    showCount?: boolean
    className?: string
}

export default function ReviewSummary({
    averageRating,
    totalReviews,
    size = 'md',
    showCount = true,
    className
}: ReviewSummaryProps) {
    const formattedRating = averageRating.toFixed(1)
    const formattedCount = totalReviews.toLocaleString()

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className="flex items-center gap-2">
                <StarRating rating={Math.round(averageRating)} size={size} />
                <span className={cn(
                    'font-bold text-neutral-900',
                    size === 'sm' && 'text-sm',
                    size === 'md' && 'text-base',
                    size === 'lg' && 'text-lg'
                )}>
                    {formattedRating}
                </span>
            </div>
            {showCount && (
                <span className={cn(
                    'text-neutral-600',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base'
                )}>
                    ({formattedCount} {totalReviews === 1 ? 'review' : 'reviews'})
                </span>
            )}
        </div>
    )
}





