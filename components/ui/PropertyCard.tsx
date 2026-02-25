'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bed, Bath, Users, ArrowRight, Building2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import Badge from './Badge'

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
    className?: string
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
    isFeatured = false,
    className
}: PropertyCardProps) {
    const mainImage = images && images.length > 0 ? images[0] : null
    const displayPrice = price ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(price) : null

    const hasSpecs = !!(bedrooms || bathrooms || capacity)
    const typeLabel = property_type === 'event_space'
        ? 'Event Space'
        : type.charAt(0).toUpperCase() + type.slice(1)

    return (
        <article
            className={cn(
                "group relative bg-white rounded-2xl shadow-sm border border-neutral-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block h-full flex flex-col",
                className
            )}
        >
            <Link href={`/properties/${id}`} className="absolute inset-0 z-10" aria-label={`View ${address}`} />

            {/* Image Section - 4:3 Ratio Standard */}
            <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden shrink-0">
                {(mainImage && typeof mainImage === 'string') ? (
                    <Image
                        src={mainImage}
                        alt={address}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-primary-300" strokeWidth={1} />
                    </div>
                )}

                {/* Interactive Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

                {/* Type Badge — Top Left */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                    <Badge variant="glass" className="backdrop-blur-md bg-white/90 text-neutral-900 font-bold border-none shadow-md text-xs uppercase tracking-wider">
                        {type}
                    </Badge>
                </div>

                {/* Status Badges — Top Right */}
                {(isNew || isFeatured) && (
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
                        {isFeatured && (
                            <Badge variant="glass" className="backdrop-blur-md bg-white/90 text-neutral-600 font-bold border-none shadow-sm text-xs uppercase tracking-wider">
                                Featured
                            </Badge>
                        )}
                        {isNew && (
                            <Badge variant="glass" className="backdrop-blur-md bg-white/90 text-neutral-600 font-bold border-none shadow-sm text-xs uppercase tracking-wider">
                                New
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            {/* Content Stage - p-6 Uniform */}
            <div className="p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
                {/* Title block */}
                <div className="min-w-0 flex-1 mb-4">
                    {businesses && (
                        <p className="text-xs font-medium text-neutral-500 mb-2 truncate pointer-events-auto relative z-20">
                            Listed by <Link
                                href={`/businesses/${businesses.slug}`}
                                className="hover:text-primary-600 transition-colors"
                            >
                                {businesses.name}
                            </Link>
                        </p>
                    )}
                    <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                        {address}
                    </h3>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-2">
                        {typeLabel}
                    </p>
                </div>

                {/* Footer / Meta */}
                <div className="mt-auto pt-4 border-t border-neutral-100/50 flex flex-col gap-4">

                    {/* Price - Prominent */}
                    {displayPrice && (
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-neutral-900 tracking-tight leading-none">
                                {displayPrice}
                            </span>
                            {property_type === 'rental' && (
                                <span className="text-sm font-bold text-neutral-500">/mo</span>
                            )}
                        </div>
                    )}

                    {/* Specs — only when data exists */}
                    {hasSpecs ? (
                        <div className="flex items-center gap-4 text-neutral-600 flex-wrap pointer-events-auto">
                            {property_type === 'rental' ? (
                                <>
                                    {bedrooms && (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Bed className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                                            <span className="text-sm font-bold">
                                                {bedrooms} <span className="text-neutral-400 font-medium text-xs uppercase ml-0.5">Beds</span>
                                            </span>
                                        </div>
                                    )}
                                    {bathrooms && (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Bath className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                                            <span className="text-sm font-bold">
                                                {bathrooms} <span className="text-neutral-400 font-medium text-xs uppercase ml-0.5">Baths</span>
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                capacity && (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Users className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                                        <span className="text-sm font-bold">
                                            Up to {capacity} <span className="text-neutral-400 font-medium text-xs uppercase ml-0.5">Guests</span>
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    ) : null}

                    {/* CTA row like BusinessCard and ProductCard standard */}
                    <div className="flex items-center justify-between pt-2 mt-auto">
                        <span className="text-sm font-bold text-neutral-500 group-hover:text-primary-600 transition-colors pointer-events-none uppercase tracking-wide">
                            View Property
                        </span>
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 pointer-events-none">
                            <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform duration-300" strokeWidth={1.5} />
                        </div>
                    </div>

                </div>
            </div>
        </article>
    )
}
