'use client'

import { useState } from 'react'
import Link from 'next/link'
import EventIntentButtons from './EventIntentButtons'
import EventDetailModal from './EventDetailModal'
import { MapPin, Clock, Users } from 'lucide-react'
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
        className={`group cursor-pointer bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-neutral-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 select-none ${className}`}
      >
        {/* Hero Image Section */}
        <div className="relative h-56 bg-neutral-100 overflow-hidden">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Date Badge Overlay */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-2.5 text-center min-w-[65px] border border-white/40 transform group-hover:scale-105 transition-transform duration-500">
            <span className="block text-[10px] font-black text-primary-600 tracking-widest uppercase mb-0.5">{month}</span>
            <span className="block text-2xl font-black text-neutral-900 leading-none">{day}</span>
          </div>

          {/* Category Pill */}
          {category && (
            <div className="absolute top-4 right-4 animate-fade-in">
              <Badge variant="glass">{category}</Badge>
            </div>
          )}

          {/* Subtle Bottom Shade */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="p-6">
          {/* Host Info */}
          {hosting_business && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-neutral-100 border border-neutral-100 overflow-hidden flex-shrink-0 shadow-sm">
                {hosting_business.logo_url ? (
                  <img src={hosting_business.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-[10px] font-bold text-primary-600">
                    {hosting_business.name.substring(0, 1)}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-neutral-400 group-hover:text-primary-600 transition-colors truncate">
                {hosting_business.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-black text-neutral-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
            {title}
          </h3>

          {/* Metadata Row */}
          <div className="flex items-center gap-4 text-xs font-bold text-neutral-500 mb-6">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>{time}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="truncate max-w-[140px]">{location}</span>
              </div>
            )}
          </div>

          {/* Footer: Attendees & Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-neutral-50">
            {/* Attendees */}
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-10`}>
                    <img src={`https://i.pravatar.cc/100?img=${i + 15 + Math.floor(Math.random() * 10)}`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-neutral-900 uppercase tracking-tighter leading-none">
                  {displayAttendees}+ Going
                </span>
                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Community</span>
              </div>
            </div>

            {/* RSVP Intent - Prevent click from opening modal */}
            <div onClick={(e) => e.stopPropagation()}>
              <EventIntentButtons eventId={id} />
            </div>
          </div>

          {/* Linked Offers Highlight */}
          {offers.length > 0 && (
            <div className="mt-4 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 flex items-center gap-3 group/offer">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm group-hover/offer:scale-110 transition-transform">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011-1h8a1 1 0 011 1v1h1a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V5a2 2 0 012-2h1V2zm1 1v1h8V3H6z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-[10px] font-black text-amber-800 truncate tracking-wide">
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


