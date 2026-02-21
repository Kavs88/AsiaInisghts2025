import Image from 'next/image'
import Link from 'next/link'
import { getVendorBySlug, getVendorProducts, getVendorPortfolio, getVendorNextMarketAttendance } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import SellerProfileClient from './page-client'
import ShareButton from '@/components/ui/ShareButton'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'

/**
 * SELLER PROFILE PAGE - DESIGN SYSTEM RULES
 * 
 * SPACING (8px grid):
 * - Section padding: py-12 sm:py-16 lg:py-20 (48px/64px/80px)
 * - Internal component padding: p-6 (24px) standard, p-8 (32px) for cards
 * - Gap scale: gap-4 (16px) mobile, gap-6 (24px) tablet, gap-8 (32px) desktop
 * - No negative margins or layout hacks
 * 
 * TYPOGRAPHY:
 * - Page title (seller name): text-3xl sm:text-4xl lg:text-5xl font-bold
 * - Section headings: text-2xl sm:text-3xl lg:text-4xl font-bold
 * - Subheadings/stats: text-base sm:text-lg font-semibold
 * - Body text: text-base sm:text-lg leading-relaxed
 * - UI labels (tabs/filters): text-sm font-medium
 * 
 * CONTAINERS:
 * - Default: container-custom max-w-6xl (1152px)
 * - Wide content (products grid): max-w-7xl (1280px)
 * - Narrow content (policies): max-w-5xl (1024px) - only when justified
 */

interface SellerProfilePageProps {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function generateMetadata({ params }: SellerProfilePageProps) {
  const resolvedParams = params instanceof Promise ? await params : params
  try {
    const vendor = await getVendorBySlug(resolvedParams.slug) as any
    if (!vendor) return { title: 'Sunday Market' }
    return {
      title: `${vendor.name} - Sunday Market`,
      description: vendor.short_tagline || vendor.bio || `View products and portfolio from ${vendor.name}`,
    }
  } catch (error) {
    const resolvedParams = params instanceof Promise ? await params : params
    return {
      title: `${resolvedParams.slug} - Sunday Market`,
      description: `View products and portfolio from ${resolvedParams.slug}`,
    }
  }
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  // Handle both Promise and direct object params (Next.js 14.2+ compatibility)
  const resolvedParams = params instanceof Promise ? await params : params

  // Fetch real data from Supabase
  let vendor: any = null
  let products: any[] = []
  let portfolioItems: any[] = []
  let marketAttendance: any = null
  let events: any[] = []
  let deals: any[] = []
  let activityData: any = { pastMarkets: 0, totalEvents: 0, isActiveThisMonth: false }

