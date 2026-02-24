'use client'

import { useState } from 'react'
import Image from 'next/image'
import EventIntentButtons from './EventIntentButtons'
import EventDetailModal from './EventDetailModal'
import { MapPin, Clock } from 'lucide-react'
import Badge from './Badge'
import { SaveButton } from './SoftActionButtons'

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



  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`group cursor-pointer bg-white rounded-3xl shadow-sm border border-neutral-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 select-none flex flex-col h-full ${className}`}
      >
        {/* Hero Image - 4:3 Aspect Ratio Standard */}
        <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden shrink-0">
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Interactive Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

          {/* Category Badge - Top Left */}
          {category && (
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <Badge variant="glass" className="backdrop-blur-md bg-white/90 font-bold border-none shadow-md text-xs uppercase tracking-wider">
                {category}
              </Badge>
            </div>
          )}

          {/* Save Button - Top Right */}
          <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
            <SaveButton
              itemType="event"
              itemId={id}
              minimal
              className="bg-white/90 backdrop-blur-md shadow-md border-transparent hover:bg-white"
            />
          </div>
        </div>

        {/* Content Body - p-6 Uniform */}
        <div className="flex flex-1 p-6 gap-5 relative z-10 bg-white">
          {/* Left Column: Date Anchor - Adjusted to align with text */}
          <div className="flex flex-col items-center flex-shrink-0 w-12 pt-1 border-r border-neutral-100 pr-4 mr-1">
            <span className="text-[10px] font-black text-primary-600 tracking-widest uppercase mb-1 leading-none">
              {month}
            </span>
            <span className="text-2xl font-black text-neutral-900 leading-none tracking-tight">
              {day}
            </span>
          </div>

          {/* Right Column: Event Details */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Title & Metadata */}
            <div className="mb-auto">
              <h3 className="text-lg font-bold text-neutral-900 leading-snug mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                {title}
              </h3>

              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
                  <Clock className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                  <span>{time}</span>
                </div>
                {location && (
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 truncate">
                    <MapPin className="w-4 h-4 shrink-0 text-neutral-400" strokeWidth={1.5} />
                    <span className="truncate">{location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Host & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-2">
              <div className="flex items-center gap-2 min-w-0">
                {hosting_business ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-100 overflow-hidden flex-shrink-0">
                      {hosting_business.logo_url ? (
                        <img src={hosting_business.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-[8px] font-bold text-primary-600">
                          {hosting_business.name.substring(0, 1)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-neutral-500 truncate group-hover:text-neutral-700 transition-colors">
                      {hosting_business.name}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-neutral-400">Asia Insights</span>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400 group-hover:text-primary-600 transition-colors uppercase tracking-wider">
                  View
                </span>
              </div>
            </div>

            {/* Offers (if any) - Subtle integration */}
            {offers.length > 0 && (
              <div className="mt-3 py-1.5 px-3 bg-amber-50/50 border border-amber-100/50 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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




