'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { X, MapPin, Calendar, Clock, Share2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import EventIntentButtons from './EventIntentButtons'
import Badge from './Badge'

interface EventDetailModalProps {
    isOpen: boolean
    onClose: () => void
    event: {
        id: string
        title: string
        description?: string | null
        start_at: string
        end_at?: string
        location?: string | null
        location_address?: string | null
        category?: string
        image_url?: string | null
        hosting_business?: {
            id: string
            name: string
            slug: string
            logo_url?: string | null
        } | null
        offers?: Array<{
            id: string
            title: string
            description?: string | null
        }>
    }
}

const DESCRIPTION_THRESHOLD = 280

export default function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
    const [mounted, setMounted] = useState(false)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // Reset expand state when modal closes
    useEffect(() => {
        if (!isOpen) setExpanded(false)
    }, [isOpen])

    if (!mounted || !event) return null

    const getSafeDate = (dateStr: string | undefined | null) => {
        if (!dateStr) return null
        const d = new Date(dateStr)
        return isNaN(d.getTime()) ? null : d
    }

    const startDate = getSafeDate(event.start_at)
    const endDate = getSafeDate(event.end_at)

    if (!startDate) return null

    const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const day = startDate.toLocaleDateString('en-US', { day: 'numeric' })
    const weekday = startDate.toLocaleDateString('en-US', { weekday: 'long' })
    const longDay = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
    const timeStr = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const endTimeStr = endDate
        ? endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : null

    const isLongDescription = !!(event.description && event.description.length > DESCRIPTION_THRESHOLD)

    return createPortal(
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className="max-h-[90vh] overflow-y-auto p-0"
            hideHeader={true}
            noPadding={true}
        >
            <div className="relative bg-white flex flex-col">

                {/* Hero Image */}
                <div className="relative aspect-video bg-neutral-100 overflow-hidden shrink-0">
                    {event.image_url ? (
                        <Image
                            src={event.image_url}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 896px"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                            <Calendar className="w-20 h-20 text-primary-300" strokeWidth={1} />
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Category Badge — Top Left */}
                    {event.category && (
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <Badge variant="glass" className="backdrop-blur-md bg-white/90 font-bold border-none shadow-md text-xs uppercase tracking-wider">
                                {event.category}
                            </Badge>
                        </div>
                    )}

                    {/* Close Button — Top Right */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-white/30 hover:bg-white text-neutral-700 hover:text-neutral-900 transition-all"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Date Pill — Bottom Left */}
                    <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-white/50">
                        <div className="text-xs font-black text-primary-600 uppercase tracking-widest leading-none mb-0.5">{month}</div>
                        <div className="text-2xl font-black text-neutral-900 leading-none">{day}</div>
                    </div>
                </div>

                {/* Content Body — pb-24 leaves room for sticky footer */}
                <div className="p-6 md:p-8 flex flex-col gap-5 pb-24">

                    {/* Title + Host */}
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
                            {event.title}
                        </h2>
                        {event.hosting_business && (
                            <Link
                                href={`/businesses/${event.hosting_business.slug}`}
                                className="mt-3 flex items-center gap-2.5 group w-fit"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-100 overflow-hidden flex-shrink-0">
                                    {event.hosting_business.logo_url ? (
                                        <img src={event.hosting_business.logo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-xs font-bold text-primary-600">
                                            {event.hosting_business.name[0]}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-neutral-500 group-hover:text-primary-600 transition-colors">
                                    Hosted by <span className="text-neutral-800">{event.hosting_business.name}</span>
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Meta Strip */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 py-4 border-y border-neutral-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                            <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
                            <span>{weekday}, {longDay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                            <Clock className="w-4 h-4 text-primary-500 shrink-0" />
                            <span>{timeStr}{endTimeStr ? ` – ${endTimeStr}` : ''}</span>
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                                <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                                <span className="line-clamp-1">{event.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        {event.description ? (
                            <>
                                <p className={`text-[15px] text-neutral-600 leading-relaxed font-medium${!expanded && isLongDescription ? ' line-clamp-4' : ''}`}>
                                    {event.description}
                                </p>
                                {isLongDescription && (
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="mt-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        {expanded ? 'Show less' : 'Read more'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <span className="italic text-neutral-400 text-sm">No description provided.</span>
                        )}
                    </div>

                    {/* Offers Strip */}
                    {event.offers && event.offers.length > 0 && (
                        <div className="py-3 px-4 bg-amber-50/60 border border-amber-100/60 rounded-xl">
                            <div className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1.5">
                                Offers at this event
                            </div>
                            <div className="flex flex-col gap-1">
                                {event.offers.map((offer) => (
                                    <div key={offer.id} className="text-sm font-medium text-amber-900/80">
                                        {offer.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share */}
                    <div className="pt-1 flex">
                        <button
                            className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-neutral-700 transition-colors"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: event.title,
                                        text: event.description || '',
                                        url: window.location.href
                                    }).catch(console.error)
                                }
                            }}
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Sticky CTA Footer */}
                <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-100 px-6 py-4 z-10">
                    <EventIntentButtons eventId={event.id} className="w-full" />
                </div>
            </div>
        </Modal>,
        document.body
    )
}
