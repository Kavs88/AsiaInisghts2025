import Image from 'next/image'
import Link from 'next/link'
import { getVenueByLocationName, getUpcomingMarketDays } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'

interface VenueProfilePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: VenueProfilePageProps) {
  try {
    // Convert slug back to location name (replace hyphens with spaces, capitalize)
    const locationName = params.slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    const venue = await getVenueByLocationName(locationName) as any
    return {
      title: `${venue.location_name} - Venue Profile - AI Markets`,
      description: venue.venue_description || `Learn more about ${venue.location_name}, host of our artisan markets`,
    }
  } catch (error) {
    return {
      title: `${params.slug} - Venue Profile - AI Markets`,
      description: `Learn more about our market venue`,
    }
  }
}

export default async function VenueProfilePage({ params }: VenueProfilePageProps) {
  // Convert slug back to location name
  const locationName = params.slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  let venue: any = null
  let upcomingMarkets: any[] = []

  try {
    venue = await getVenueByLocationName(locationName) as any
    if (!venue) {
      notFound()
    }

    // Get upcoming markets at this venue
    const markets = await getUpcomingMarketDays(10)
    upcomingMarkets = (markets || []).filter((m: any) => m.location_name === locationName)
  } catch (error) {
    console.error('Error fetching venue data:', error)
    notFound()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'TBD'
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const facilities = Array.isArray(venue.venue_facilities) ? venue.venue_facilities : []

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-64 lg:h-96 bg-gradient-to-br from-primary-50 to-secondary-50">
        {venue.venue_logo_url && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative w-48 h-48 lg:w-64 lg:h-64">
              <Image
                src={venue.venue_logo_url}
                alt={venue.location_name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/80 z-0" />
      </section>

      {/* Content */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-4">{venue.location_name}</h1>
              {venue.location_address && (
                <p className="text-xl text-neutral-600 mb-6">
                  <svg
                    className="w-5 h-5 inline-block mr-2"
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
                  {venue.location_address}
                </p>
              )}
            </div>

            {/* Description */}
            {venue.venue_description && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">About This Venue</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                    {venue.venue_description}
                  </p>
                </div>
              </div>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Facilities & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {facilities.map((facility: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-100"
                    >
                      <svg
                        className="w-6 h-6 text-primary-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="font-medium text-neutral-900">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(venue.venue_contact_email || venue.venue_contact_phone || venue.venue_website_url) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {venue.venue_website_url && (
                    <a
                      href={venue.venue_website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-neutral-600">Website</div>
                        <div className="font-medium text-neutral-900">Visit Site</div>
                      </div>
                    </a>
                  )}
                  {venue.venue_contact_email && (
                    <a
                      href={`mailto:${venue.venue_contact_email}`}
                      className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-neutral-600">Email</div>
                        <div className="font-medium text-neutral-900">{venue.venue_contact_email}</div>
                      </div>
                    </a>
                  )}
                  {venue.venue_contact_phone && (
                    <a
                      href={`tel:${venue.venue_contact_phone}`}
                      className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-neutral-600">Phone</div>
                        <div className="font-medium text-neutral-900">{venue.venue_contact_phone}</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Markets */}
            {upcomingMarkets.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Upcoming Markets</h2>
                <div className="space-y-4">
                  {upcomingMarkets.map((market) => (
                    <Link
                      key={market.id}
                      href="/market-days"
                      className="block p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200 hover:border-primary-300 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-neutral-900 mb-2">{formatDate(market.market_date)}</h3>
                          <p className="text-neutral-600">
                            {formatTime(market.start_time)} - {formatTime(market.end_time)}
                          </p>
                        </div>
                        <svg
                          className="w-6 h-6 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back Link */}
            <div className="pt-8 border-t border-neutral-200">
              <Link
                href="/market-days"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Market Days
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


