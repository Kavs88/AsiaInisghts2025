'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Bath, Users, ArrowRight, Building2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface PropertyCardProps {
    id: string
    address: string
    type: 'apartment' | 'house' | 'condo' | 'villa' | 'commercial' | 'land' | 'other'
    property_type: 'rental' | 'event_space'
    price?: number
    bedrooms?: number | null
    bathrooms?: number | null
    capacity?: number | null
    images?: string[] | null
    businesses?: {
        name: string
        slug: string
        logo_url?: string | null
    } | null
    isNew?: boolean
    isFeatured?: boolean
}

export default function PropertyCard({
    id,
    address,
    type,
    property_type,
    price,
    bedrooms,
    bathrooms,
    capacity,
    images,
    businesses,
    isNew = false,
    isFeatured = false
}: PropertyCardProps) {
    const mainImage = images && images.length > 0 ? images[0] : null
    const displayPrice = price ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(price) : null

    return (
        <article className="group bg-white rounded-3xl shadow-sm border border-neutral-100/50 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative flex flex-col h-full">
            {/* Full Card Link Overlay - Fixes 'not opening' issue */}
            <Link
                href={`/properties/${id}`}
                className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label={`View property at ${address}`}
            />

            {/* Image Section */}
            <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden">
                {(mainImage && typeof mainImage === 'string') ? (
                    <Image
                        src={mainImage}
                        alt={address}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-slate-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                    </div>
                )}

                {/* Interactive Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                {/* Badges - Glassmorphism Style */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    <div className="px-3 py-1.5 backdrop-blur-md bg-white/90 text-neutral-900 text-xs font-bold border border-white/50 shadow-sm rounded-xl uppercase tracking-wider">
                        {type}
                    </div>
                </div>

                {/* Status Badges */}
                {(isNew || isFeatured) && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                        {isFeatured && (
                            <div className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg">
                                ⭐ Featured
                            </div>
                        )}
                        {isNew && (
                            <div className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg">
                                New
                            </div>
                        )}
                    </div>
                )}

                {/* Price Tag - Premium Floating */}
                {displayPrice && (
                    <div className="absolute bottom-4 left-4 z-20">
                        <div className="bg-white/95 backdrop-blur-md text-neutral-900 px-4 py-2 rounded-xl font-black text-lg shadow-lg border border-white/50">
                            {displayPrice}
                            {property_type === 'rental' && <span className="text-[10px] font-bold text-neutral-400 ml-1">/mo</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 relative z-20 pointer-events-none">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                        {/* Stewardship Voice: Hosted/Curated by */}
                        {businesses && (
                            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 pointer-events-auto">
                                Curated by {businesses.name}
                            </div>
                        )}
                        <h3 className="text-xl font-black text-neutral-900 truncate group-hover:text-primary-600 transition-colors leading-tight">
                            {address}
                        </h3>
                        <div className="flex items-center gap-1.5 text-neutral-500 mt-2">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold truncate">Premium Location</span>
                        </div>
                    </div>

                    {/* Host Avatar - Link clickable separately due to pointer-events-auto */}
                    {businesses && (
                        <Link href={`/businesses/${businesses.slug}`} className="shrink-0 pointer-events-auto relative z-30">
                            {businesses.logo_url ? (
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-neutral-100 shadow-sm hover:scale-105 transition-transform group/avatar">
                                    <Image src={businesses.logo_url} alt={businesses.name} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100">
                                    <Building2 className="w-5 h-5 text-neutral-400" />
                                </div>
                            )}
                        </Link>
                    )}
                </div>

                {/* Specs - Clean layout */}
                <div className="flex items-center gap-5 pt-4 mt-auto border-t border-neutral-50/80">
                    {property_type === 'rental' ? (
                        <>
                            {bedrooms && (
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <Bed className="w-4 h-4 text-neutral-400" />
                                    <span className="text-sm font-bold">{bedrooms} <span className="text-neutral-400 font-medium text-xs uppercase">Beds</span></span>
                                </div>
                            )}
                            {bathrooms && (
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <Bath className="w-4 h-4 text-neutral-400" />
                                    <span className="text-sm font-bold">{bathrooms} <span className="text-neutral-400 font-medium text-xs uppercase">Baths</span></span>
                                </div>
                            )}
                        </>
                    ) : (
                        capacity && (
                            <div className="flex items-center gap-2 text-neutral-600">
                                <Users className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm font-bold">Up to {capacity} <span className="text-neutral-400 font-medium text-xs uppercase">Guests</span></span>
                            </div>
                        )
                    )}
                </div>

                {/* Hover Reveal Action - Visual cue only */}
                <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden mt-4">
                    <div className="w-full py-2.5 bg-neutral-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg">
                        View Property <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </article>
    )
}
