'use client'

import { useState, useEffect } from 'react'
import ReviewTab from './ReviewTab'
import ReviewModal from './ReviewModal'
import { createClient } from '@/lib/supabase/client'

interface ReviewsSectionProps {
    subjectId: string
    subjectType: 'business' | 'vendor' | 'market_day'
    subjectName: string
}

export default function ReviewsSection({ subjectId, subjectType, subjectName }: ReviewsSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [authChecked, setAuthChecked] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Get current user
    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || null)
            setAuthChecked(true)
        }
        checkUser()
    }, [])

    const handleReviewSuccess = () => {
        setRefreshKey(prev => prev + 1)
        setIsModalOpen(false)
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Reviews</h2>
                {/* Show button area only after auth check resolves — prevents pop-in for logged-in users */}
                {authChecked && currentUserId && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md"
                    >
                        Write a Review
                    </button>
                )}
                {!authChecked && (
                    <div className="h-10 w-36 bg-neutral-100 rounded-xl" aria-hidden="true" />
                )}
            </div>

            <ReviewTab
                key={refreshKey}
                subjectId={subjectId}
                subjectType={subjectType}
                currentUserId={currentUserId}
                onReviewCreate={handleReviewSuccess}
            />

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                subjectId={subjectId}
                subjectType={subjectType}
                subjectName={subjectName}
                onSuccess={handleReviewSuccess}
            />
        </div>
    )
}
