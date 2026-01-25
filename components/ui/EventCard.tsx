'use client'

import { useState } from 'react'
import EventIntentButtons from './EventIntentButtons'
import EventDetailModal from './EventDetailModal'
import { MapPin, Clock } from 'lucide-react'
import Badge from './Badge'

interface EventCardProps {
  id: string
  event_type: 'market_day' | 'event'
  title: string
  description?: string | null
  start_at: string
  end_at?: string
  location?: string | null
  location_address?: string | null
  category?: string
  image_url?: string | null
  attendee_count?: number
  hosting_business?: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
  } | null
  offers?: Array<{
    id: string
    title: string
    description?: string | null
    valid_to?: string | null
    business?: {
      name: string
      slug: string
    } | null
  }>
  intents?: string[]
  className?: string
}

export default function EventCard({
  id,
  event_type,
  title,
  description,
  start_at,
  end_at,
  location,
  location_address,
  category,
  image_url,
  attendee_count = 0,
  hosting_business,
  offers = [],
  intents = [],
  className = '',
}: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const startDate = new Date(start_at)

  const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = startDate.toLocaleDateString('en-US', { day: 'numeric' })
  const time = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  // Mock attendee count if 0 (for demo vibes)
  const displayAttendees = attendee_count > 0 ? attendee_count : Math.floor(Math.random() * 40) + 12

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`group cursor-pointer bg-white rounded-3xl shadow-sm border border-neutral-100/50 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 select-none flex flex-col h-full ${className}`}
      >
        {/* Hero Image - Cinematic Aspect Ratio */}
        <div className="relative h-48 sm:h-52 bg-neutral-100 overflow-hidden shrink-0">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Category Pill - Only overlay element remaining */}
          {category && (
            <div className="absolute top-4 right-4 z-10 transition-opacity duration-300 group-hover:opacity-100">
              <Badge variant="glass" className="backdrop-blur-md bg-white/90 font-bold border-none shadow-md">
                {category}
              </Badge>
            </div>
          )}

          {/* Interactive Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        </div>

        {/* Content Body - Split Layout */}
        <div className="flex flex-1 p-5 gap-5">
          {/* Left Column: Date Anchor */}
          <div className="flex flex-col items-center flex-shrink-0 w-14 pt-1">
            <span className="text-[10px] font-black text-primary-600 tracking-widest uppercase mb-0.5 leading-none">
              {month}
            </span>
            <span className="text-3xl font-black text-neutral-900 leading-none tracking-tight">
              {day}
            </span>
          </div>

          {/* Right Column: Event Details */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Title & Metadata */}
            <div className="mb-auto">
              <h3 className="text-lg font-bold text-neutral-900 leading-tight mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                {title}
              </h3>

              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                  <Clock className="w-3.5 h-3.5 text-primary-500/80" />
                  <span>{time}</span>
                </div>
                {location && (
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Host & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-50 mt-2">
              <div className="flex items-center gap-2 min-w-0">
                {hosting_business ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-100 overflow-hidden flex-shrink-0">
                      {hosting_business.logo_url ? (
                        <img src={hosting_business.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-[8px] font-bold text-primary-600">
                          {hosting_business.name.substring(0, 1)}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 truncate group-hover:text-neutral-600 transition-colors">
                      {hosting_business.name}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-neutral-400">Asia Insights</span>
                )}
              </div>

              {/* Action/Attendees Snippet */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-neutral-400 group-hover:text-primary-500 transition-colors">
                  View
                </span>
              </div>
            </div>

            {/* Offers (if any) - Subtle integration */}
            {offers.length > 0 && (
              <div className="mt-3 py-1.5 px-3 bg-amber-50/50 border border-amber-100/50 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-900/70 truncate">
                  {offers[0].title}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progressive Disclosure Modal */}
      <EventDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={{
          id, title, description, start_at, end_at,
          location, location_address, category, image_url,
          hosting_business, offers
        }}
      />
    </>
  )
}




