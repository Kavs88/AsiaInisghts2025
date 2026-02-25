'use client'

import { useState } from 'react'
import Image from 'next/image'
import EventDetailModal from './EventDetailModal'
import { MapPin, Clock, Calendar, ArrowRight } from 'lucide-react'
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
        className={`group cursor-pointer bg-white rounded-2xl shadow-sm border border-neutral-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 select-none flex flex-col h-full ${className}`}
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
              <Calendar className="w-16 h-16 text-primary-300" strokeWidth={1} />
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

          {/* Date Pill - Bottom Left */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-white/50">
            <div className="text-xs font-black text-primary-600 uppercase tracking-widest leading-none mb-0.5">{month}</div>
            <div className="text-2xl font-black text-neutral-900 leading-none">{day}</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-lg font-bold text-neutral-900 leading-snug line-clamp-2 mb-3 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              <span>{time}</span>
            </div>
            {location && (
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 truncate">
                <MapPin className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 min-w-0">
              {hosting_business ? (
                <>
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-100 overflow-hidden flex-shrink-0">
                    {hosting_business.logo_url ? (
                      <img src={hosting_business.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 text-xs font-bold text-primary-600">
                        {hosting_business.name.substring(0, 1)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-neutral-500 truncate">
                    {hosting_business.name}
                  </span>
                </>
              ) : (
                <span className="text-xs font-bold text-neutral-400">Asia Insights</span>
              )}
            </div>
            <div className="w-7 h-7 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
              <ArrowRight className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform duration-300" strokeWidth={1.5} />
            </div>
          </div>

          {/* Offers Strip */}
          {offers.length > 0 && (
            <div className="mt-3 py-1.5 px-3 bg-amber-50/50 border border-amber-100/50 rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-amber-900/70 truncate">
                {offers[0].title}
              </span>
            </div>
          )}
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
