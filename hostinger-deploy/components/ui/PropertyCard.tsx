'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Bath, Users, Home, ArrowRight, Building2 } from 'lucide-react'

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
    businesses
}: PropertyCardProps) {
    const mainImage = images && images.length > 0 ? images[0] : null
    const displayPrice = price ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(price) : null

    return (
        <div className="group bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            {/* Image Section */}
            <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden">
                {(mainImage && typeof mainImage === 'string') ? (
                    <Image
                        src={mainImage}
                        alt={address}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                        <Home className="w-12 h-12 text-neutral-300" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge variant="glass">
                        {type}
                    </Badge>
                    <Badge variant={property_type === 'rental' ? 'primary' : 'success'}>
                        {property_type === 'rental' ? 'For Rent' : 'Event Space'}
                    </Badge>
                </div>

                {/* Price Tag */}
                {displayPrice && (
                    <div className="absolute bottom-4 left-4">
                        <div className="bg-neutral-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl font-black text-lg">
                            {displayPrice}
                            {property_type === 'rental' && <span className="text-xs font-medium text-neutral-300">/mo</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                            {address}
                        </h3>
                        <div className="flex items-center gap-1.5 text-neutral-500 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-sm truncate">Nearby Discovery</span>
                        </div>
                    </div>

                    {/* Host Business Info */}
                    {businesses && (
                        <Link href={`/businesses/${businesses.slug}`} className="shrink-0">
                            {businesses.logo_url ? (
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-100 shadow-sm">
                                    <Image src={businesses.logo_url} alt={businesses.name} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-100">
                                    <Building2 className="w-5 h-5 text-neutral-400" />
                                </div>
                            )}
                        </Link>
                    )}
                </div>

                {/* Specs */}
                <div className="flex items-center gap-5 pt-4 border-t border-neutral-100">
                    {property_type === 'rental' ? (
                        <>
                            {bedrooms && (
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <Bed className="w-4 h-4 text-neutral-400" />
                                    <span className="text-sm font-semibold">{bedrooms} Bed</span>
                                </div>
                            )}
                            {bathrooms && (
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <Bath className="w-4 h-4 text-neutral-400" />
                                    <span className="text-sm font-semibold">{bathrooms} Bath</span>
                                </div>
                            )}
                        </>
                    ) : (
                        capacity && (
                            <div className="flex items-center gap-2 text-neutral-600">
                                <Users className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm font-semibold">Up to {capacity} ppl</span>
                            </div>
                        )
                    )}
                </div>

                {/* Action */}
                <Link
                    href={`/properties/${id}`}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-neutral-50 hover:bg-primary-50 text-neutral-600 hover:text-primary-700 font-bold rounded-2xl transition-all border border-neutral-100 hover:border-primary-100 group/btn"
                >
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
