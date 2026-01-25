'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, MapPin, Calendar, Clock, Building2, Share2, Info, ChevronRight } from 'lucide-react'
import EventIntentButtons from './EventIntentButtons'

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
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setMounted(true)
            document.body.style.overflow = 'hidden'
            // Small delay to trigger animation
            const timer = setTimeout(() => setAnimate(true), 10)
            return () => {
                clearTimeout(timer)
                document.body.style.overflow = 'unset'
            }
        } else {
            setAnimate(false)
            const timer = setTimeout(() => setMounted(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!mounted) return null

    const startDate = new Date(event.start_at)
    const endDate = event.end_at ? new Date(event.end_at) : null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
            role="dialog"
            aria-modal="true"
        >
            {/* Glassmorphism Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Card - Scale + Fade Animation */}
            <div
                className={`relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 transform ${animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md hover:bg-white text-neutral-900 rounded-full shadow-lg transition-all hover:scale-110"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {/* Hero Image Section */}
                    <div className="relative h-64 sm:h-80 w-full bg-neutral-100">
                        {event.image_url ? (
                            <Image
                                src={event.image_url}
                                alt={event.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                                <Calendar className="w-20 h-20 text-primary-200" />
                            </div>
                        )}

                        {/* Category Badge Overlay */}
                        <div className="absolute top-6 left-6">
                            <span className="px-4 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-full shadow-lg tracking-wider uppercase">
                                {event.category || 'Event'}
                            </span>
                        </div>

                        {/* Bottom Fade Gradient */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    <div className="p-8 sm:p-10">
                        {/* Header Content */}
                        <div className="mb-8">
                            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 mb-3 leading-tight tracking-tight">
                                {event.title}
                            </h2>
                            {event.hosting_business && (
                                <div className="flex items-center gap-2">
                                    <span className="text-neutral-400 font-medium">Hosted by</span>
                                    <Link
                                        href={`/businesses/${event.hosting_business.slug}`}
                                        className="text-primary-600 font-bold hover:underline"
                                    >
                                        {event.hosting_business.name}
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Stats Ribbon */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Date</p>
                                    <p className="text-sm font-bold text-neutral-900">
                                        {startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Time</p>
                                    <p className="text-sm font-bold text-neutral-900">
                                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {endDate && ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    </p>
                                </div>
                            </div>

                            {event.location && (
                                <div className="col-span-1 sm:col-span-2 flex items-center gap-4 p-4 bg-primary-50/30 rounded-2xl border border-primary-100/50">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Location</p>
                                        <p className="text-sm font-bold text-neutral-900">{event.location}</p>
                                        {event.location_address && (
                                            <p className="text-xs text-neutral-500 mt-0.5">{event.location_address}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* About Section */}
                        <div className="mb-10">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 mb-4">
                                <Info className="w-5 h-5 text-primary-500" />
                                About this event
                            </h3>
                            <div className="text-neutral-600 leading-relaxed whitespace-pre-line text-lg">
                                {event.description || "No description provided for this event. Reach out to the host for more details."}
                            </div>
                        </div>

                        {/* Host Snippet */}
                        {event.hosting_business && (
                            <div className="mb-10 p-6 bg-gradient-to-br from-neutral-50 to-white rounded-3xl border border-neutral-100 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white">
                                            {event.hosting_business.logo_url ? (
                                                <Image src={event.hosting_business.logo_url} alt="" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Presented By</p>
                                            <h4 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                                {event.hosting_business.name}
                                            </h4>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/businesses/${event.hosting_business.slug}`}
                                        className="p-3 bg-white hover:bg-primary-50 text-neutral-600 hover:text-primary-600 rounded-2xl border border-neutral-200 hover:border-primary-200 transition-all shadow-sm hover:shadow-md active:scale-95"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Actions Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-neutral-100">
                            <div className="flex items-center gap-3">
                                <EventIntentButtons eventId={event.id} />
                            </div>
                            <button
                                className="flex items-center gap-2 px-6 py-3 text-neutral-600 hover:text-neutral-900 font-bold transition-colors"
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
                                <Share2 className="w-5 h-5" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
