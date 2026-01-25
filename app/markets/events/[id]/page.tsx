import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Clock, ChevronLeft, Share2, Info, Building2, User } from 'lucide-react'
import EventIntentButtons from '@/components/ui/EventIntentButtons'
import ReviewSummary from '@/components/ui/ReviewSummary'
import ReviewsSection from '@/components/ui/ReviewsSection'
import RSVPAction from '@/components/ui/RSVPAction'
import EventHeroImage from '@/components/ui/EventHeroImage'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export async function generateMetadata({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    if (!supabase) return { title: 'Event Details | AI Markets' }

    const { data: event } = await (supabase
        .from('events') as any)
        .select('title, description')
        .eq('id', params.id)
        .single() as any

    if (!event) return { title: 'Event Not Found | AI Markets' }

    return {
        title: `${event.title} | AI Markets`,
        description: event.description || 'Join us for this event!',
    }
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    if (!supabase) return notFound()

    // 1. Try to fetch from 'events' table
    const { data: event, error: eventError } = await (supabase
        .from('events') as any)
        .select(`
            *,
            host:host_id (
                id,
                name,
                slug,
                logo_url
            )
        `)
        .eq('id', params.id)
        .single() as any

    // 2. If not found, try 'market_days'
    let marketDay = null
    if (eventError || !event) {
        const { data: md } = await (supabase
            .from('market_days') as any)
            .select(`
                *,
                hosts:hosts (
                    id,
                    name,
                    slug,
                    logo_url
                )
            `)
            .eq('id', params.id)
            .single() as any
        marketDay = md
    }

    if (!event && !marketDay) notFound()

    const item = event || {
        ...marketDay,
        title: `Market Day - ${marketDay.location_name}`,
        start_at: `${marketDay.market_date}T${marketDay.start_time || '00:00:00'}`,
        end_at: `${marketDay.market_date}T${marketDay.end_time || '23:59:59'}`,
        location: marketDay.location_name,
        host: marketDay.hosts,
        isMarketDay: true
    }

    const startDate = new Date(item.start_at)
    const endDate = item.end_at ? new Date(item.end_at) : null

    // Fetch review summary for market days only
    let reviewSummary = null
    if (item.isMarketDay && item.id) {
        try {
            const supabase = await createClient()
            if (supabase) {
                const { data } = await (supabase
                    .from('review_summaries') as any)
                    .select('*')
                    .eq('subject_id', item.id)
                    .eq('subject_type', 'market_day')
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
    }

    return (
        <main className="min-h-screen bg-neutral-50 pb-20">
            {/* Breadcrumb Navigation */}
            <div className="bg-white border-b border-neutral-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <Breadcrumbs items={[
                        { label: 'Markets', href: '/markets' },
                        { label: item.title, href: '' }
                    ]} />
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between">
                    <Link href="/markets/discovery" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Discovery</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <EventIntentButtons eventId={item.id} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-5xl">
                <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
                    {/* Hero Image */}
                    <EventHeroImage
                        src={item.image_url}
                        alt={item.title}
                        category={item.category}
                        isMarketDay={item.isMarketDay}
                    />

                    <div className="p-6 sm:p-10 lg:p-12">
                        <div className="max-w-3xl">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 mb-8 leading-tight">
                                {item.title}
                            </h1>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Date</p>
                                        <p className="text-lg font-bold text-neutral-900">
                                            {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Time</p>
                                        <p className="text-lg font-bold text-neutral-900">
                                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {endDate && ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 sm:col-span-2 text-neutral-800">
                                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Location</p>
                                        <p className="text-lg font-bold text-neutral-900">{item.location}</p>
                                        {item.location_address && (
                                            <p className="text-neutral-500 mt-1">{item.location_address}</p>
                                        )}
                                    </div>
                                </div>

                                {reviewSummary && reviewSummary.totalReviews > 0 && (
                                    <div className="flex gap-4 sm:col-span-2">
                                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <Info className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Reviews</p>
                                            <ReviewSummary
                                                averageRating={reviewSummary.averageRating}
                                                totalReviews={reviewSummary.totalReviews}
                                                size="md"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Host info */}
                            {item.host && (
                                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mb-12">
                                    <div className="flex items-center gap-4">
                                        {item.host.logo_url ? (
                                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-neutral-200">
                                                <Image src={item.host.logo_url} alt={item.host.name} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 bg-white rounded-xl border border-neutral-200 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-neutral-300" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Hosted By</p>
                                            <Link href={`/businesses/${item.host.slug}`} className="text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors">
                                                {item.host.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="prose prose-lg max-w-none text-neutral-700 mb-12">
                                <h3 className="text-2xl font-bold text-neutral-900 mb-4">About this Event</h3>
                                {item.description ? (
                                    <div className="whitespace-pre-line leading-relaxed">
                                        {item.description}
                                    </div>
                                ) : (
                                    <p className="italic text-neutral-500">No description provided for this event.</p>
                                )}
                            </div>

                            {/* RSVP Section */}
                            <div className="mb-12">
                                <RSVPAction
                                    eventId={item.id}
                                    marketDayId={item.isMarketDay ? item.id : undefined}
                                />
                            </div>

                            {/* Reviews Section - only for market days */}
                            {item.isMarketDay && item.id && (
                                <div className="mt-12 pt-12 border-t border-neutral-200">
                                    <ReviewsSection
                                        subjectId={item.id}
                                        subjectType="market_day"
                                        subjectName={item.title}
                                    />
                                    <div className="mt-8">
                                        <Link href="/markets/market-days" className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg">
                                            View Stall Map
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
