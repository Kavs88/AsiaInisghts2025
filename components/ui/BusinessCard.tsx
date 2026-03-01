import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, ArrowRight, Building2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import Badge from './Badge'
import BusinessCardSaveButton from './BusinessCardSaveButton'

interface BusinessCardProps {
    business: {
        id: string
        name: string
        slug: string
        category: string
        description?: string | null
        address?: string | null
        contact_phone?: string | null
        logo_url?: string | null
        is_verified?: boolean
    }
    className?: string
}

export default function BusinessCard({ business, className }: BusinessCardProps) {
    return (
        <article
            className={cn(
                "group bg-white rounded-2xl shadow-sm border border-neutral-200/60 overflow-hidden transition-[box-shadow,transform] duration-300 hover:shadow-xl hover:-translate-y-1 block h-full flex flex-col relative",
                className
            )}
        >
            <Link
                href={`/businesses/${business.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`View ${business.name}`}
            />

            {/* Image Stage - 4:3 Ratio Standard */}
            <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden shrink-0">
                {(business.logo_url && typeof business.logo_url === 'string') ? (
                    <Image
                        src={business.logo_url}
                        alt={business.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-300">
                        <Building2 className="w-16 h-16" />
                    </div>
                )}

                {/* Interactive Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

                {/* Category Badge - Top Left */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                    <Badge variant="glass" className="backdrop-blur-md bg-white/90 font-bold border-none shadow-md text-xs uppercase tracking-wider">
                        {business.category}
                    </Badge>
                </div>

                {/* Save Button - Top Right */}
                <div className="absolute top-4 right-4 z-20">
                    <BusinessCardSaveButton id={business.id} />
                </div>
            </div>

            {/* Content Stage - p-6 Uniform */}
            <div className="p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-1">
                            {business.name}
                        </h3>
                    </div>
                    {business.is_verified && (
                        <div className="flex-shrink-0 w-6 h-6 text-green-500" title="Verified by Asia Insights">
                            <ShieldCheck className="w-full h-full" strokeWidth={1.5} />
                        </div>
                    )}
                </div>

                {/* Description - Body text */}
                {business.description && (
                    <p className="text-base text-neutral-600 mb-4 line-clamp-2 leading-relaxed font-medium">
                        {business.description}
                    </p>
                )}

                {/* Footer - Optional meta */}
                <div className="mt-auto pt-4 border-t border-neutral-100 flex flex-col gap-3">
                    {business.address && (
                        <div className="flex items-start gap-2 text-sm font-medium text-neutral-500 line-clamp-1">
                            <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                            <span className="truncate">{business.address}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        {business.contact_phone && business.contact_phone !== 'No Phone' ? (
                            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500 group-hover:text-primary-600 transition-colors">
                                <Phone className="w-4 h-4" strokeWidth={1.5} />
                                <span>{business.contact_phone}</span>
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-neutral-400">View Details</span>
                        )}

                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                            <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform duration-300" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}
