'use client'

import { useState, useEffect } from 'react'
import ReviewTab from '@/components/ui/ReviewTab'
import ReviewModal from '@/components/ui/ReviewModal'
import { createClient } from '@/lib/supabase/client'

interface ReviewsSectionProps {
    businessId: string
    businessName: string
}

export default function ReviewsSection({ businessId, businessName }: ReviewsSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    // Get current user
    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || null)
        }
        checkUser()
    }, [])

    const handleReviewSuccess = () => {
        setRefreshKey(prev => prev + 1)
        setIsModalOpen(false)
    }

    return (
        <>
            <section className="border-b border-neutral-100 sm:border-none">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Reviews</h2>
                    {currentUserId && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
                        >
                            Write a Review
                        </button>
                    )}
                </div>
                <ReviewTab
                    key={refreshKey}
                    subjectId={businessId}
                    subjectType="business"
                    currentUserId={currentUserId}
                    onReviewCreate={handleReviewSuccess}
                />
            </section>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                subjectId={businessId}
                subjectType="business"
                subjectName={businessName}
                onSuccess={handleReviewSuccess}
            />
        </>
    )
}

