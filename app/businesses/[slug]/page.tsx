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
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <Breadcrumbs items={[
                        { label: 'Businesses', href: '/businesses' },
                        { label: biz.name, href: '' }
                    ]} />
                </div>
            </section>

            {/* Hero Banner - Uplifted Fallback */}
            <section className="relative h-64 sm:h-72 lg:h-80 bg-neutral-900 overflow-hidden">
                {heroImageUrl ? (
                    <Image src={heroImageUrl} alt={`${biz.name} banner`} fill className="object-cover opacity-60" priority />
                ) : (
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Layered Branding Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <span className="text-[20vw] font-black text-white uppercase tracking-tighter select-none">
                        {biz.name}
                    </span>
                </div>
            </section>

            {/* Shop Header - Inline identity block */}
            <section className="relative bg-white border-b border-neutral-100">
                <div className="pt-12 sm:pt-16 lg:pt-20 pb-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        {/* Identity Block - Logo + Name */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-1 min-w-0">
                                {/* Logo */}
                                <div className="flex-shrink-0">
                                    {biz.logo_url ? (
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-xl p-1.5 shadow-md border-2 border-neutral-200">
                                            <Image src={biz.logo_url} alt={biz.name} fill className="object-cover rounded-lg" />
                                        </div>
                                    ) : (
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center shadow-md border-2 border-neutral-200">
                                            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-600">
                                                {biz.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Name + Verified Badge */}
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 tracking-tight leading-tight truncate">
                                        {biz.name}
                                    </h1>
                                    {biz.is_verified && <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 flex-shrink-0" />}
                                </div>
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-16">
                        {/* About - Keep on home tab of profile if desired, or as a global entry */}
                        <section className="bg-white border-b border-neutral-100 sm:border-none">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Image Holder */}
                                <div className="lg:col-span-4">
                                    <div className="sticky top-24">
                                        <div className="relative aspect-square bg-neutral-50 rounded-2xl overflow-hidden shadow-md">
                                            {biz.logo_url ? (
                                                <Image
                                                    src={biz.logo_url}
                                                    alt={`${biz.name} - About`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                                                    <div className="text-center p-8">
                                                        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                                                            <span className="text-5xl font-black text-primary-600">
                                                                {biz.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-neutral-500 text-sm font-medium">About {biz.name}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* About Content */}
                                <div className="lg:col-span-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">
                                                About {biz.name}
                                            </h2>
                                            <div className="text-base sm:text-lg text-neutral-700 leading-relaxed whitespace-pre-line max-w-3xl">
                                                {biz.description}
                                            </div>
                                        </div>

                                        {/* Additional Info Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                            {/* Delivery Options */}
                                            {(biz.delivery_available || biz.pickup_available) && (
                                                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                                                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <ShoppingBag className="w-6 h-6 text-primary-600" />
                                                        </div>
                                                        Delivery Options
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {biz.delivery_available && (
                                                            <div className="flex items-center gap-3 text-neutral-700">
                                                                <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                                                                <span className="text-base font-medium">Delivery Available</span>
                                                            </div>
                                                        )}
                                                        {biz.pickup_available && (
                                                            <div className="flex items-center gap-3 text-neutral-700">
                                                                <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                                                                <span className="text-base font-medium">Pickup Available</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Contact Card */}
                        <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 shadow-sm">
                            <h3 className="text-xl font-bold text-neutral-900 mb-6">Contact & Hours</h3>
                            <div className="space-y-6">
                                {biz.website_url && (
                                    <a href={biz.website_url} target="_blank" rel="noopener" className="flex items-center gap-4 text-primary-600 hover:text-primary-700 font-medium group">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center group-hover:border-primary-200 transition-colors"><Globe className="w-5 h-5" /></div>
                                        Visit Website
                                    </a>
                                )}
                                {biz.contact_phone && (
                                    <div className="flex items-center gap-4 text-neutral-700">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center"><Phone className="w-5 h-5 text-neutral-400" /></div>
                                        {biz.contact_phone}
                                    </div>
                                )}
                                {biz.contact_email && (
                                    <div className="flex items-center gap-4 text-neutral-700">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center"><Mail className="w-5 h-5 text-neutral-400" /></div>
                                        {biz.contact_email}
                                    </div>
                                )}
                            </div>

                            {/* Hours */}
                            {biz.opening_hours && (
                                <div className="mt-8 pt-8 border-t border-neutral-200/50">
                                    <div className="flex items-center gap-2 mb-4 text-neutral-900 font-bold"><Clock className="w-5 h-5 text-neutral-400" /> Opening Hours</div>
                                    <div className="space-y-2 text-sm text-neutral-600">
                                        {Object.entries(biz.opening_hours as object || {}).map(([day, hours]) => (
                                            <div key={day} className="flex justify-between"><span className="capitalize">{day}</span><span>{hours}</span></div>
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
