'use client'

import Link from 'next/link'

interface EventUtilityBarProps {
  date?: string
  time?: string
  location?: string | null
  locationAddress?: string | null
  mapUrl?: string | null
  price?: string | null
  hostName?: string | null
  hostSlug?: string | null
  className?: string
}

export default function EventUtilityBar({
  date,
  time,
  location,
  locationAddress,
  mapUrl,
  price,
  hostName,
  hostSlug,
  className = '',
}: EventUtilityBarProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'TBD'
    // Handle both time-only and datetime strings
    if (timeString.includes('T')) {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    }
    // Handle HH:MM:SS format
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 ${className}`}>
      {/* When */}
      <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-neutral-500 mb-1">When</div>
          <div className="text-lg font-semibold text-neutral-900">{formatDate(date)}</div>
          {time && (
            <div className="text-sm text-neutral-600 mt-1">{formatTime(time)}</div>
          )}
        </div>
      </div>

      {/* Where */}
      <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="flex-shrink-0 w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-neutral-500 mb-1">Where</div>
          {location ? (
            <>
              <div className="text-lg font-semibold text-neutral-900">{location}</div>
              {locationAddress && (
                <div className="text-sm text-neutral-600 mt-1 line-clamp-1">{locationAddress}</div>
              )}
              {mapUrl && (
                <Link
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1"
                >
                  View Map
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}
            </>
          ) : (
            <div className="text-lg font-semibold text-neutral-400">TBD</div>
          )}
        </div>
      </div>

      {/* Price/Host */}
      <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
          {price ? (
            <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {price ? (
            <>
              <div className="text-sm font-medium text-neutral-500 mb-1">Price</div>
              <div className="text-lg font-semibold text-neutral-900">{price}</div>
            </>
          ) : hostName ? (
            <>
              <div className="text-sm font-medium text-neutral-500 mb-1">Host</div>
              {hostSlug ? (
                <Link
                  href={`/markets/sellers/${hostSlug}`}
                  className="text-lg font-semibold text-neutral-900 hover:text-primary-600 transition-colors"
                >
                  {hostName}
                </Link>
              ) : (
                <div className="text-lg font-semibold text-neutral-900">{hostName}</div>
              )}
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-neutral-500 mb-1">Price</div>
              <div className="text-lg font-semibold text-neutral-900">Free</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}



