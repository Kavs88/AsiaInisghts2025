'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntitySignatureProps {
    entity: {
        name: string
        slug: string
        image_url?: string | null
        type: 'vendor' | 'business' | 'admin' | 'other'
        is_verified?: boolean
        confidence_score?: number
        vouch_count?: number
        is_regular?: boolean
    }
    className?: string
    size?: 'sm' | 'md'
    showLabel?: boolean
    trustLevel?: 'member' | 'verified' | 'vetted'
}

export default function EntitySignature({
    entity,
    className,
    size = 'sm',
    showLabel = true,
    trustLevel: propTrustLevel
}: EntitySignatureProps) {
    // 1. Enforce Trust: If no entity name/slug, do not render
    if (!entity?.name || !entity?.slug) return null

    // Determine structural trust level
    const trustLevel = propTrustLevel || (
        (entity.confidence_score && entity.confidence_score > 90) ? 'vetted' :
            (entity.is_verified || (entity.confidence_score && entity.confidence_score > 75)) ? 'verified' :
                'member'
    )

    return (
        <Link
            href={`/makers/${entity.slug}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
                "group/signature flex items-center gap-2 relative z-30 transition-all rounded-full pr-3 py-0.5",
                trustLevel === 'vetted' && "bg-amber-50/80 border border-amber-200/50 pr-4 shadow-sm",
                trustLevel === 'verified' && "bg-emerald-50/50 border border-emerald-100/50 pr-3",
                trustLevel === 'member' && "hover:bg-neutral-50 pr-2",
                className
            )}
        >
            {/* Avatar */}
            <div className={cn(
                "relative rounded-full overflow-hidden border bg-white shrink-0",
                trustLevel === 'vetted' ? "border-amber-300" : "border-neutral-200",
                size === 'sm' ? "w-6 h-6" : "w-8 h-8"
            )}>
                {entity.image_url ? (
                    <Image
                        src={entity.image_url}
                        alt={entity.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className={cn(
                        "w-full h-full flex items-center justify-center font-bold text-[10px]",
                        trustLevel === 'vetted' ? "bg-amber-100 text-amber-700" : "bg-primary-50 text-primary-600"
                    )}>
                        {entity.name.substring(0, 1)}
                    </div>
                )}
            </div>

            {/* Name & Badge */}
            <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                    {showLabel && (
                        <span className={cn(
                            "font-black tracking-tight transition-colors truncate max-w-[120px]",
                            trustLevel === 'vetted' ? "text-amber-900" : "text-neutral-900",
                            size === 'sm' ? "text-[10px]" : "text-xs"
                        )}>
                            {entity.name}
                        </span>
                    )}

                    {trustLevel === 'vetted' && (
                        <div className="flex items-center gap-1" title="Vetted by Asia Insights">
                            <ShieldCheck className="w-3 h-3 text-amber-600" strokeWidth={2} />
                            <span className="text-[8px] font-black uppercase tracking-wider text-amber-700">Vetted</span>
                        </div>
                    )}

                    {trustLevel === 'verified' && (
                        <div className="flex items-center gap-1" title="Verified Identity">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" strokeWidth={2} />
                        </div>
                    )}

                    {entity.vouch_count && entity.vouch_count > 5 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100/50" title="Community Vouched">
                            <span className="text-[8px] font-black uppercase tracking-wider">Vouched</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