  try {
    vendor = await getVendorBySlug(resolvedParams.slug)
    if (!vendor) {
      notFound()
    }

    // Get supabase client first
    const supabase = await createClient()
    if (!supabase) return notFound()

    // Fetch products, portfolio, market attendance, events, deals, and activity stats in parallel
    const [vendorProducts, portfolio, attendance, vendorEvents, vendorDeals, activityStats] = await Promise.all([
      getVendorProducts(vendor.id),
      getVendorPortfolio(vendor.id).catch(() => []),
      getVendorNextMarketAttendance(vendor.id).catch(() => null),
      // Fetch published/upcoming events for this vendor
      (supabase
        .from('events') as any)
        .select('*')
        .or(`vendor_id.eq.${vendor.id},and(host_id.eq.${vendor.id},host_type.eq.vendor)`)
        .eq('status', 'published')
        .gte('end_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .then(({ data }: any) => data || [])
        .catch(() => []),
      // Fetch active deals for this vendor
      (supabase
        .from('deals') as any)
        .select('*')
        .eq('vendor_id', vendor.id)
        .eq('status', 'active')
        .gte('valid_to', new Date().toISOString())
        .order('valid_to', { ascending: true })
        .then(({ data }: any) => data || [])
        .catch(() => []),
      // Get activity stats for signals
      (supabase
        .from('market_stalls') as any)
        .select('market_day_id, market_days!inner(market_date)', { count: 'exact', head: false })
        .eq('vendor_id', vendor.id)
        .then(async ({ data, count }: any) => {
          const pastMarkets = data?.filter((stall: any) =>
            new Date(stall.market_days.market_date) < new Date()
          ).length || 0
          const totalEvents = await (supabase
            .from('events') as any)
            .select('id', { count: 'exact', head: true })
            .or(`vendor_id.eq.${vendor.id},and(host_id.eq.${vendor.id},host_type.eq.vendor)`)
            .then(({ count }: any) => count || 0)
          return {
            pastMarkets,
            totalEvents,
            isActiveThisMonth: pastMarkets > 0 || totalEvents > 0
          }
        })
        .catch(() => ({ pastMarkets: 0, totalEvents: 0, isActiveThisMonth: false })),
    ])

    products = vendorProducts || []
    portfolioItems = portfolio || []
    marketAttendance = attendance
    events = vendorEvents || []
    deals = vendorDeals || []

    // Activity stats for signals
    activityData = activityStats || { pastMarkets: 0, totalEvents: 0, isActiveThisMonth: false }
  } catch (error) {
    console.error('Error fetching seller data:', error)
    notFound()
  }

  // Map vendor data
  const mappedVendor = {
    id: vendor.id,
    name: vendor.name,
    slug: vendor.slug,
    tagline: vendor.short_tagline || vendor.tagline,
    bio: vendor.bio,
    logoUrl: vendor.logo_url,
    heroImageUrl: vendor.hero_image_url,
    category: vendor.category,
    isVerified: vendor.is_verified || vendor.verified,
    deliveryAvailable: vendor.delivery_available,
    pickupAvailable: vendor.pickup_available,
    contactEmail: vendor.contact_email,
    contactPhone: vendor.contact_phone,
    websiteUrl: vendor.website_url || (vendor.social_links?.website ? `https://${vendor.social_links.website}` : null),
    instagramHandle: vendor.social_links?.instagram || null,
    attendingStatus: marketAttendance?.attendanceStatus || (vendor.delivery_available && !vendor.pickup_available ? 'delivery-only' as const : undefined),
    tier: vendor.vendor_tiers?.name || 'Standard',
    nextMarketStall: marketAttendance?.stall?.stall_number,
    nextMarketDate: marketAttendance?.marketDay?.market_date,
    // Activity signals
    pastMarketsCount: activityData.pastMarkets,
    hostedEventsCount: activityData.totalEvents,
    isActiveThisMonth: activityData.isActiveThisMonth,
  }

  // Map products data
  const mappedProducts = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: parseFloat(p.price),
    compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
    imageUrl: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : null,
    vendorName: mappedVendor.name,
    vendorSlug: mappedVendor.slug,
    stockQuantity: p.stock_quantity || 0,
    isAvailable: p.is_available,
    requiresPreorder: p.requires_preorder,
    preorderLeadDays: p.preorder_lead_days,
    category: p.category,
    tags: p.tags || [],
  }))

  // Map portfolio items
  const mappedPortfolio = portfolioItems.map((item: any) => ({
    id: item.id,
    imageUrl: item.image_url,
    title: item.title || item.description || 'Portfolio Item',
  }))

  // Extract unique categories and tags from products
  const productCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  const productTags = Array.from(new Set(products.flatMap(p => p.tags || []).filter(Boolean)))

  // Check if current user owns this profile
  let isOwnProfile = false
  try {
    const supabase = await createClient()
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && vendor.user_id === session.user.id) {
        isOwnProfile = true
      }
    }
  } catch (error) {
    // Silently fail - user just won't see edit button
    console.error('Error checking profile ownership:', error)
  }

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Breadcrumb Navigation - Normalized spacing */}
      <section className="bg-white border-b border-neutral-100 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-neutral-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {/* REDIRECT: Updated from /sellers to /markets/sellers */}
            <Link href="/markets/sellers" className="hover:text-neutral-900 transition-colors">
              Sellers
            </Link>
            <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-neutral-900 font-medium">{mappedVendor.name}</span>
          </nav>
        </div>
      </section>

      {/* Shop Banner - Uplifted Fallback */}
      <section className="relative h-64 sm:h-72 lg:h-80 bg-neutral-950 overflow-hidden">
        {mappedVendor.heroImageUrl ? (
          <Image
            src={mappedVendor.heroImageUrl}
            alt={`${mappedVendor.name} shop banner`}
            fill
            className="object-cover opacity-60"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Layered Branding Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <span className="text-[20vw] font-black text-white uppercase tracking-tighter select-none">
            {mappedVendor.name}
          </span>
        </div>
      </section>

      {/* Shop Header - Inline identity block */}
      <section className="relative bg-white border-b border-neutral-100">
        <div className="pt-12 sm:pt-16 lg:pt-20 pb-12">
          {/* Vendor Info - Inside container-custom */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Identity Block - Logo + Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
              {/* Logo + Name Row */}
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-1 min-w-0">
                {/* Logo - Inline, not overlapping */}
                <div className="flex-shrink-0">
                  {mappedVendor.logoUrl ? (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-xl p-1.5 shadow-md border-2 border-neutral-200">
                      <Image
                        src={mappedVendor.logoUrl}
                        alt={`${mappedVendor.name} profile`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                      />
                    </div>
                  ) : (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center shadow-md border-2 border-neutral-200">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-600">
                        {mappedVendor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name + Verified Badge - Center-aligned with logo */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 tracking-tight leading-tight truncate">
                    {mappedVendor.name}
                  </h1>
                  {mappedVendor.isVerified && (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* GUARDRAIL: Action Buttons MUST be outside container-custom. Why: container-custom has overflow-x: hidden which clips buttons on mobile. DO NOT: Move buttons inside container-custom or remove overflow-x: hidden. Test: Verify buttons fully visible on 320px-375px mobile widths. */}
          <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-6">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
              {/* Edit Profile Button - Only visible to seller */}
              {isOwnProfile && (
                <Link
                  href="/markets/vendor/profile/edit"
                  className="flex items-center justify-center gap-0 sm:gap-2 p-0 sm:px-4 sm:py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg border border-neutral-200 transition-colors h-11 min-w-[44px] flex-1 sm:h-auto sm:w-auto sm:min-w-[auto] sm:flex-none whitespace-nowrap"
                  aria-label="Edit profile"
                >
                  <svg className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit Profile</span>
                </Link>
              )}
              {mappedVendor.contactPhone && (
                <a
                  href={`tel:${mappedVendor.contactPhone}`}
                  className="flex items-center justify-center gap-0 sm:gap-2 p-0 sm:px-5 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md h-11 min-w-[44px] flex-1 sm:h-auto sm:w-auto sm:min-w-[auto] sm:flex-none whitespace-nowrap"
                  aria-label="Call seller"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="hidden sm:inline">Contact</span>
                </a>
              )}
              {mappedVendor.contactEmail && (
                <a
                  href={`mailto:${mappedVendor.contactEmail}`}
                  className="flex items-center justify-center gap-0 sm:gap-2 p-0 sm:px-5 sm:py-3 bg-white hover:bg-neutral-50 text-neutral-700 text-sm sm:text-base font-semibold rounded-xl border border-neutral-200 transition-colors shadow-sm hover:shadow-md h-11 min-w-[44px] flex-1 sm:h-auto sm:w-auto sm:min-w-[auto] sm:flex-none whitespace-nowrap"
                  aria-label="Email seller"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Email</span>
                </a>
              )}
              <ShareButton name={mappedVendor.name} type="vendor" />
            </div>
          </div>

          {/* Tagline and Stats - Back inside container-custom */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Tagline - Below name row */}
            {mappedVendor.tagline && (
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-4">
                {mappedVendor.tagline}
              </p>
            )}

            {/* Stats Row - Clean horizontal layout */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-base sm:text-lg font-semibold text-neutral-900">{products.length}</span>
                <span className="text-base sm:text-lg text-neutral-600">Products</span>
              </div>
              {mappedVendor.attendingStatus === 'attending' && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-base sm:text-lg font-semibold text-success-700">Attending</span>
                </div>
              )}
              {mappedVendor.category && (
                <Badge variant="primary">{mappedVendor.category}</Badge>
              )}
            </div>

            {/* Activity Signals - Subtle, non-gamified indicators */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 mb-4">
              {mappedVendor.nextMarketDate && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Attending next market on {new Date(mappedVendor.nextMarketDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {mappedVendor.hostedEventsCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Hosted {mappedVendor.hostedEventsCount} event{mappedVendor.hostedEventsCount !== 1 ? 's' : ''}
                </span>
              )}
              {mappedVendor.isActiveThisMonth && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Active this month
                </span>
              )}
            </div>

            {/* Social Links - Subtle, below stats */}
            {(mappedVendor.websiteUrl || mappedVendor.instagramHandle) && (
              <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                {mappedVendor.websiteUrl && (
                  <a
                    href={mappedVendor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-primary-600 transition-colors p-2"
                    aria-label="Visit website"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                )}
                {mappedVendor.instagramHandle && (
                  <a
                    href={`https://instagram.com/${mappedVendor.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-primary-600 transition-colors p-2"
                    aria-label="Visit Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Market Participation - Only show if attending */}
      {mappedVendor.nextMarketDate && (
        <section className="py-8 bg-primary-50 border-y border-primary-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-primary-600">Next Market</div>
                  <div className="text-lg sm:text-xl font-bold text-neutral-900">
                    {new Date(mappedVendor.nextMarketDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {mappedVendor.nextMarketStall && (
                      <span className="ml-2 text-sm font-normal text-neutral-600">• Stall {mappedVendor.nextMarketStall}</span>
                    )}
                  </div>
                </div>
              </div>
              <Link
                href="/markets/market-days"
                className="flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
              >
                <span>View Market Days</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section - Only show if bio exists */}
      {mappedVendor.bio && (
        <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Image Holder */}
              <div className="lg:col-span-4">
                <div className="sticky top-24">
                  <div className="relative aspect-square bg-neutral-50 rounded-2xl overflow-hidden shadow-md">
                    {mappedVendor.logoUrl ? (
                      <Image
                        src={mappedVendor.logoUrl}
                        alt={`${mappedVendor.name} - About`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                        <div className="text-center p-8">
                          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                            <span className="text-5xl font-black text-primary-600">
                              {mappedVendor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-neutral-500 text-sm font-medium">About {mappedVendor.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* About Content - Typography scale */}
              <div className="lg:col-span-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">
                      About {mappedVendor.name}
                    </h2>
                    <div className="text-base sm:text-lg text-neutral-700 leading-relaxed whitespace-pre-line max-w-3xl">
                      {mappedVendor.bio}
                    </div>
                  </div>

                  {/* Additional Info Cards - Standard gap scale, standard padding */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    {/* Delivery Options */}
                    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        Delivery Options
                      </h3>
                      <div className="space-y-3">
                        {mappedVendor.deliveryAvailable && (
                          <div className="flex items-center gap-3 text-neutral-700">
                            <svg className="w-5 h-5 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-base font-medium">Delivery Available</span>
                          </div>
                        )}
                        {mappedVendor.pickupAvailable && (
                          <div className="flex items-center gap-3 text-neutral-700">
                            <svg className="w-5 h-5 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-base font-medium">Pickup Available</span>
                          </div>
                        )}
                        {!mappedVendor.deliveryAvailable && !mappedVendor.pickupAvailable && (
                          <p className="text-sm text-neutral-500">Contact for delivery options</p>
                        )}
                      </div>
                    </div>

                    {/* Market Attendance */}
                    {mappedVendor.attendingStatus === 'attending' && mappedVendor.nextMarketDate && (
                      <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          Next Market
                        </h3>
                        <div className="space-y-2 text-neutral-700">
                          <p className="font-bold text-lg sm:text-xl">
                            {new Date(mappedVendor.nextMarketDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          {mappedVendor.nextMarketStall && (
                            <p className="text-base text-neutral-600">Stall #{mappedVendor.nextMarketStall}</p>
                          )}
                          {/* REDIRECT: Updated from /market-days to /markets/market-days */}
                          <Link
                            href="/markets/market-days"
                            className="inline-flex items-center gap-2 mt-2 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                          >
                            View all market days
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <SellerProfileClient
        vendor={mappedVendor}
        products={mappedProducts}
        portfolio={mappedPortfolio}
        productCategories={productCategories}
        productTags={productTags}
        events={events}
        deals={deals}
        pastMarketsCount={mappedVendor.pastMarketsCount}
      />
    </main>
  )
}


