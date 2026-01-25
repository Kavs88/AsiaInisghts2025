'use client'

import { useState } from 'react'
import Image from 'next/image'
import StarRating from './StarRating'
import { cn } from '@/lib/utils'
import { CheckCircle, ThumbsUp } from 'lucide-react'

interface ReviewCardProps {
    id: string
    user: {
        id: string
        full_name: string | null
        avatar_url: string | null
    }
    rating: number
    comment: string | null
    images: string[] | null
    isVerified: boolean
    helpfulCount: number
    createdAt: string
    currentUserId?: string | null
    onHelpfulClick?: (reviewId: string, isHelpful: boolean) => void
    hasVotedHelpful?: boolean
    className?: string
}

export default function ReviewCard({
    id,
    user,
    rating,
    comment,
    images,
    isVerified,
    helpfulCount,
    createdAt,
    currentUserId,
    onHelpfulClick,
    hasVotedHelpful = false,
    className
}: ReviewCardProps) {
    const [isVoted, setIsVoted] = useState(hasVotedHelpful)
    const [helpfulCountState, setHelpfulCountState] = useState(helpfulCount)

    const handleHelpfulClick = () => {
        if (!onHelpfulClick || !currentUserId) return

        const newIsVoted = !isVoted
        setIsVoted(newIsVoted)
        setHelpfulCountState(prev => newIsVoted ? prev + 1 : prev - 1)
        onHelpfulClick(id, newIsVoted)
    }

    const date = new Date(createdAt)
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const displayName = user.full_name || 'Anonymous'

    return (
        <div className={cn('border-b border-neutral-200 py-6 last:border-b-0', className)}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                            <Image
                                src={user.avatar_url}
                                alt={displayName}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-neutral-600 font-medium text-sm">
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* User Info */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">{displayName}</span>
                            {isVerified && (
                                <span className="inline-flex items-center gap-1 text-xs text-primary-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Verified</span>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={rating} size="sm" />
                            <span className="text-xs text-neutral-500">{formattedDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comment */}
            {comment && (
                <p className="text-neutral-700 mb-4 leading-relaxed">{comment}</p>
            )}

            {/* Images */}
            {images && images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {images.slice(0, 4).map((imageUrl, index) => (
                        <div
                            key={index}
                            className="aspect-square relative rounded-lg overflow-hidden bg-neutral-100"
                        >
                            <Image
                                src={imageUrl}
                                alt={`Review image ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Helpful Button */}
            {currentUserId && currentUserId !== user.id && (
                <button
                    onClick={handleHelpfulClick}
                    className={cn(
                        'inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors',
                        isVoted && 'text-primary-600 font-medium'
                    )}
                >
                    <ThumbsUp className={cn('w-4 h-4', isVoted && 'fill-current')} />
                    <span>Helpful ({helpfulCountState})</span>
                </button>
            )}
        </div>
    )
}





