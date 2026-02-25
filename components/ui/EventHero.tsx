'use client'

import Image from 'next/image'

interface EventHeroProps {
  imageUrl?: string | null
  category?: string
  title?: string
  className?: string
}

export default function EventHero({ 
  imageUrl, 
  category, 
  title,
  className = '' 
}: EventHeroProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Hero Image Container - Aspect 21:9 */}
      <div className="relative w-full aspect-[21/9] bg-neutral-200 overflow-hidden rounded-2xl">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={title || 'Event image'}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
            <svg className="w-24 h-24 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Category Badge - Top Right */}
        {category && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-4 py-2 bg-white/95 backdrop-blur-sm text-neutral-900 font-semibold text-sm rounded-lg shadow-lg">
              {category}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}





