import Link from 'next/link'
import Image from 'next/image'
import HeroSearchBar from '@/components/ui/HeroSearchBar'
import { ShieldCheck, Building2 } from 'lucide-react'
import { getBusinesses } from '@/lib/actions/businesses'
import { getProperties } from '@/lib/actions/properties'
import PropertyCard from '@/components/ui/PropertyCard'

// QA FIX: Hub → Markets Decoupling
// REMOVED: Direct Markets data fetching (getVendors, getProducts, getUpcomingMarketDays)
// REASON: Hub must not depend on Markets internals to maintain section independence
// RESULT: Hub is now section-agnostic and will not fail if Markets database is unavailable
// NOTE: Markets content section below is preserved for SEO but uses static/optional content
export default async function Home() {
  // Fetch new/featured businesses and properties for the homepage
  // Use Promise.all for parallel fetching
  const [businesses, properties] = await Promise.all([
    getBusinesses(undefined, 4),
    getProperties({ limit: 4 })
  ])

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* PHASE 1: Platform Identity Hero Section */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[90vh] flex items-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        {/* Large Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white/95 z-10" />
          <Image
            src="/images/Stalls 6.jpg"
            alt="Asia Insights"
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
          />
        </div>

        <div className="container-custom relative z-20 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black text-neutral-900 mb-6 sm:mb-8 leading-[0.9] tracking-tight">
              Welcome to Asia Insights
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary-600 font-bold mb-6 sm:mb-8">
              Your community hub for Southeast Asia
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-700 mb-8 sm:mb-12 leading-relaxed max-w-3xl font-light">
              Founded by expats, for expats — connecting you with events, businesses, markets, stays, and personalized support across Da Nang, Hoi An, and beyond.
            </p>
            {/* PHASE 1: Hero CTAs - Primary and Secondary action buttons
                PRIMARY: "Explore Sections" - scrolls to section cards section
                SECONDARY: "Start Your Journey" - links to Markets
                STYLING: Primary uses bg-primary-600, Secondary uses white with border
                ACCESSIBILITY: Both CTAs have minimum 44px height (WCAG requirement)
            */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12">
              <a
                href="#explore-asia-insights"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl min-h-[44px] text-lg"
              >
                Explore Sections
              </a>
              <Link
                href="/markets"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-primary-600 text-primary-600 font-bold rounded-2xl transition-all duration-200 hover:bg-primary-50 min-h-[44px] text-lg"
              >
                Start Your Journey
              </Link>
            </div>
            <div className="lg:max-w-xl relative z-10">
              <HeroSearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Next Market Widget - Drives real-world attendance */}
      <section className="py-8 bg-primary-50 border-y border-primary-100">
        <div className="container-custom">
          <Link
            href="/markets/market-days"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-primary-600">Next Market</div>
                <div className="text-xl sm:text-2xl font-bold text-neutral-900">December 17, 2024</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
              <span>View All Market Days</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Why Trust Us - Human Connection */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Sam's Photo */}
              <div className="relative order-2 lg:order-1">
                <div className="aspect-square rounded-3xl overflow-hidden border-4 border-primary-200 shadow-2xl relative">
                  <Image
                    src="/images/team/sam-profile.jpg"
                    alt="Sam - Founder of Asia Insights"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-100 rounded-3xl -z-10" />
              </div>

              {/* Story */}
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 mb-4 lg:mb-6 leading-tight">
                  Why Trust Asia Insights?
                </h2>
                <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                  "I moved to Da Nang in 2018 and built this platform to help others do the same.
                  We're not a faceless corporation — we're expats who've walked this path."
                </p>
                <p className="text-base text-neutral-600 mb-8 font-semibold">
                  — Sam, Founder
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700 text-base lg:text-lg">7+ years of local expertise in Southeast Asia</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700 text-base lg:text-lg">Verified businesses & trusted local partners</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700 text-base lg:text-lg">Real community, not algorithms</span>
                  </div>
                </div>

                <Link
                  href="/meet-the-team"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-base"
                >
                  Meet Our Team
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 2: Section Hub Overview - Visual Elevation Pass */}
      <section id="explore-asia-insights" className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-8 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 mb-4">
              Explore Asia Insights
            </h2>
            <p className="text-lg lg:text-xl text-neutral-600 font-medium leading-relaxed">
              Discover our sections, each designed to support different aspects of life in Southeast Asia
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto justify-items-center">
            {/* Events - Equal Spoke */}
            <Link
              href="/markets/discovery"
              className="w-full bg-white rounded-2xl p-6 border-2 border-primary-500 shadow-md hover:shadow-lg hover:scale-105 transition-transform opacity-100 group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Events</h3>
              <p className="text-neutral-600 mb-4 text-sm leading-relaxed">Discover festivals, markets, and community gatherings</p>
              <span className="text-primary-600 font-semibold text-sm group-hover:text-primary-700 inline-flex items-center gap-2">
                Explore Events
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Businesses - Equal Spoke */}
            <Link
              href="/businesses"
              className="w-full bg-white rounded-2xl p-6 border-2 border-primary-500 shadow-md hover:shadow-lg hover:scale-105 transition-transform opacity-100 group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Businesses</h3>
              <p className="text-neutral-600 mb-4 text-sm leading-relaxed">Discover local businesses, services, and professional networks</p>
              <span className="text-primary-600 font-semibold text-sm group-hover:text-primary-700 inline-flex items-center gap-2">
                Explore Businesses
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Markets - Equal Spoke */}
            <Link
              href="/markets"
              className="w-full bg-white rounded-2xl p-6 border-2 border-primary-500 shadow-md hover:shadow-lg hover:scale-105 transition-transform opacity-100 group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Markets</h3>
              <p className="text-neutral-600 mb-4 text-sm leading-relaxed">Experience our weekly events bringing together vendors and community</p>
              <span className="text-primary-600 font-semibold text-sm group-hover:text-primary-700 inline-flex items-center gap-2">
                Explore Markets
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Stays - Equal Spoke */}
            <Link
              href="/properties"
              className="w-full bg-white rounded-2xl p-6 border-2 border-primary-500 shadow-md hover:shadow-lg hover:scale-105 transition-transform opacity-100 group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Stays</h3>
              <p className="text-neutral-600 mb-4 text-sm leading-relaxed">Find villas, apartments, and event venues across the region</p>
              <span className="text-primary-600 font-semibold text-sm group-hover:text-primary-700 inline-flex items-center gap-2">
                Explore Stays
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Concierge - Equal Spoke */}
            <Link
              href="/concierge"
              className="w-full bg-white rounded-2xl p-6 border-2 border-primary-500 shadow-md hover:shadow-lg hover:scale-105 transition-transform opacity-100 group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Concierge</h3>
              <p className="text-neutral-600 mb-4 text-sm leading-relaxed">Get personalized support for your Southeast Asia journey</p>
              <span className="text-primary-600 font-semibold text-sm group-hover:text-primary-700 inline-flex items-center gap-2">
                Explore Concierge
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* PHASE 4: New in Town - Featured Businesses */}
      <section className="section-padding bg-neutral-50 overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4 tracking-tight">
                New in Town
              </h2>
              <p className="text-lg text-neutral-600 font-medium">
                Support local businesses and discover top-rated services, retail, and venues in your community.
              </p>
            </div>
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-xl font-bold text-neutral-900 hover:bg-neutral-100 transition-all shadow-sm hover:shadow-md shrink-0"
            >
              Browse Directory
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {(businesses.length > 0 ? businesses : [
              {
                id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
                name: 'Danang Luxury Stays',
                slug: 'danang-luxury-stays',
                category: 'service',
                description: 'Premium property management and luxury stays in Da Nang.',
                address: '123 Vo Nguyen Giap, Da Nang',
                logo_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
                is_verified: true
              },
              {
                id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
                name: 'Hoi An Heritage stays',
                slug: 'hoi-an-heritage',
                category: 'service',
                description: 'Authentic heritage stays and cultural experiences in Hoi An.',
                address: '45 Tran Phu, Hoi An',
                logo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
                is_verified: true
              },
              {
                id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                name: 'Marble Mountains Events',
                slug: 'marble-mountains',
                category: 'venue',
                description: 'Premier event spaces and coordination in the Ngu Hanh Son area.',
                address: 'Hoa Hai, Ngu Hanh Son, Da Nang',
                logo_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
                is_verified: true
              },
              {
                id: '99999999-9999-9999-9999-999999999999',
                name: 'Dragon Bridge Tech',
                slug: 'dragon-bridge',
                category: 'service',
                description: 'Modern urban apartments and smart home services.',
                address: '88 Bach Dang, Da Nang',
                logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                is_verified: false
              }
            ]).map((biz: any) => (
              <div key={biz.id} className="group relative">
                <Link href={`/businesses/${biz.slug}`} className="block">
                  <div className="aspect-[4/5] relative rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-neutral-100">
                    {biz.logo_url ? (
                      <Image
                        src={biz.logo_url}
                        alt={biz.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-300">
                        <Building2 className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-tighter text-white rounded-md border border-white/30">
                          {biz.category}
                        </span>
                        {biz.is_verified && (
                          <ShieldCheck className="w-4 h-4 text-primary-400" />
                        )}
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-white mb-1 leading-tight group-hover:text-primary-300 transition-colors">
                        {biz.name}
                      </h3>
                      <p className="text-white/70 text-sm line-clamp-1">
                        {biz.address}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Top Stays & Spaces Elevation */}
      <section className="section-padding bg-neutral-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-br from-primary-50/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="container-custom relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-wider mb-4">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                <span>Premium Stays</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                Top Stays & <span className="text-primary-600">Spaces.</span>
              </h2>
              <p className="text-lg text-neutral-600 mt-4 leading-relaxed">
                Handpicked villas, apartments, and event venues managed by the region's top local agencies.
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-neutral-200 hover:border-primary-200 text-neutral-900 hover:text-primary-600 font-bold rounded-2xl transition-all shadow-sm hover:shadow-md group"
            >
              Browse All Properties
              <div className="w-5 h-5 group-hover:translate-x-1 transition-transform">→</div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {(properties.length > 0 ? properties : [
              {
                id: '11111111-1111-1111-1111-111111111111',
                address: 'My Khe Beach Villa',
                type: 'villa' as const,
                property_type: 'rental' as const,
                price: 2500,
                bedrooms: 4,
                bathrooms: 4,
                images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
                businesses: { name: 'Danang Luxury Stays', slug: 'danang-luxury-stays' }
              },
              {
                id: '22222222-2222-2222-2222-222222222222',
                address: 'Hoi An Riverside Studio',
                type: 'apartment' as const,
                property_type: 'rental' as const,
                price: 800,
                bedrooms: 1,
                bathrooms: 1,
                images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
                businesses: { name: 'Hoi An Heritage stays', slug: 'hoi-an-heritage' }
              },
              {
                id: '33333333-3333-3333-3333-333333333333',
                address: 'The Grand Ballroom',
                type: 'commercial' as const,
                property_type: 'event_space' as const,
                capacity: 300,
                images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'],
                businesses: { name: 'Marble Mountains Events', slug: 'marble-mountains' }
              },
              {
                id: '44444444-4444-4444-4444-444444444444',
                address: 'Penthouse with City View',
                type: 'condo' as const,
                property_type: 'rental' as const,
                price: 1800,
                bedrooms: 2,
                bathrooms: 2,
                images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
                businesses: { name: 'Dragon Bridge Tech', slug: 'dragon-bridge' }
              }
            ]).map((property: any) => (
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

      {/* PHASE 4: Cross-Platform Stats - Social Proof without the Noise */}
      <section className="section-padding bg-white border-y border-neutral-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Local Businesses', value: 'Growing', sub: 'Verified profiles' },
              { label: 'Weekly Events', value: 'Regular', sub: 'Discovery engine' },
              { label: 'Active Sellers', value: 'Expanding', sub: 'Market network' },
              { label: 'Properties', value: 'Available', sub: 'Synergy listings' },
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-xs text-neutral-500 font-medium">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QA FIX: Markets content section removed for hub independence
          REMOVED: Featured from Markets, Upcoming Market Preview, Featured Sellers, Featured Products, Markets CTA
          REASON: Hub must not depend on Markets data to maintain section independence
          RESULT: Hub is now section-agnostic and will not fail if Markets database is unavailable
          NOTE: Users can access Markets content via /markets route or section card
      */}
    </main>
  )
}
