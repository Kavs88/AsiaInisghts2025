'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Calendar } from 'lucide-react'

interface EventHeroImageProps {
    src?: string | null
    alt: string
    category?: string
    isMarketDay?: boolean
}

export default function EventHeroImage({ src, alt, category, isMarketDay }: EventHeroImageProps) {
    const [imgError, setImgError] = useState(false)

    return (
        <div className="relative h-64 sm:h-80 lg:h-96 bg-neutral-100">
            {(src && !imgError) ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    priority
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                    <Calendar className="w-20 h-20 text-primary-200" />
                </div>
            )}
            <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-primary-600 rounded-xl text-sm font-bold shadow-sm">
                    {category || (isMarketDay ? 'Market' : 'Event')}
                </span>
            </div>
        </div>
    )
}
