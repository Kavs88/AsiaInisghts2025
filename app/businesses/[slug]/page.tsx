import { getBusinessBySlug } from '@/lib/actions/businesses'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Globe, Phone, Mail, Clock, CheckCircle, Calendar, ShoppingBag, Star } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { getPropertiesNearBusiness } from '@/lib/actions/properties'
import { getBusinessReviewSummary, getBusinessRecommendCount } from '@/lib/actions/businesses'
import BusinessProfileClient from './page-client'
import ReviewSummary from '@/components/ui/ReviewSummary'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

/**
 * BUSINESS PROFILE PAGE - DESIGN SYSTEM RULES
 * 
 * SPACING (8px grid):
 * - Section padding: py-12 standard (48px)
 * - Internal component padding: p-6 (24px) standard, p-8 (32px) for cards
 * - Gap scale: gap-4 (16px) mobile, gap-6 (24px) tablet, gap-8 (32px) desktop
 * - No negative margins or layout hacks
 * 
 * TYPOGRAPHY:
 * - Page title (business name): text-3xl sm:text-4xl lg:text-5xl font-bold
 * - Section headings: text-2xl sm:text-3xl lg:text-4xl font-bold
 * - Subheadings/stats: text-base sm:text-lg font-semibold
 * - Body text: text-base sm:text-lg leading-relaxed
 * - UI labels (tabs/filters): text-sm font-medium
 * 
 * CONTAINERS:
 * - Default: container mx-auto px-6 lg:px-8 max-w-7xl
 */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const resolvedParams = params instanceof Promise ? await params : params
    const business = await getBusinessBySlug(resolvedParams.slug)
    if (!business) return { title: 'Business Not Found' }
    const biz = business as any
    const description = biz.tagline || biz.description || `Discover ${biz.name} on Asia Insights`
    const image = biz.hero_image_url || biz.logo_url || null
    return {
        title: biz.name,
        description,
        openGraph: {
            title: biz.name,
            description,
            type: 'website',
            siteName: 'Asia Insights',
            ...(image && { images: [{ url: image, width: 1200, height: 630, alt: biz.name }] }),
        },
        twitter: {
            card: 'summary_large_image',
            title: biz.name,
            description,
            ...(image && { images: [image] }),
        },
    }
}

