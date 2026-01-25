'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface VendorStripeProps {
  name: string
  isVerified: boolean
  tier?: 'Free' | 'Premium' | 'Featured'
  attendingStatus?: 'attending' | 'delivery-only' | 'online-only'
  contactPhone?: string
  contactEmail?: string
  className?: string
}

export default function VendorStripe({
  name,
  isVerified,
  tier,
  attendingStatus,
  contactPhone,
  contactEmail,
  className,
}: VendorStripeProps) {
  const getTierBadge = () => {
    if (!tier || tier === 'Free') return null

    const tierConfig = {
      Premium: {
        label: 'Premium',
        className: 'bg-primary-100 text-primary-700 border-primary-300',
      },
      Featured: {
        label: 'Featured',
        className: 'bg-secondary-100 text-secondary-700 border-secondary-300',
      },
    }

    const config = tierConfig[tier as keyof typeof tierConfig]
    if (!config) return null

    return (
      <span className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
        config.className
      )}>
        {config.label}
      </span>
    )
  }

  const getAttendingBadge = () => {
    if (!attendingStatus) return null

    const statusConfig = {
      attending: {
        label: 'Attending',
        className: 'bg-success-50 text-success-700 border-success-200',
      },
      'delivery-only': {
        label: 'Delivery Only',
        className: 'bg-warning-50 text-warning-700 border-warning-200',
      },
      'online-only': {
        label: 'Online Only',
        className: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      },
    }

    const config = statusConfig[attendingStatus]
    if (!config) return null

    return (
      <span className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
        config.className
      )}>
        {config.label}
      </span>
    )
  }

  /*
   * GUARDRAIL: Sticky positioning must account for responsive header height
   * 
   * Header height: 64px (mobile) / 80px (desktop)
   * This component uses: top-16 (64px) / lg:top-20 (80px)
   * 
   * DO NOT: Use fixed pixel values (e.g., top-[64px])
   * DO NOT: Change z-index without checking z-index scale (see globals.css)
   * 
   * Test after changes: Verify no overlap with header on all breakpoints
   */
  return (
    <div className={cn(
      'sticky top-16 lg:top-20 z-stripe bg-white border-b border-neutral-200 shadow-sm transition-all duration-300',
      className
    )}>
      <div className="container-custom">
        <div className="flex items-center justify-start sm:justify-between py-4 gap-4 flex-wrap">
          {/* Left: Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {isVerified && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-label="Verified vendor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-neutral-700">Verified</span>
              </div>
            )}
            {getTierBadge()}
            {getAttendingBadge()}
          </div>

          {/* Right: Contact Buttons */}
          <div className="flex items-center gap-3">
            {contactPhone && (
              <a
                href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-success-600 hover:bg-success-700 text-white text-sm font-medium rounded-xl transition-colors"
                aria-label="Contact via WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors"
                aria-label="Contact via Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





