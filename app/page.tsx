import Link from 'next/link'
import Image from 'next/image'
import HeroSearchBar from '@/components/ui/HeroSearchBar'
import { ShieldCheck, Building2 } from 'lucide-react'
import { getBusinesses } from '@/lib/actions/businesses'
import { getProperties } from '@/lib/actions/properties'
import { getUpcomingMarketDays } from '@/lib/supabase/queries'
import PropertyCard from '@/components/ui/PropertyCard'

import { Suspense } from 'react'
import { GridSkeleton } from '@/components/ui/LoadingSkeleton'

// QA FIX: Hub → Markets Decoupling
// REMOVED: Direct Markets data fetching (getVendors, getProducts, getUpcomingMarketDays)
// QA FIX: Hub → Markets Decoupling
// REASON: Hub must not depend on Markets internals to maintain section independence
// NOTE: Forcing HMR update

async function FeaturedBusinesses() {
  const businesses = await getBusinesses({ limit: 3, featuredOnly: true })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {businesses.length > 0 || true ? (
        <>
          {businesses.map((biz: any) => (
            <div key={biz.id} className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-neutral-100 h-full aspect-[4/3]">
              {/* Absolute Link Overlay */}
              <Link
                href={`/businesses/${biz.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`View ${biz.name}`}
              />

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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
              <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 z-20 pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-tighter text-white rounded-md border border-white/30">
                    {biz.category}
                  </span>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-white mb-1 leading-tight group-hover:text-primary-300 transition-colors">
                  {biz.name}
                </h3>
                <p className="text-white/70 text-sm line-clamp-1">
                  {biz.address}
                </p>
              </div>
            </div>
          ))}

          {/* Premium Access Point - Concierge */}
          <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-neutral-900 h-full aspect-[4/3]">
            <Link
              href="/concierge"
              className="absolute inset-0 z-10"
              aria-label="Asia Insights Concierge"
            />
            <div className="absolute inset-0 bg-neutral-900 z-0" />
            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="w-24 h-24 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
            <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 z-20 pointer-events-none">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-tighter text-white rounded-md border border-white/30">
                  Premium Support
                </span>
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-white mb-1 leading-tight group-hover:text-primary-300 transition-colors">
                Asia Insights Concierge
              </h3>
              <p className="text-white/70 text-sm line-clamp-1">
                Let our Concierge handle the details.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="col-span-full text-center py-12 bg-neutral-50 rounded-3xl border border-neutral-100 border-dashed">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-neutral-100">
            <Building2 className="w-8 h-8 text-neutral-300" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">New businesses coming soon</h3>
          <p className="text-neutral-500 max-w-md mx-auto">
            We are currently onboarding trusted local businesses. Check back shortly for our curated selection of new spots in town.
          </p>
        </div>
      )}
    </div>
  )
}

async function FeaturedProperties() {
  const properties = await getProperties({ limit: 4, featuredOnly: true })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.length > 0 ? (
        properties.map((property: any) => (
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
        ))
      ) : (
        <div className="col-span-full text-center py-12 bg-white/50 rounded-3xl border border-neutral-200 border-dashed backdrop-blur-sm">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-neutral-100">
            <Building2 className="w-8 h-8 text-neutral-300" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">Premium stays coming soon</h3>
          <p className="text-neutral-500 max-w-md mx-auto">
            Our partners are currently listing their best properties. Check back shortly for our collection of villas and event spaces.
          </p>
        </div>
      )}
    </div>
  )
}

export default async function Home() {
  // Fetch non-blocking UI data (markets cache hit)
  const upcomingMarkets = await getUpcomingMarketDays(1).catch((): any[] => [])

  const nextMarket = upcomingMarkets?.[0] ?? null
  const nextMarketDate = nextMarket?.market_date
    ? new Date(nextMarket.market_date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : null

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* PHASE 1: Platform Identity Hero Section */}
      <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center bg-neutral-900 overflow-hidden py-16 lg:py-24">
        {/* Large Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/Stalls 6.jpg"
            alt="Asia Insights"
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          {/* Cinema Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-neutral-900/20 z-0" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full mt-12 sm:mt-0">
          <div className="max-w-4xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 sm:mb-10 leading-[0.9] tracking-tighter drop-shadow-xl">
              Find trusted local <span className="text-primary-400">services</span> & <span className="text-secondary-400">events.</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-neutral-200 mb-10 sm:mb-12 leading-relaxed max-w-2xl font-medium drop-shadow-md">
              Your bridge to the best people and places in Southeast Asia.
            </p>
            {/* PHASE 7: Reduced CTA - One primary action to reduce decision fatigue */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 sm:mb-14">
              <a
                href="#explore-asia-insights"
                className="inline-flex items-center justify-center px-10 py-5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-primary-600/30 text-lg hover:-translate-y-1"
              >
                Explore What's Nearby
              </a>
            </div>
            <div className="lg:max-w-xl relative z-10">
              <HeroSearchBar helperText="Try: coworking, visa agent, Thai restaurant" />
            </div>
          </div>
        </div>
      </section>

      {/* Next Market Widget - Dark Mode for Contrast */}
      {nextMarketDate && (
        <section className="bg-neutral-900 border-t border-neutral-800 relative z-30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <Link
              href="/markets/market-days"
              className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 group"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 transition-colors duration-300 border border-white/10 group-hover:border-primary-500">
                  <svg className="w-6 h-6 text-white group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary-900/50 text-primary-400 border border-primary-900/50 uppercase tracking-wider">
                      Next Market
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white group-hover:text-primary-400 transition-colors">{nextMarketDate}</div>
                  {nextMarket?.location_name && (
                    <div className="text-base text-neutral-400 font-medium group-hover:text-neutral-300">{nextMarket.location_name}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-white font-bold text-base px-6 py-3 rounded-xl border border-white/10 bg-white/5 group-hover:bg-white/10 group-hover:border-primary-500/30 transition-all">
                <span>View Details</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Why Trust Us - Human Connection */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Sam's Photo */}
              <div className="relative order-2 lg:order-1">
                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 relative max-w-md mx-auto lg:mx-0">
                  <Image
                    src="/images/team/SNM.jpg"
                    alt="Sam - Founder of Asia Insights"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 border-[6px] border-white/20 rounded-[2.5rem] pointer-events-none" />
                </div>
                {/* Decorative element */}

              </div>

              {/* Story */}
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 mb-6 lg:mb-8 tracking-tight">
                  Why Trust <br className="hidden lg:block" /><span className="text-primary-600">Asia Insights?</span>
                </h2>
                <div className="prose prose-lg prose-neutral mb-8">
                  <p className="text-xl text-neutral-600 leading-relaxed font-medium">
                    "I moved to South East Asia in 2024 and built this platform to help others do the same.
                    We're not a faceless corporation — we're expats who've walked this path."
                  </p>
                </div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden relative">
                    <Image src="/images/team/SNM.jpg" alt="Sam" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">Sam Kavanagh</div>
                    <div className="text-sm text-neutral-500 font-medium">Founder, Asia Insights</div>
                  </div>
                </div>

                <div className="space-y-5 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-1">7+ years of local expertise</h4>
                      <p className="text-neutral-600">Deep validated knowledge of Southeast Asia.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-1">Verified local businesses</h4>
                      <p className="text-neutral-600">We personally vet every partner on our platform.</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/meet-the-team"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Meet Our Team
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 2: Directory Overview */}
      <section id="explore-asia-insights" className="py-12 bg-neutral-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 mb-4 tracking-tight">
              Explore Asia Insights
            </h2>
            <p className="text-lg text-neutral-600 font-medium max-w-2xl">
              A curated directory of the best spaces, services, and events in Southeast Asia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Stays */}
            <Link
              href="/properties"
              className="lg:col-span-2 flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-neutral-200/60 hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 group min-h-[520px]"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-all duration-500 shrink-0">
                <svg className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">Find a Stay</h4>
              <p className="text-neutral-600 text-base leading-relaxed font-medium mb-8 grow">Vetted apartments, villas, and co-living spaces for your first 30 days.</p>
              <span className="text-sm font-bold text-primary-600 flex items-center gap-2 mt-auto">
                Browse Stays <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>

            {/* Relocation Services */}
            <Link
              href="/concierge"
              className="lg:col-span-2 flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-neutral-200/60 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 group min-h-[520px]"
            >
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-all duration-500 shrink-0">
                <svg className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-neutral-900 mb-3 group-hover:text-amber-500 transition-colors">Relocation Services</h4>
              <p className="text-neutral-600 text-base leading-relaxed font-medium mb-8 grow">Expert guidance for moving to, settling in, and navigating life in Vietnam.</p>
              <span className="text-sm font-bold text-amber-600 flex items-center gap-2 mt-auto">
                Get Support <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>

            {/* Essentials */}
            <Link
              href="/businesses"
              className="lg:col-span-2 flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-neutral-200/60 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group min-h-[520px]"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-all duration-500 shrink-0">
                <svg className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-neutral-900 mb-3 group-hover:text-blue-600 transition-colors">Local Essentials</h4>
              <p className="text-neutral-600 text-base leading-relaxed font-medium mb-6 grow">Banking, high-speed internet, legal advice, and visa support.</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">Visa</span>
                <span className="px-3 py-1 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">Legal</span>
              </div>
              <span className="text-sm font-bold text-blue-600 flex items-center gap-2 mt-auto">
                Browse Directory <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>

            {/* Events */}
            <Link
              href="/markets/discovery"
              className="lg:col-span-2 lg:col-start-2 flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-neutral-200/60 hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 group min-h-[520px]"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-all duration-500 shrink-0">
                <svg className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">Local Events</h4>
              <p className="text-neutral-600 text-base leading-relaxed font-medium mb-8 grow">Discover festivals, workshops, and gatherings happening this week.</p>
              <span className="text-sm font-bold text-primary-600 flex items-center gap-2 mt-auto">
                Explore Events <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>

            {/* Markets */}
            <Link
              href="/markets"
              className="lg:col-span-2 flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-neutral-200/60 hover:shadow-xl hover:border-green-200 hover:-translate-y-1 transition-all duration-300 group min-h-[520px]"
            >
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-all duration-500 shrink-0">
                <svg className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-neutral-900 mb-3 group-hover:text-green-600 transition-colors">Sunday Markets</h4>
              <p className="text-neutral-600 text-base leading-relaxed font-medium mb-8 grow">Our flagship community gatherings. Shop local, meet the makers.</p>
              <span className="text-sm font-bold text-green-600 flex items-center gap-2 mt-auto">
                View Schedule <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* PHASE 4: New in Town - Featured Businesses */}
      <section className="py-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4 tracking-tight">
                Vetted Listings
              </h2>
              <p className="text-lg text-neutral-600 font-medium">
                Handpicked businesses and services that meet our standards for quality and local expertise.
              </p>
            </div>
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-xl font-bold text-neutral-900 hover:bg-neutral-100 transition-all shadow-sm hover:shadow-md shrink-0"
            >
              Browse Directory
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <Suspense fallback={<GridSkeleton count={4} columns={4} />}>
            <FeaturedBusinesses />
          </Suspense>
        </div>
      </section>

      {/* NEW: Top Stays & Spaces Elevation */}
      <section className="py-12 bg-neutral-50 relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-wider mb-4">
                <ShieldCheck className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                <span>Premium Stays</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                Curated <span className="text-primary-600">Spaces.</span>
              </h2>
              <p className="text-lg text-neutral-600 mt-4 leading-relaxed">
                Premium villas, apartments, and venues vetted for reliability and exceptional experience.
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

          <Suspense fallback={<GridSkeleton count={4} columns={4} />}>
            <FeaturedProperties />
          </Suspense>
        </div>
      </section>



      {/* QA FIX: Markets content section removed for hub independence
          REMOVED: Featured from Markets, Upcoming Market Preview, Featured Sellers, Featured Products, Markets CTA
          REASON: Hub must not depend on Markets data to maintain section independence
          RESULT: Hub is now section-agnostic and will not fail if Markets database is unavailable
          NOTE: Users can access Markets content via /markets route or section card
      */}
    </main >
  )
}
