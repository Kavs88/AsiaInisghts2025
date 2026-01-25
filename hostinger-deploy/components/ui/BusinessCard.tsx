'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, ShieldCheck } from 'lucide-react'
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
    return (
        <Link
            href={`/businesses/${business.slug}`}
            className={cn(
                "group bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500",
                className
            )}
        >
            <div className="aspect-[16/9] relative bg-neutral-100 overflow-hidden">
                {(business.logo_url && typeof business.logo_url === 'string') ? (
                    <Image
                        src={business.logo_url}
                        alt={business.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-300">
                        <span className="text-5xl font-black opacity-20">{business.name.charAt(0)}</span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <Badge variant="glass">{business.category}</Badge>
                </div>

                {/* Verified Badge */}
                {business.is_verified && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-primary-600 text-white p-1.5 rounded-full shadow-lg" title="Verified Business">
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {business.name}
                </h3>

                {business.description && (
                    <p className="text-neutral-600 text-sm mb-5 line-clamp-2 leading-relaxed min-h-[40px]">
                        {business.description}
                    </p>
                )}

                <div className="flex flex-col gap-2.5 text-xs font-medium text-neutral-500 border-t border-neutral-100 pt-5">
                    {business.address && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                            <span className="truncate">{business.address}</span>
                        </div>
                    )}
                    {business.contact_phone && business.contact_phone !== 'No Phone' && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                            <span>{business.contact_phone}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
