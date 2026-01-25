'use client'

import { memo, useCallback, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import Badge from './Badge'

interface VendorCardProps {
  id: string
  name: string
  slug: string
  tagline?: string
  logoUrl?: string
  heroImageUrl?: string
  category?: string
  isVerified?: boolean
  isActive?: boolean
  deliveryAvailable?: boolean
  pickupAvailable?: boolean
  attendingStatus?: 'attending' | 'delivery-only' | 'online-only'
  className?: string
}

/**
 * VendorCard Component
 * 
 * Premium seller card with:
 * - Consistent internal padding (p-6)
 * - Equal height layout
 * - Soft shadow and border
 * - Clean typography hierarchy
 * - Mobile-optimized tap targets
 */
function VendorCard({
  id,
  name,
  slug,
  tagline,
  logoUrl,
  heroImageUrl,
  category,
  isVerified = false,
  isActive = true,
  deliveryAvailable = false,
  pickupAvailable = true,
  attendingStatus,
  className,
}: VendorCardProps) {
  const [imgError, setImgError] = useState(false)

  if (!isActive) return null

  const getAttendanceBadge = useCallback(() => {
    switch (attendingStatus) {
      case 'attending':
        return <Badge variant="success">Attending</Badge>
      case 'delivery-only':
        return <Badge variant="warning">Delivery Only</Badge>
      case 'online-only':
        return <Badge variant="neutral">Online Only</Badge>
      default:
        return null
    }
  }, [attendingStatus])

  return (
    <article
      className={cn(
        // Base styles - Premium card with soft shadow
        'group bg-white rounded-3xl overflow-hidden',
        'border border-neutral-100',
        'shadow-sm hover:shadow-2xl hover:-translate-y-2',
        'transition-all duration-500',
        'h-full flex flex-col',
        // Focus and interaction states
        'focus-within:ring-2 focus-within:ring-markets-500 focus-within:ring-offset-2',
        className
      )}
    >
      <Link
        href={`/markets/sellers/${slug}`}
        className="block h-full flex flex-col focus:outline-none"
        aria-label={`Visit ${name} seller profile`}
      >
        {/* Hero Image Container - Fixed aspect ratio */}
        <div className="relative h-48 sm:h-52 bg-neutral-100 overflow-hidden">
          {(heroImageUrl && typeof heroImageUrl === 'string' && !imgError) ? (
            <Image
              src={heroImageUrl}
              alt={`${name} shop banner`}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              loading="lazy"
              quality={85}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <svg
                className="w-12 h-12 sm:w-14 sm:h-14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Logo Overlay - Vertically centered in the visible banner area */}
          {(logoUrl && typeof logoUrl === 'string') && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full p-1 shadow-lg border-2 border-white flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={`${name} logo`}
                  fill
                  className="object-contain rounded-full"
                  sizes="72px"
                />
              </div>
            </div>
          )}

          {/* Attendance Badge - Top Right Corner */}
          {attendingStatus && (
            <div className="absolute top-3 right-3 z-10">
              {getAttendanceBadge()}
            </div>
          )}
        </div>

        {/* Card Content - Consistent padding, flex-grow for equal height */}
        <div className="pt-10 pb-6 px-6 flex-1 flex flex-col">
          {/* Vendor Name & Verified Badge - Centered, clean spacing */}
          {/* GUARDRAIL: Text overflow protection. Vendor name: line-clamp-1. Category badge: truncate max-w-[120px]. Tagline: line-clamp-2. DO NOT: Remove truncation/line-clamp classes or increase max-w without testing. Test: Use vendor name "Very Long Vendor Name That Could Overflow". */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-markets-600 transition-colors text-center line-clamp-1">
              {name}
            </h3>
            {isVerified && (
              <svg
                className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-markets-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Verified seller"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Tagline - Secondary text, restrained */}
          {tagline && (
            <p className="text-sm sm:text-base text-neutral-600 text-center mb-4 line-clamp-2 flex-grow">
              {tagline}
            </p>
          )}

          {/* Category & Delivery Badges - Bottom aligned, consistent spacing */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-auto">
            {category && <Badge variant="primary" className="truncate max-w-[120px]">{category}</Badge>}
            {deliveryAvailable && <Badge variant="success">Delivery</Badge>}
            {pickupAvailable && <Badge variant="neutral">Pickup</Badge>}
          </div>
        </div>
      </Link>
    </article>
  )
}

export default memo(VendorCard)
