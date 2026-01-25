import StallMap from '@/components/ui/StallMap'
import HubHero from '@/components/ui/HubHero'
import VendorCard from '@/components/ui/VendorCard'
import EventIntentButtons from '@/components/ui/EventIntentButtons'
import Link from 'next/link'
import { getUpcomingMarketDays, getMarketDayWithVendors, getVendorsAttendingMarket, getPropertiesNearMarketDay } from '@/lib/supabase/queries'
import PropertyCard from '@/components/ui/PropertyCard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InteractiveMap from '@/components/ui/InteractiveMap'


export const metadata = {
  title: 'Market Days - AI Markets',
  description: 'View upcoming market days and stall maps',
}

export default async function MarketDaysPage() {
  // Fetch real data from Supabase
  let upcomingMarkets: any[] = []
  let nextMarket: any = null
  let marketStalls: any[] = []
  let attendingVendors: any[] = []
  let eventOffers: any[] = []
  let nearbyProperties: any[] = []

  try {
    // Get upcoming market days
    const markets = await getUpcomingMarketDays(5)

    // Fallback: If no upcoming markets found (e.g. stale data), fetch recent ones
    if (!markets || markets.length === 0) {
      const supabase = await createClient()
      if (supabase) {
        const { data: recentMarkets } = await (supabase
          .from('market_days') as any)
          .select('*')
          .eq('is_published', true)
          .order('market_date', { ascending: false })
          .limit(5) as any

        if (recentMarkets && recentMarkets.length > 0) {
          // Sort ascending to match expected order if we want, or keep desc to show latest
          upcomingMarkets = recentMarkets
        } else {
          upcomingMarkets = []
        }
      }
    } else {
      upcomingMarkets = markets
    }

    // Get the next market day
    nextMarket = upcomingMarkets.length > 0 ? upcomingMarkets[0] : null

    if (nextMarket) {
      // Get market day with vendors
      const marketWithVendors = await getMarketDayWithVendors(nextMarket.id)

      // Get attending vendors
      const stalls = await getVendorsAttendingMarket(nextMarket.id)
      marketStalls = stalls || []

      // Map stalls to vendor cards
      attendingVendors = (marketStalls || []).map((stall: any) => {
        const vendor = stall.vendors || {}
        return {
          id: vendor.id,
          name: vendor.name,
          slug: vendor.slug,
          tagline: vendor.short_tagline || vendor.tagline,
          logoUrl: vendor.logo_url,
          heroImageUrl: vendor.hero_image_url,
          category: vendor.category,
          isVerified: vendor.is_verified,
          deliveryAvailable: vendor.delivery_available,
          pickupAvailable: vendor.pickup_available,
          attendingStatus: stall.attending_physically ? 'attending' as const : 'delivery-only' as const,
        }
      })

      // Get offers linked to this market day or from hosting business
      const supabase = await createClient()
      if (supabase) {
        const { data: offers } = await (supabase
          .from('deals') as any)
          .select('*, vendors(name, slug)')
          .or(`event_id.eq.${nextMarket.id},vendor_id.eq.${nextMarket.hosts?.id || ''}`)
          .eq('status', 'active')
          .gte('valid_to', new Date().toISOString())
          .limit(6) as any

        eventOffers = offers || []
      }
    }

    // Fetch vendor counts for upcoming markets
    const upcomingMarketsWithCounts = await Promise.all(
      upcomingMarkets.map(async (market: any) => {
        const stalls = await getVendorsAttendingMarket(market.id).catch(() => [])
        return {
          ...market,
          vendorCount: stalls?.length || 0
        }
      })
    )
    upcomingMarkets = upcomingMarketsWithCounts

    // Fetch nearby properties for the next market
    if (nextMarket?.location_name) {
      nearbyProperties = await getPropertiesNearMarketDay(nextMarket.location_name, 4).catch(() => [])
    }
  } catch (error) {
    console.error('Error fetching market days data:', error)
    // Continue with empty data - page will show empty states
  }

  // Format market date
  const formatMarketDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  // Format time
  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'TBD'
    // Time format from database is HH:MM:SS, convert to 12-hour format
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Map stalls for StallMap component
  const stallsForMap = (marketStalls || []).map((stall: any, index: number) => {
    const vendor = stall.vendors || {}
    // Generate simple grid positions (can be replaced with actual stall_map coordinates)
    const cols = 10
    const row = Math.floor(index / cols)
    const col = index % cols

    return {
      id: stall.id,
      stallNumber: stall.stall_number,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorTagline: vendor.short_tagline || vendor.tagline,
      vendorImageUrl: vendor.logo_url,
      isOccupied: !!vendor.id,
      x: (col * 8) + 5,
      y: (row * 8) + 5,
      width: 7,
      height: 7,
    }
  })

  if (!nextMarket) {
    return (
      <main id="main-content" className="min-h-screen">
        <HubHero
          title="Market Days"
          subtitle="Join us for our weekly artisan markets featuring local businesses and makers."
          imageUrl="/images/market-days-hero.png"
          variant="markets"
        />

        <section className="py-20 bg-white">
          <div className="container-custom max-w-7xl py-12 lg:py-24 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <p className="text-xl text-neutral-600 mb-4">No upcoming market days scheduled</p>
            <p className="text-neutral-500">Check back soon for our next market!</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen">
      {/* Page Header */}
      <HubHero
        title="Market Days"
        subtitle="Join us for our weekly artisan markets featuring local businesses and makers."
        imageUrl="/images/market-days-hero.png"
        variant="markets"
      />

      {/* Upcoming Market Details */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="bg-primary-50 rounded-2xl p-8 lg:p-12 border border-primary-200 mb-12 relative">
            {/* Host Logo - Bottom Right */}
            {nextMarket.hosts && nextMarket.hosts.logo_url && (
              <div className="absolute bottom-4 right-4 w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-lg p-2 shadow-sm border border-neutral-200">
                <img
                  src={nextMarket.hosts.logo_url}
                  alt={nextMarket.hosts.name || 'Host logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-neutral-900">
                    Next Market: {formatMarketDate(nextMarket.market_date)}
                  </h2>
                  <EventIntentButtons eventId={nextMarket.id} className="flex-shrink-0" />
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {nextMarket.location_name || 'Location TBD'}
                      </p>
                      {nextMarket.location_address && (
                        <p className="text-neutral-600">{nextMarket.location_address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {nextMarket.start_time && nextMarket.end_time
                          ? `${formatTime(nextMarket.start_time)} - ${formatTime(nextMarket.end_time)}`
                          : 'Time TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {attendingVendors.length} Business{attendingVendors.length !== 1 ? 'es' : ''} Attending
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {/* Stall map preview replaced with actual map */}
                <div className="bg-neutral-200 rounded-3xl aspect-square overflow-hidden shadow-inner border border-neutral-200">
                  <InteractiveMap
                    center={
                      nextMarket.location_coords?.y && nextMarket.location_coords?.x
                        ? [nextMarket.location_coords.y, nextMarket.location_coords.x]
                        : [11.9404, 108.4368] // Default to Da Lat center
                    }
                    zoom={15}
                    markers={[
                      {
                        position: nextMarket.location_coords?.y && nextMarket.location_coords?.x
                          ? [nextMarket.location_coords.y, nextMarket.location_coords.x]
                          : [11.9404, 108.4368],
                        label: nextMarket.location_name || 'Market Location'
                      }
                    ]}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stall Map Section */}
      {stallsForMap.length > 0 && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Interactive Stall Map</h2>
              <p className="text-neutral-600">
                Hover over stalls to see business information
              </p>
            </div>
            <StallMap stalls={stallsForMap} />
          </div>
        </section>
      )}

      {/* Event Offers - Only show if offers exist */}
      {eventOffers.length > 0 && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8">Event Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventOffers.map((offer: any) => (
                <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="p-6">
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
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{offer.description}</p>
                    )}
                    {offer.valid_to && (
                      <p className="text-xs text-neutral-500">
                        Valid until {new Date(offer.valid_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Attending Businesses */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                Attending Businesses
              </h2>
              <p className="text-neutral-600">
                {attendingVendors.length} business{attendingVendors.length !== 1 ? 'es' : ''} {attendingVendors.length > 0 ? 'will be' : ''} at the market
              </p>
            </div>
          </div>
          {attendingVendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {attendingVendors.map((vendor) => (
                <VendorCard key={vendor.id} {...vendor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-600">
              <p>No businesses registered for this market yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stay Near the Market */}
      {nearbyProperties.length > 0 && (
        <section className="py-20 bg-neutral-900 text-white overflow-hidden">
          <div className="container-custom">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
              <div className="max-w-2xl">
                <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Stay Near the Market</h2>
                <p className="text-xl text-neutral-400 font-medium">
                  Turn your market visit into a weekend getaway. Check out these stays and event spaces located just minutes from {nextMarket.location_name}.
                </p>
              </div>
              <Link
                href="/concierge/relocation"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-primary-50 transition-colors"
              >
                View All Stays
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyProperties.map((property: any) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  address={property.address}
                  type={property.type}
                  property_type={property.property_type}
                  price={property.price}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  capacity={property.capacity}
                  images={property.images}
                  businesses={property.businesses}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Future Market Days */}
      {upcomingMarkets.length > 1 && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8">Upcoming Markets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMarkets.slice(1).map((market: any) => (
                <div
                  key={market.id}
                  className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200"
                >
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {formatMarketDate(market.market_date)}
                  </h3>
                  <p className="text-neutral-600 mb-2">{market.location_name}</p>
                  {market.start_time && market.end_time && (
                    <p className="text-sm text-neutral-500 mb-3">
                      {formatTime(market.start_time)} - {formatTime(market.end_time)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium text-neutral-700">{market.vendorCount || 0} businesses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
