import { getBusinessBySlug } from '@/lib/actions/businesses'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Globe, Phone, Mail, Clock, CheckCircle, Calendar, ShoppingBag } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { getPropertiesNearBusiness } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import BusinessProfileClient from './page-client'
import ReviewsSection from '@/components/ui/ReviewsSection'
import ReviewSummary from '@/components/ui/ReviewSummary'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

/**
 * BUSINESS PROFILE PAGE - DESIGN SYSTEM RULES
 * 
 * SPACING (8px grid):
 * - Section padding: py-12 sm:py-16 lg:py-20 (48px/64px/80px)
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
 * - Default: container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl
 */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const resolvedParams = params instanceof Promise ? await params : params
    const business = await getBusinessBySlug(resolvedParams.slug)
    if (!business) return { title: 'Business Not Found' }
    const biz = business as any
    return {
        title: `${biz.name} | AI Markets`,
        description: biz.tagline || biz.description,
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

    // Fetch review summary
    let reviewSummary = null
    try {
        const supabase = await createClient()
        if (supabase) {
            const { data } = await (supabase
                .from('review_summaries') as any)
                .select('*')
                .eq('subject_id', biz.id)
                .eq('subject_type', 'business')
                .maybeSingle() as any

            if (data) {
                reviewSummary = {
                    averageRating: parseFloat(data.average_rating || '0'),
                    totalReviews: data.total_reviews || 0
                }
            } else {
                reviewSummary = {
                    averageRating: 0,
                    totalReviews: 0
                }
            }
        }
    } catch (error) {
        console.error('Error fetching review summary:', error)
        reviewSummary = {
            averageRating: 0,
            totalReviews: 0
        }
    }

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
                    <span className="text-[15vw] font-black text-white/5 uppercase tracking-tighter select-none truncate w-full text-center transform -rotate-12 translate-y-1/4 scale-150 blur-sm">
                        {biz.name}
                    </span>
                </div>
            </section>

            {/* Shop Header - Inline identity block */}
            <section className="relative bg-white border-b border-neutral-100">
                <div className="pt-12 sm:pt-16 lg:pt-20 pb-12">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        {/* Identity Block - Logo + Name - Overlapping Hero */}
                        <div className="flex flex-col sm:flex-row items-end gap-6 sm:gap-8 mb-8 -mt-20 sm:-mt-24 relative z-10">
                            {/* Logo - Card Style */}
                            <div className="flex-shrink-0">
                                {biz.logo_url ? (
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-white rounded-2xl p-2 shadow-xl border border-white/20 backdrop-blur-sm">
                                        <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-100">
                                            <Image src={biz.logo_url} alt={biz.name} fill className="object-cover" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-white rounded-2xl p-2 shadow-xl border border-white/20">
                                        <div className="w-full h-full bg-gradient-to-br from-primary-50 to-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100">
                                            <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary-600">
                                                {biz.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Name + Verified Badge */}
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
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[0.9]">
                                    {biz.name}
                                </h1>
                            </div>
                        </div>

                        {/* Action Buttons & Tabbed Content */}
                        <div className="mb-6">
                            <BusinessProfileClient
                                business={biz}
                                products={products}
                                events={events}
                                deals={deals}
                                nearbyProperties={nearbyProperties}
                                contact_phone={biz.contact_phone}
                                contact_email={biz.contact_email}
                            />
                        </div>

                        {/* Tagline and Stats - Keep in Header for visibility */}
                        <div>
                            {biz.tagline && (
                                <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-4">
                                    {biz.tagline}
                                </p>
                            )}
                            {/* Review Summary - Trust Signal */}
                            {reviewSummary && reviewSummary.totalReviews > 0 && (
                                <div className="mb-4">
                                    <ReviewSummary
                                        averageRating={reviewSummary.averageRating}
                                        totalReviews={reviewSummary.totalReviews}
                                        size="md"
                                    />
                                </div>
                            )}
                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                                    <span className="text-base sm:text-lg font-semibold text-neutral-900">{products.length}</span>
                                    <span className="text-base sm:text-lg text-neutral-600">Products</span>
                                </div>
                                {events.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-success-600" />
                                        <span className="text-base sm:text-lg font-semibold text-success-700">{events.length}</span>
                                        <span className="text-base sm:text-lg text-success-700">Upcoming Events</span>
                                    </div>
                                )}
                                {biz.category && (
                                    <Badge variant="primary">{biz.category}</Badge>
                                )}
                            </div>
                            {/* Activity Signals */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 mb-4">
                                {activityStats.hostedEventsCount > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4 text-primary-600" />
                                        Hosted {activityStats.hostedEventsCount} event{activityStats.hostedEventsCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {activityStats.isActiveThisMonth && (
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4 text-success-600" />
                                        Active this month
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid - About Section + Sidebar (Tabs are inside Client) */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-16">
                        {/* About - Keep on home tab of profile if desired, or as a global entry */}
                        <section className="bg-white border-b border-neutral-100 sm:border-none">
                            <div className="space-y-8">
                                {/* Hook/Intro - Large Text */}
                                <div>
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-8 tracking-tight">
                                        About {biz.name}
                                    </h2>
                                    <div className="prose prose-lg prose-neutral max-w-none">
                                        <p className="text-xl sm:text-2xl font-light text-neutral-600 leading-relaxed">
                                            {biz.tagline || biz.description?.split('.')[0] + '.'}
                                        </p>
                                        <div className="mt-8 text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                                            {biz.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Image Grid - If available (Placeholder for now if no extra images) */}
                                {/* This would be a place to put a masonry grid of secondary images if they existed in the DB object */}

                                {/* Additional Info Cards - Refined */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
                                    {/* Delivery Options */}
                                    {(biz.delivery_available || biz.pickup_available) && (
                                        <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-neutral-100">
                                                <ShoppingBag className="w-6 h-6 text-neutral-900" />
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                                Ways to Shop
                                            </h3>
                                            <div className="space-y-4">
                                                {biz.delivery_available && (
                                                    <div className="flex items-center gap-3 text-neutral-700 bg-white p-3 rounded-xl border border-neutral-100 shadow-sm">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <span className="text-base font-semibold">Delivery Available</span>
                                                    </div>
                                                )}
                                                {biz.pickup_available && (
                                                    <div className="flex items-center gap-3 text-neutral-700 bg-white p-3 rounded-xl border border-neutral-100 shadow-sm">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        <span className="text-base font-semibold">Pickup Available</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8 lg:sticky lg:top-32 h-fit">
                        {/* Contact Card */}
                        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow duration-500">
                            <h3 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
                                <span className="w-8 h-1 bg-primary-600 rounded-full inline-block"></span>
                                Connect
                            </h3>
                            <div className="space-y-6">
                                {biz.website_url && (
                                    <a href={biz.website_url} target="_blank" rel="noopener" className="flex items-center gap-4 text-neutral-900 hover:text-primary-600 font-bold group transition-colors">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                                            <Globe className="w-5 h-5 text-neutral-400 group-hover:text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">Website</span>
                                            Visit Page
                                        </div>
                                    </a>
                                )}
                                {biz.contact_phone && (
                                    <div className="flex items-center gap-4 text-neutral-900 font-semibold">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">Phone</span>
                                            {biz.contact_phone}
                                        </div>
                                    </div>
                                )}
                                {biz.contact_email && (
                                    <div className="flex items-center gap-4 text-neutral-900 font-semibold">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">Email</span>
                                            {biz.contact_email}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hours */}
                            {biz.opening_hours && typeof biz.opening_hours === 'object' && !Array.isArray(biz.opening_hours) && (
                                <div className="mt-10 pt-10 border-t border-dashed border-neutral-200">
                                    <div className="flex items-center gap-2 mb-6 text-neutral-900 font-bold">
                                        <Clock className="w-5 h-5 text-primary-600" />
                                        Opening Hours
                                    </div>
                                    <div className="space-y-3">
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

                        {/* Events Card */}
                        {events.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-neutral-900 px-2">Upcoming Events</h3>
                                {events.slice(0, 3).map((event: any) => (
                                    <Link key={event.id} href={`/markets/events/${event.id}`} className="block p-4 bg-white border border-neutral-200 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all group">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex flex-col items-center justify-center text-primary-600 shrink-0 group-hover:bg-primary-100 transition-colors">
                                                <span className="text-[10px] font-bold uppercase">{new Date(event.start_at).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-lg font-bold leading-none">{new Date(event.start_at).getDate()}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">{event.title}</h4>
                                                <p className="text-xs text-neutral-500 mt-1">{new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
