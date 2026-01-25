import VendorCard from '@/components/ui/VendorCard'
import ProductCard from '@/components/ui/ProductCard'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { getVendors, getProducts, getUpcomingMarketDays, getVendorsAttendanceStatus } from '@/lib/supabase/queries'

const HeroSearchBar = dynamic(() => import('@/components/ui/HeroSearchBar'), {
  ssr: false,
  loading: () => <div className="h-14 w-full bg-white/10 rounded-xl animate-pulse" />
})

export const metadata = {
  title: 'Markets | AI Markets',
  description: 'Discover local markets, vendors, and artisans',
}

export default async function MarketsHomePage() {
  // Fetch real data from Supabase - PARALLEL QUERIES for faster loading
  let featuredVendors: any[] = []
  let featuredProducts: any[] = []
  let nextMarketDay: any = null
  let attendanceMap: Record<string, 'attending' | 'delivery-only'> = {}

  try {
    // Run all queries in parallel instead of sequentially
    const [vendorsResult, productsResult, marketDaysResult] = await Promise.all([
      getVendors({ limit: 6 }).catch(() => []),
      getProducts(8).catch(() => []),
      getUpcomingMarketDays(1).catch(() => [])
    ])

    featuredVendors = vendorsResult || []
    featuredProducts = productsResult || []
    nextMarketDay = marketDaysResult && marketDaysResult.length > 0 ? marketDaysResult[0] : null

    // Get attendance status for featured vendors (non-blocking)
    if (featuredVendors.length > 0) {
      const vendorIds = featuredVendors.map(v => v.id)
      attendanceMap = await getVendorsAttendanceStatus(vendorIds).catch(() => ({}))
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    // Fallback to empty arrays - page will show empty states
  }

  // Map database fields to component props
  const mappedVendors = featuredVendors.map((v) => {
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
    }
  })

  const mappedProducts = featuredProducts.map((p: any) => {
    const vendor = p.vendors || {}
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: parseFloat(p.price),
      compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : undefined,
      imageUrl: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : undefined,
      vendorName: vendor.name,
      vendorSlug: vendor.slug,
      stockQuantity: p.stock_quantity || 0,
      isAvailable: p.is_available,
      requiresPreorder: p.requires_preorder,
      preorderLeadDays: p.preorder_lead_days,
      category: p.category,
    }
  })

  // Format market day date
  const formatMarketDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  // Use mapped data (fallback to empty arrays if no data)
  const displayVendors = mappedVendors.length > 0 ? mappedVendors : []
  const displayProducts = mappedProducts.length > 0 ? mappedProducts : []

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Hero Section - Markets Branding */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[90vh] flex items-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        {/* Large Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white/95 z-10" />
          <Image
            src="/images/Stalls 6.jpg"
            alt="Markets"
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
          />
        </div>

        <div className="container-custom relative z-20 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold text-neutral-900 mb-6 sm:mb-8 leading-[0.9] tracking-tight">
                Discover
                <span className="block text-markets-600 mt-2">Artisan Markets</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-700 mb-8 sm:mb-12 leading-relaxed max-w-2xl font-light">
                Shop from local makers, support your community, and experience the best of
                artisan crafts and fresh produce.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/markets/market-days"
                  className="inline-flex items-center justify-center px-8 py-4 bg-markets-600 hover:bg-markets-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  Find Next Market
                </Link>
                <Link
                  href="/markets/sellers"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-neutral-50 text-markets-600 font-semibold rounded-2xl transition-all duration-200 border-2 border-markets-600 text-lg"
                >
                  Browse Sellers
                </Link>
              </div>
            </div>
            <div className="lg:max-w-xl lg:pt-40 relative z-10">
              <HeroSearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Market Preview */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-markets-50 to-secondary-50 rounded-3xl p-8 lg:p-12 border-2 border-markets-200 shadow-soft-lg">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-markets-100 text-markets-700 rounded-full text-sm font-semibold mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Next Market
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
                  {nextMarketDay
                    ? formatMarketDate(nextMarketDay.market_date)
                    : 'Sunday, December 17'}
                </h2>
                <div className="space-y-2 mb-6">
                  <p className="text-xl text-neutral-700 font-medium">
                    {nextMarketDay?.location_name || nextMarketDay?.location || 'Central Park, Downtown'}
                  </p>
                  <p className="text-lg text-neutral-600">
                    {nextMarketDay?.start_time && nextMarketDay?.end_time
                      ? `${nextMarketDay.start_time} - ${nextMarketDay.end_time}`
                      : '9:00 AM - 2:00 PM'}
                  </p>
                  <p className="text-base text-neutral-600">
                    {nextMarketDay?.description || 'Join us for our weekly artisan market featuring 50+ local sellers, live music, and fresh local produce.'}
                  </p>
                </div>
              </div>
              <Link
                href="/markets/market-days"
                className="inline-flex items-center justify-center px-8 py-4 bg-markets-600 hover:bg-markets-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg whitespace-nowrap"
              >
                View Market Details
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sellers */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-3">
                Featured Sellers
              </h2>
              <p className="text-xl text-neutral-600 font-medium">
                Discover amazing local makers and artisans
              </p>
            </div>
            <Link
              href="/markets/sellers"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-markets-600 hover:text-markets-700 font-bold text-lg hover:bg-markets-50 rounded-xl transition-all duration-200"
            >
              View All
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayVendors.length > 0 ? (
              displayVendors.map((vendor) => (
                <VendorCard key={vendor.id} {...vendor} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-neutral-500">
                No sellers available at this time
              </div>
            )}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/markets/sellers"
              className="btn-secondary"
            >
              View All Sellers
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-neutral-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-3">
                Popular Products
              </h2>
              <p className="text-xl text-neutral-600 font-medium">
                Handpicked favorites from our sellers
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-markets-600 hover:text-markets-700 font-bold text-lg hover:bg-markets-50 rounded-xl transition-all duration-200"
            >
              View All
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-neutral-500">
                No products available at this time
              </div>
            )}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="btn-secondary"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-markets-600 to-secondary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Are you a maker or artisan?
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
            Join our community of sellers and reach customers who value handcrafted,
            locally made products.
          </p>
          <Link
            href="/markets/vendor/apply"
            className="inline-flex items-center justify-center px-10 py-5 bg-white text-markets-700 font-bold rounded-2xl text-lg hover:bg-neutral-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            List Your Stall
            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  )
}
