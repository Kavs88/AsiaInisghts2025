import Link from 'next/link'
import VendorCard from '@/components/ui/VendorCard'
import { getVendors, getVendorsAttendanceStatus } from '@/lib/supabase/queries'

export const metadata = {
  title: 'Makers - Sunday Market',
  description: 'Browse all our artisan makers and verified members',
}

export default async function SellersPage() {
  // Fetch real data from Supabase with limit for performance
  let sellers: any[] = []
  let attendanceMap: Record<string, 'attending' | 'delivery-only'> = {}

  try {
    // Limit sellers to 50 for initial load (add pagination later)
    const allSellers = await getVendors({ limit: 50 })
    sellers = allSellers || []

    // Get attendance status for all sellers
    if (sellers.length > 0) {
      const sellerIds = sellers.map(v => v.id)
      attendanceMap = await getVendorsAttendanceStatus(sellerIds).catch(() => ({}))
    }
  } catch (error) {
    console.error('Error fetching sellers:', error)
    // Fallback to empty array
  }

  // Map database fields to component props
  const mappedSellers = sellers.map((v) => {
    // Determine attendance status
    let attendingStatus: 'attending' | 'delivery-only' | 'online-only' | undefined = attendanceMap[v.id]

    // If not in market_stalls but has delivery, mark as delivery-only
    if (!attendingStatus && v.delivery_available && !v.pickup_available) {
      attendingStatus = 'delivery-only'
    }

    return {
      id: v.id,
      name: v.name,
      slug: v.slug,
      tagline: v.short_tagline || v.tagline,
      logoUrl: v.logo_url,
      heroImageUrl: v.hero_image_url,
      category: v.category,
      isVerified: v.is_verified || v.verified,
      deliveryAvailable: v.delivery_available,
      pickupAvailable: v.pickup_available,
      attendingStatus,
      trustBadges: v.trust_badges || [],
      founderRecommended: v.founder_recommended,
    }
  })

  // Extract unique categories from sellers
  const categories = ['All', ...Array.from(new Set(sellers.map(v => v.category).filter(Boolean)))]

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Page Header - Premium spacing and typography */}
      <section className="bg-white border-b border-neutral-100">
        <div className="container-custom">
          <div className="py-12">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 mb-4 tracking-tight">
                Our Community
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
                Meet the makers, artisans, and verified members behind the Sunday Market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section - Clean, minimal */}
      <section className="sticky top-[64px] lg:top-[80px] z-40 bg-white border-b border-neutral-100">
        <div className="container-custom">
          <div className="py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    disabled
                    className="px-4 py-2 text-sm font-medium text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-lg cursor-not-allowed transition-all duration-200"
                    aria-pressed={category === 'All'}
                    title="Filtering coming soon"
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Additional Filters */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 opacity-50 grayscale select-none pointer-events-none" title="Filters coming soon">
                <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-not-allowed">
                  <input
                    type="checkbox"
                    disabled
                    className="w-4 h-4 text-neutral-300 border-neutral-200 rounded focus:ring-0 cursor-not-allowed"
                  />
                  <span>Attending Next Market</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-not-allowed">
                  <input
                    type="checkbox"
                    disabled
                    className="w-4 h-4 text-neutral-300 border-neutral-200 rounded focus:ring-0 cursor-not-allowed"
                  />
                  <span>Delivery Available</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sellers Grid - Premium spacing and layout */}
      <section className="bg-neutral-50">
        <div className="container-custom">
          <div className="py-12">
            {/* Results Count - Subtle, not prominent */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <p className="text-sm sm:text-base text-neutral-500">
                {mappedSellers.length} member{mappedSellers.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Grid - Consistent gaps, equal height cards */}
            {mappedSellers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mappedSellers.map((seller) => (
                  <VendorCard key={seller.id} {...seller} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-neutral-300 mb-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3">
                    No members found
                  </h2>
                  <p className="text-base text-neutral-600">
                    Check back soon for new Makers!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-neutral-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl lg:text-4xl font-black mb-6">
            Are you a business or service provider?
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-300 mb-10 max-w-2xl mx-auto font-medium">
            Join our community of local businesses. List your business profile to verify your identity and apply for market stalls.
          </p>
          <Link
            href="/markets/vendor/apply"
            className="inline-flex items-center justify-center px-10 py-5 bg-white text-neutral-900 font-bold rounded-2xl text-lg hover:bg-neutral-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Join the Community
            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </main >
  )
}

