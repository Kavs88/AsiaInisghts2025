'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import EnquiryModal from './EnquiryModal'
import { cn } from '@/lib/utils'

interface PropertyEnquiryButtonProps {
    propertyId: string
    propertyAddress: string
    propertyType: 'rental' | 'event_space'
    currentUser?: {
        id: string
        email?: string
        user_metadata?: { full_name?: string }
    } | null
    className?: string
}

export default function PropertyEnquiryButton({
    propertyId,
    propertyAddress,
    propertyType,
    currentUser,
    className
}: PropertyEnquiryButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={cn("w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-black rounded-2xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5", className || "py-4")}
            >
                <MessageSquare className="w-5 h-5" strokeWidth={2} />
                Enquire About This {propertyType === 'event_space' ? 'Venue' : 'Property'}
            </button>

            <EnquiryModal
                propertyId={propertyId}
                propertyAddress={propertyAddress}
                propertyType={propertyType}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                currentUser={currentUser}
            />
        </>
    )
}
