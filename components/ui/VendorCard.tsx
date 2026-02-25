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
  trustBadges?: string[]
  founderRecommended?: boolean
  initialIsFollowing?: boolean
  className?: string
}

/**
 * VendorCard Component
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
  trustBadges,
  founderRecommended,
  initialIsFollowing,
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
        'group bg-white rounded-2xl overflow-hidden',
        'border border-neutral-100/50',
        'shadow-sm hover:shadow-xl hover:-translate-y-1',
        'transition-all duration-300',
        'h-full flex flex-col relative',
        className
      )}
    >
      <Link
        href={`/makers/${slug}`}
        className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`Visit ${name} maker profile`}
      />

      {/* Hero Image Container */}
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden shrink-0">
        {(heroImageUrl && typeof heroImageUrl === 'string' && !imgError) ? (
          <Image
            src={heroImageUrl}
            alt={`${name} shop banner`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            quality={85}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <div className="w-full h-full bg-gradient-to-br from-markets-50 to-secondary-50 flex items-center justify-center">
              <span className="text-4xl text-markets-300 font-black">{name.charAt(0)}</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          {category && <Badge variant="glass" className="backdrop-blur-md bg-white/90 font-bold border-none shadow-md text-xs uppercase tracking-wider">{category}</Badge>}
        </div>

        {attendingStatus && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            {getAttendanceBadge()}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col relative z-20 pointer-events-none text-left">
        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-markets-600 transition-colors line-clamp-1 leading-snug mb-3">
          {name}
        </h3>

        {tagline && (
          <p className="text-base text-neutral-600 mb-4 line-clamp-2 leading-relaxed font-medium">
            {tagline}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between text-sm font-medium text-neutral-500">
          <div className="flex gap-3">
            {deliveryAvailable && <span className="text-neutral-900 font-semibold">Delivery</span>}
            {pickupAvailable && <span className="text-neutral-900 font-semibold">Pickup</span>}
          </div>
          <span className="text-markets-600 font-bold group-hover:underline">Visit Shop</span>
        </div>
      </div>
    </article>
  )
}

export default memo(VendorCard)
