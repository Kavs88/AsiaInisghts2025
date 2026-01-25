'use client'

import { useState } from 'react'
import Modal from './Modal'
import StarRating from './StarRating'
import { cn } from '@/lib/utils'

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    subjectId: string
    subjectType: 'business' | 'vendor' | 'market_day'
    subjectName: string
    onSuccess?: () => void
}

export default function ReviewModal({
    isOpen,
    onClose,
    subjectId,
    subjectType,
    subjectName,
    onSuccess
}: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            setError('Please select a rating')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject_id: subjectId,
                    subject_type: subjectType,
                    rating,
                    comment: comment.trim() || null,
                    images: images.length > 0 ? images : null
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to submit review')
            }

            // Reset form
            setRating(0)
            setComment('')
            setImages([])
            setError(null)

            // Close modal and trigger success callback
            onClose()
            if (onSuccess) {
                onSuccess()
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit review')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: Implement image upload (upload to Supabase storage, get URLs)
        // For now, just a placeholder
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            // This would need actual image upload implementation
            // Image upload not yet implemented
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Write a Review for ${subjectName}`}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Rating *
                    </label>
                    <StarRating
                        rating={rating}
                        interactive={true}
                        onRatingChange={setRating}
                        size="lg"
                    />
                </div>

                {/* Comment */}
                <div>
                    <label
                        htmlFor="review-comment"
                        className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                        Your Review
                    </label>
                    <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="Share your experience..."
                    />
                </div>

                {/* Images (Placeholder - TODO: Implement upload) */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Photos (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                        Image upload coming soon
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-neutral-300 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || rating === 0}
                        className={cn(
                            'px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}



