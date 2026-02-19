
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, ShieldCheck, ArrowRight, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Badge from './Badge'

interface BusinessCardProps {
    business: {
        id: string
        name: string
        slug: string
        category: string
        description?: string
        address?: string
        contact_phone?: string
        logo_url?: string
        is_verified?: boolean
    }
    className?: string
}

export default function BusinessCard({ business, className }: BusinessCardProps) {
    // Normalise sentinel values that leak from the database
    const phone = business.contact_phone && business.contact_phone !== 'No Phone'
        ? business.contact_phone
        : null

    return (
        <Link
            href={`/businesses/${business.slug}`}
            className={cn(
                "group bg-white rounded-3xl shadow-sm border border-neutral-100/50 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 block h-full flex flex-col",
                className
            )}
        >
            <div className="aspect-[16/9] relative bg-neutral-100 overflow-hidden shrink-0">
                {(business.logo_url && typeof business.logo_url === 'string') ? (
                    <Image
                        src={business.logo_url}
                        alt={business.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-300">
                        <Building2 className="w-16 h-16" />
                    </div>
                )}

                {/* Interactive Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <Badge variant="glass" className="backdrop-blur-md bg-white/90 font-bold border-none shadow-md">
                        {business.category}
                    </Badge>
                </div>

                {/* Verified Badge */}
                {business.is_verified && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-primary-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white/20" title="Verified Business">
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-black text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1 leading-tight">
                    {business.name}
                </h3>

                {business.description && (
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2 leading-relaxed font-medium">
                        {business.description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-neutral-50 flex flex-col gap-2">
                    {business.address && (
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                            <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                            <span className="truncate">{business.address}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        {phone ? (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span>{phone}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">View Details</span>
                        )}

                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 border border-neutral-100 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-all">
                            <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform duration-300" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
