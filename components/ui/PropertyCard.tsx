'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Bath, Users, ArrowRight, Building2 } from 'lucide-react'

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
        is_verified?: boolean
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
        <article className="group bg-white rounded-3xl shadow-sm border border-neutral-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative flex flex-col h-full">
            {/* Full Card Link Overlay - Fixes 'not opening' issue */}
            <Link
                href={`/properties/${id}`}
                className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label={`View property at ${address}`}
            />

            {/* Image Section - 4:3 Ratio Standard */}
            <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden shrink-0">
                {(mainImage && typeof mainImage === 'string') ? (
                    <Image
                        src={mainImage}
                        alt={address}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-neutral-300" strokeWidth={1.5} />
                    </div>
                )}

                {/* Interactive Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                {/* Badges - Top Left */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
                    <div className="px-2.5 py-1 backdrop-blur-md bg-white/90 text-neutral-900 text-xs font-bold border border-white/50 shadow-sm rounded-lg uppercase tracking-wider">
                        {type}
                    </div>
                </div>

                {/* Status Badges - Top Right (subtle, subordinate to content) */}
                {(isNew || isFeatured) && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 pointer-events-none">
                        {isFeatured && (
                            <div className="px-2.5 py-1 backdrop-blur-md bg-white/90 text-neutral-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/50 shadow-sm">
                                Featured
                            </div>
                        )}
                        {isNew && (
                            <div className="px-2.5 py-1 backdrop-blur-md bg-white/90 text-neutral-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/50 shadow-sm">
                                New
                            </div>
                        )}
                    </div>
                )}

                {/* Price Tag - Premium Floating Bottom Left */}
                {displayPrice && (
                    <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-md text-neutral-900 px-4 py-2 rounded-xl font-black text-lg shadow-lg border border-white/50">
                            {displayPrice}
                            {property_type === 'rental' && <span className="text-xs font-bold text-neutral-400 ml-1">/mo</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section - p-6 Uniform */}
            <div className="p-6 flex flex-col flex-1 relative z-20 pointer-events-none">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0 w-full">
                        {businesses ? (
                            <p className="text-xs font-medium text-neutral-500 mb-1.5 truncate">
                                <Link href={`/businesses/${businesses.slug}`} className="pointer-events-auto hover:text-primary-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                                    Listed by {businesses.name}
                                </Link>
                            </p>
                        ) : null}
                        <h3 className="text-lg font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors leading-snug">
                            {address}
                        </h3>
                        <div className="flex items-center gap-1.5 text-neutral-500 mt-1">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-sm font-medium truncate">Premium Location</span>
                        </div>
                    </div>
                </div>

                {/* Specs - Clean layout */}
                <div className="flex items-center gap-5 pt-4 mt-auto border-t border-neutral-100">
                    {property_type === 'rental' ? (
                        <>
                            {bedrooms && (
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <Bed className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                                    <span className="text-sm font-bold">{bedrooms} <span className="text-neutral-500 font-medium text-xs uppercase ml-1">Beds</span></span>
                                </div>
                            )}
                            {bathrooms && (
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <Bath className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                                    <span className="text-sm font-bold">{bathrooms} <span className="text-neutral-500 font-medium text-xs uppercase ml-1">Baths</span></span>
                                </div>
                            )}
                        </>
                    ) : (
                        capacity && (
                            <div className="flex items-center gap-2 text-neutral-600">
                                <Users className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                                <span className="text-sm font-bold">Up to {capacity} <span className="text-neutral-500 font-medium text-xs uppercase ml-1">Guests</span></span>
                            </div>
                        )
                    )}
                </div>

                {/* View Action - Fixed height footprint to prevent shift */}
                <div className="relative h-11 mt-4 pointer-events-auto">
                    {/* Default View */}
                    <div className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-300">
                        <div className="w-full h-full bg-neutral-50 text-neutral-500 font-bold rounded-xl border border-neutral-100 flex items-center justify-center gap-2 text-xs uppercase tracking-wide">
                            View Details <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </div>
                    </div>
                    {/* Hover Reveal Action */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-full h-full bg-neutral-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg pointer-events-auto">
                            View Property <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}
