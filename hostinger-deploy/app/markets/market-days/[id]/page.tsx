import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EventHero from '@/components/ui/EventHero'
import EventUtilityBar from '@/components/ui/EventUtilityBar'
import RSVPAction from '@/components/ui/RSVPAction'
import MobileRSVPBar from '@/components/ui/MobileRSVPBar'
import EventIntentButtons from '@/components/ui/EventIntentButtons'
import VendorCard from '@/components/ui/VendorCard'
import StallMap from '@/components/ui/StallMap'
import Link from 'next/link'

export const metadata = {
  title: 'Market Day Details - AI Markets',
  description: 'View market day details, RSVP, and attending businesses',
}

export default async function MarketDayDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  if (!supabase) {
    notFound()
  }

  // Fetch market day
  const { data: marketDay, error } = await (supabase
    .from('market_days') as any)
    .select(`
      *,
      hosts(id, name, slug, logo_url)
    `)
    .eq('id', params.id)
    .eq('is_published', true)
    .single() as any

  if (error || !marketDay) {
    notFound()
  }

  // Fetch attending vendors
  const { data: stalls } = await (supabase
    .from('market_stalls') as any)
    .select(`
      *,
      vendors(id, name, slug, tagline, logo_url, hero_image_url, category, is_verified, delivery_available, pickup_available)
    `)
    .eq('market_day_id', params.id)
    .eq('attending_physically', true) as any

  // Fetch event offers
  const { data: offers } = await (supabase
    .from('deals') as any)
    .select('*, vendors(name, slug)')
    .or(`event_id.eq.${params.id},vendor_id.eq.${marketDay?.hosts?.id || ''}`)
    .eq('status', 'active')
    .gte('valid_to', new Date().toISOString())
    .limit(6) as any

  const attendingVendors = (stalls || []).map((stall: any) => {
    const vendor = stall.vendors || {}
    return {
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      tagline: vendor.tagline,
      logoUrl: vendor.logo_url,
      heroImageUrl: vendor.hero_image_url,
      category: vendor.category,
      isVerified: vendor.is_verified,
      deliveryAvailable: vendor.delivery_available,
      pickupAvailable: vendor.pickup_available,
      attendingStatus: 'attending' as const,
    }
  })

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Build map URL if coordinates exist
  const mapUrl = marketDay.location_coords
    ? `https://www.google.com/maps?q=${marketDay.location_coords}`
    : marketDay.location_address
      ? `https://www.google.com/maps/search/${encodeURIComponent(marketDay.location_address)}`
      : null

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container-custom max-w-7xl">
          <EventHero
            imageUrl={marketDay.hosts?.logo_url}
            category="Market"
            title={`Market Day - ${marketDay.location_name}`}
            className="mb-8"
          />
        </div>
      </section>

      {/* Title Block */}
      <section className="bg-white border-b border-neutral-200">
        <div className="container-custom max-w-4xl py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
                Market Day - {marketDay.location_name}
              </h1>
              <p className="text-xl text-neutral-600">
                Join us for our weekly artisan market featuring local businesses and makers
              </p>
            </div>
            <EventIntentButtons eventId={params.id} className="flex-shrink-0" />
          </div>
        </div>
      </section>

      {/* Main Content - Utility First Layout */}
      <section className="py-12 bg-white">
        <div className="container-custom max-w-4xl">
          {/* Utility Bar */}
          <EventUtilityBar
            date={marketDay.market_date}
            time={marketDay.start_time || undefined}
            location={marketDay.location_name}
            locationAddress={marketDay.location_address}
            mapUrl={mapUrl || undefined}
            hostName={marketDay.hosts?.name || undefined}
            hostSlug={marketDay.hosts?.slug || undefined}
            className="mb-12"
          />

          {/* Layout Split: 2/3 Content | 1/3 Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Main Content (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {marketDay.location_address && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Location Details</h2>
                  <p className="text-neutral-700 leading-relaxed">{marketDay.location_address}</p>
                </div>
              )}

              {/* Stall Map */}
              {stalls && stalls.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Stall Map</h2>
                  <StallMap
                    stalls={stalls.map((stall: any) => ({
                      id: stall.id,
                      stallNumber: stall.stall_number,
                      isOccupied: true,
                      vendorName: stall.vendors?.name || '',
                      vendorImageUrl: stall.vendors?.logo_url || null,
                      vendorTagline: stall.vendors?.tagline || null,
                    }))}
                  />
                </div>
              )}

              {/* Attending Businesses */}
              {attendingVendors.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                    Attending Businesses
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {attendingVendors.map((vendor: any) => (
                      <VendorCard key={vendor.id} {...vendor} />
                    ))}
                  </div>
                </div>
              )}

              {/* Event Offers */}
              {offers && offers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Event Offers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {offers.map((offer: any) => (
                      <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success-50 text-success-700 rounded-lg font-semibold text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            Active Offer
                          </div>
                        </div>
                        {offer.vendors && (
                          <p className="text-xs text-neutral-500 mb-2">From {offer.vendors.name}</p>
                        )}
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{offer.title}</h3>
                        {offer.description && (
                          <p className="text-sm text-neutral-600 mb-4">{offer.description}</p>
                        )}
                        {offer.valid_to && (
                          <p className="text-xs text-neutral-500">
                            Valid until {new Date(offer.valid_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sticky Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <RSVPAction
                  eventId={params.id}
                  marketDayId={params.id}
                  className="mb-6"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Bottom Bar */}
      <MobileRSVPBar eventId={params.id} marketDayId={params.id} />
    </main>
  )
}