export default async function BusinessProfilePage({
    params
}: {
    params: Promise<{ slug: string }> | { slug: string }
}) {
    // Handle both Promise and direct object params (Next.js 14.2+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params
    // Data is now fetched in the server action
    const businessData = await getBusinessBySlug(resolvedParams.slug)
    if (!businessData) notFound()

    const biz = businessData as any
    const events = biz.events || []
    const products = biz.products || []
    const deals = biz.deals || []
    const activityStats = biz.activityStats || { hostedEventsCount: 0, isActiveThisMonth: false }

    const socialLinks = biz.social_links || {}
    const heroImageUrl = biz.hero_image_url || (biz.images && biz.images.length > 0 ? biz.images[0] : null)

    // Fetch nearby properties
    const nearbyProperties = biz.address ? await getPropertiesNearBusiness(biz.address, 4).catch(() => []) : []

    // Fetch review summary and recommend count in parallel
    const [reviewSummary, recommendCount] = await Promise.all([
        getBusinessReviewSummary(biz.id).catch(() => ({ averageRating: 0, totalReviews: 0 })),
        getBusinessRecommendCount(resolvedParams.slug).catch(() => 0),
    ])

    return (
        <main id="main-content" className="min-h-screen bg-white">
            {/* Breadcrumb Navigation */}
            <section className="bg-white border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <Breadcrumbs items={[
                        { label: 'Businesses', href: '/businesses' },
                        { label: biz.name, href: '' }
                    ]} />
                </div>
            </section>

            {/* Hero Banner - Immersive & Cinematic */}
            <section className="relative h-[50vh] min-h-[400px] bg-neutral-900 overflow-hidden group">
                {heroImageUrl ? (
                    <Image
                        src={heroImageUrl}
                        alt={`${biz.name} banner`}
                        fill
                        sizes="100vw"
                        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-900">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mixed-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

                {/* Layered Branding Overlay - Subtle Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <span className="text-[15vw] font-bold text-white/5 uppercase tracking-tighter select-none truncate w-full text-center transform -rotate-12 translate-y-1/4 scale-150 blur-sm">
                        {biz.name}
                    </span>
                </div>
            </section>

            {/* Identity + About + Contact — unified editorial block, always above tabs */}
            <section className="relative bg-white border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-8">

                    {/* Identity Block - Logo + Name - Overlapping Hero */}
                    <div className="flex flex-col sm:flex-row items-end gap-6 sm:gap-8 mb-8 -mt-20 sm:-mt-24 relative z-10">
                        {/* Logo - Card Style */}
                        <div className="flex-shrink-0">
                            {biz.logo_url ? (
                                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-white rounded-2xl p-2 shadow-xl border border-white/20 backdrop-blur-sm">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-100">
                                        <Image src={biz.logo_url} alt={biz.name} fill sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 176px" className="object-cover" />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-white rounded-2xl p-2 shadow-xl border border-white/20">
                                    <div className="w-full h-full bg-gradient-to-br from-primary-50 to-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100">
                                        <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-600">
                                            {biz.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Name + Badges */}
                        <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-center gap-3 mb-2">
                                {biz.is_verified && (
                                    <Badge variant="success" className="backdrop-blur-md bg-emerald-500/10 text-emerald-700 border-emerald-200/50 shadow-sm">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Verified Partner
                                    </Badge>
                                )}
                                {biz.category && (
                                    <Badge variant="neutral" className="bg-neutral-100 text-neutral-600 border-neutral-200">
                                        {biz.category}
                                    </Badge>
                                )}
                                {activityStats.isActiveThisMonth && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-[0_2px_10px_rgba(16,185,129,0.1)]">
                                        <div className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active recently</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-[0.9]">
                                {biz.name}
                            </h1>
                        </div>
                    </div>

                    {/* Tagline + Review + Quick Stats */}
                    <div className="mb-8">
                        {biz.tagline && (
                            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed mb-4 max-w-2xl font-medium">
                                {biz.tagline}
                            </p>
                        )}
                        {reviewSummary && reviewSummary.totalReviews > 0 && (
                            <div className="mb-4">
                                <ReviewSummary
                                    averageRating={reviewSummary.averageRating}
                                    totalReviews={reviewSummary.totalReviews}
                                    size="md"
                                />
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4">
                            {recommendCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-bold text-neutral-900">
                                        Recommended by {recommendCount} member{recommendCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                            {products.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-primary-600" />
                                    <span className="text-sm font-bold text-neutral-900">{products.length} Products</span>
                                </div>
                            )}
                            {events.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-success-600" />
                                    <span className="text-sm font-bold text-success-700">{events.length} Upcoming Events</span>
                                </div>
                            )}
                            {activityStats.hostedEventsCount > 0 && (
                                <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                                    <CheckCircle className="w-4 h-4 text-primary-600" />
                                    Hosted {activityStats.hostedEventsCount} event{activityStats.hostedEventsCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Editorial 2-column: About (left) + Contact sidebar (right) — visible before tabs */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                        {/* Left col: About description + delivery options */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-4 tracking-tight">
                                    About {biz.name}
                                </h2>
                                <div className="text-base lg:text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                                    {biz.description || 'No description provided.'}
                                </div>
                            </div>

                            {(biz.delivery_available || biz.pickup_available) && (
                                <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 flex flex-wrap gap-3">
                                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-neutral-100 flex-shrink-0">
                                        <ShoppingBag className="w-4 h-4 text-neutral-700" />
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {biz.delivery_available && (
                                            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700 bg-white px-3 py-1.5 rounded-xl border border-neutral-100 shadow-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                Delivery Available
                                            </span>
                                        )}
                                        {biz.pickup_available && (
                                            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700 bg-white px-3 py-1.5 rounded-xl border border-neutral-100 shadow-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                                                Pickup Available
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right col: Sticky Contact card + Events preview */}
                        <div className="space-y-6 lg:sticky lg:top-32 h-fit">
                            {/* Contact Card */}
                            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-md hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                                    <span className="w-8 h-1 bg-primary-600 rounded-full inline-block"></span>
                                    Connect
                                </h3>
                                <div className="space-y-5">
                                    {biz.website_url && (
                                        <a href={biz.website_url} target="_blank" rel="noopener" className="flex items-center gap-4 text-neutral-900 hover:text-primary-600 font-bold group transition-colors">
                                            <div className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors flex-shrink-0">
                                                <Globe className="w-5 h-5 text-neutral-400 group-hover:text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">Website</span>
                                                <span className="block truncate">Visit Page</span>
                                            </div>
                                        </a>
                                    )}
                                    {biz.contact_phone && (
                                        <a href={`tel:${biz.contact_phone}`} className="flex items-center gap-4 text-neutral-900 hover:text-primary-600 font-semibold group transition-colors">
                                            <div className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors flex-shrink-0">
                                                <Phone className="w-5 h-5 text-neutral-400 group-hover:text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">Phone</span>
                                                <span className="block truncate">{biz.contact_phone}</span>
                                            </div>
                                        </a>
                                    )}
                                    {biz.contact_email && (
                                        <a href={`mailto:${biz.contact_email}?subject=${encodeURIComponent(`Inquiry via Asia Insights`)}&body=${encodeURIComponent(`Hi,\n\nI found you on Asia Insights and wanted to ask about...`)}`} className="flex items-center gap-4 text-neutral-900 hover:text-primary-600 font-semibold group transition-colors">
                                            <div className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors flex-shrink-0">
                                                <Mail className="w-5 h-5 text-neutral-400 group-hover:text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">Email</span>
                                                <span className="block truncate">{biz.contact_email}</span>
                                            </div>
                                        </a>
                                    )}
                                </div>

                                <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
                                    <Link href="/concierge" className="inline-block text-sm font-semibold text-neutral-500 hover:text-primary-600 transition-colors">
                                        Need integrated support? Contact Concierge.
                                    </Link>
                                </div>

                                {biz.opening_hours && typeof biz.opening_hours === 'object' && !Array.isArray(biz.opening_hours) && (
                                    <div className="mt-8 pt-6 border-t border-dashed border-neutral-200">
                                        <div className="flex items-center gap-2 mb-4 text-neutral-900 font-bold text-sm">
                                            <Clock className="w-4 h-4 text-primary-600" />
                                            Opening Hours
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(biz.opening_hours as object || {}).map(([day, hours]) => (
                                                <div key={day} className="flex justify-between items-center text-sm">
                                                    <span className="capitalize font-medium text-neutral-500 w-24">{day}</span>
                                                    <span className="font-bold text-neutral-900 text-right flex-1">{String(hours)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Events Preview */}
                            {events.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-base font-bold text-neutral-900 px-1">Upcoming Events</h3>
                                    {events.slice(0, 3).map((event: any) => (
                                        <Link key={event.id} href={`/markets/events/${event.id}`} className="block p-4 bg-white border border-neutral-200 rounded-2xl hover:border-primary-200 hover:shadow-xl transition-all group">
                                            <div className="flex gap-3">
                                                <div className="w-11 h-11 bg-primary-50 rounded-xl flex flex-col items-center justify-center text-primary-600 shrink-0 group-hover:bg-primary-100 transition-colors">
                                                    <span className="text-[9px] font-bold uppercase leading-none">{new Date(event.start_at).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-base font-bold leading-none">{new Date(event.start_at).getDate()}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors text-sm">{event.title}</h4>
                                                    <p className="text-xs text-neutral-500 mt-0.5">{new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* BusinessProfileClient — full-width sibling: action buttons + sticky tab nav + tab content */}
            <BusinessProfileClient
                business={biz}
                products={products}
                events={events}
                deals={deals}
                nearbyProperties={nearbyProperties}
                contact_phone={biz.contact_phone}
                contact_email={biz.contact_email}
                entityId={biz.entity_id || null}
            />
        </main>
    )
}
