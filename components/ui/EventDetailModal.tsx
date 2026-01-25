'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { X, MapPin, Calendar, Clock, Share2, Info, ArrowUpRight } from 'lucide-react'
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

export default function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted || !event) return null

    const getSafeDate = (dateStr: string | undefined | null) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const startDate = getSafeDate(event.start_at);
    const endDate = getSafeDate(event.end_at);

    if (!startDate) return null;

    const weekday = startDate.toLocaleDateString('en-US', { weekday: 'long' });
    const day = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    const timeStr = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    // Use a Portal to render the modal at the document body level
    // This prevents the specific CSS transform on the EventCard (hover scale) from
    // creating a new stacking context that traps 'fixed' position elements.
    return createPortal(
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className="max-h-[90vh] overflow-y-auto p-0"
            hideHeader={true}
            noPadding={true}
        >
            <div className="relative bg-white min-h-[600px] flex flex-col md:flex-row">
                {/* Close Button - Desktop (Top Right of Modal) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 rounded-full transition-all"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Sidebar (Left) */}
                <div className="w-full md:w-[340px] shrink-0 bg-neutral-50 border-b md:border-b-0 md:border-r border-neutral-100 p-6 md:p-8 flex flex-col gap-6">
                    {/* Event Image */}
                    <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-md bg-neutral-200 ring-1 ring-black/5">
                        {event.image_url ? (
                            <Image
                                src={event.image_url}
                                alt={event.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-300">
                                <Calendar className="w-16 h-16" />
                            </div>
                        )}
                        {/* Category Badge overlay on image */}
                        <div className="absolute top-4 left-4">
                            <Badge variant="glass" className="bg-white/90 backdrop-blur-md shadow-sm border-white/50">{event.category || 'Event'}</Badge>
                        </div>
                    </div>

                    {/* Key Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Details</h3>

                        <div className="space-y-3">
                            {/* Date */}
                            <div className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl shadow-sm">
                                <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                                <div>
                                    <div className="text-sm font-bold text-neutral-900 leading-none mb-0.5">{weekday}</div>
                                    <div className="text-xs font-medium text-neutral-500">{day}</div>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl shadow-sm">
                                <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                                <div>
                                    <div className="text-sm font-bold text-neutral-900 leading-none mb-0.5">{timeStr}</div>
                                    {endDate && (
                                        <div className="text-xs font-medium text-neutral-500">
                                            Until {endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            {event.location && (
                                <div className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl shadow-sm">
                                    <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-neutral-900 leading-none mb-0.5">{event.location}</div>
                                        {event.location_address && (
                                            <div className="text-xs font-medium text-neutral-500 line-clamp-1">{event.location_address}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions in Sidebar - Mobile Accessible */}
                    <div className="mt-auto pt-4 border-t border-neutral-200">
                        <EventIntentButtons eventId={event.id} className="w-full" />
                    </div>
                </div>

                {/* Content (Right) */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                    <div className="max-w-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-4 tracking-tight leading-[1.1]">
                                {event.title}
                            </h2>

                            {/* Host Link */}
                            {event.hosting_business && (
                                <Link
                                    href={`/businesses/${event.hosting_business.slug}`}
                                    className="inline-flex items-center gap-2 group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
                                        {event.hosting_business.logo_url ? (
                                            <img src={event.hosting_business.logo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-50 text-[10px] text-primary-600 font-bold">
                                                {event.hosting_business.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-neutral-500 group-hover:text-primary-600 transition-colors">
                                        Hosted by <span className="text-neutral-900">{event.hosting_business.name}</span>
                                    </span>
                                </Link>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">About Event</h3>
                                <div className="prose prose-neutral prose-lg text-neutral-600 leading-relaxed font-medium max-w-none">
                                    {event.description ||
                                        <span className="italic text-neutral-400">No detailed description provided.</span>
                                    }
                                </div>
                            </div>

                            {/* Share / Secondary */}
                            <div className="pt-8 border-t border-neutral-100 flex gap-4">
                                <button
                                    className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: event.title,
                                                text: event.description || '',
                                                url: window.location.href
                                            }).catch(console.error);
                                        }
                                    }}
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>,
        document.body
    )
}
