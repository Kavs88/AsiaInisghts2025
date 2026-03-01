import Link from 'next/link'
import VendorCard from '@/components/ui/VendorCard'
import { Users } from 'lucide-react'
import { getVendors, getVendorsAttendanceStatus } from '@/lib/supabase/queries'

export const metadata = {
  title: 'Makers — Asia Insights',
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
        <div className="container-custom py-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 mb-4 tracking-tight">
            Our Community
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
            Meet the makers, artisans, and verified members behind the Sunday Market.
          </p>
        </div>
      </section>


      {/* Sellers Grid - Premium spacing and layout */}
      <section className="bg-neutral-50">
        <div className="container-custom py-12">
          {/* Results Count - Subtle, not prominent */}
          <p className="text-sm sm:text-base text-neutral-500 mb-10">
            {mappedSellers.length} member{mappedSellers.length !== 1 ? 's' : ''} found
          </p>

          {/* Grid - Consistent gaps, equal height cards */}
          {mappedSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mappedSellers.map((seller) => (
                <VendorCard key={seller.id} {...seller} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-10 md:p-14 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-neutral-900 mb-2">
                    Be the first to showcase your craft
                  </h2>
                  <p className="text-neutral-600 max-w-md mx-auto">
                    Our seller community is growing. Apply to list your stall and start building
                    your presence with local customers.
                  </p>
                </div>
                <Link
                  href="/markets/vendor/apply"
                  className="h-12 px-6 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-sm flex items-center"
                >
                  Apply for a Stall
                </Link>
              </div>
            </div>
          )}
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

