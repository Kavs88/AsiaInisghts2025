import { createPublicClient } from '@/lib/supabase/public'
import { getPublicEventDetail, getPublicMarketDayForEvent, getEventReviewSummary } from '@/lib/actions/event-detail'
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
import { SaveButton } from '@/components/ui/SoftActionButtons'

export async function generateMetadata({ params }: { params: { id: string } }) {
    const supabase = createPublicClient()

    const { data: event } = await (supabase
        .from('events') as any)
        .select('title, description')
        .eq('id', params.id)
        .single()

    if (!event) return { title: 'Event Not Found | AI Markets' }

    return {
        title: `${event.title} | AI Markets`,
        description: event.description || 'Join us for this event!',
    }
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    // 1. Try to fetch from 'events' table
    const event = await getPublicEventDetail(params.id)

    // 2. If not found, try 'market_days'
    let marketDay = null
    if (!event) {
        marketDay = await getPublicMarketDayForEvent(params.id)
    }

    if (!event && !marketDay) notFound()

    const item = event ? {
        ...event,
        participants: event.participating_entities?.map((p: any) => ({
            ...p.entity,
            role: p.role
        })) || []
    } : {
        ...marketDay,
        title: `Market Day${marketDay.location_name ? ` - ${marketDay.location_name}` : ''}`,
        start_at: `${marketDay.market_date}T${marketDay.start_time || '00:00:00'}`,
        end_at: `${marketDay.market_date}T${marketDay.end_time || '23:59:59'}`,
        location: marketDay.location_name,
        host: marketDay.hosts,
        isMarketDay: true,
        participants: []
    }

    const startDate = new Date(item.start_at)
    const endDate = item.end_at ? new Date(item.end_at) : null

    // Fetch review summary for market days only
    let reviewSummary = null
    if (item.isMarketDay && item.id) {
        reviewSummary = await getEventReviewSummary(item.id, 'market_day').catch(() => ({
            averageRating: 0,
            totalReviews: 0,
        }))
    }

    return (
        <main className="min-h-screen bg-neutral-50 pb-20">
            {/* Breadcrumb Navigation */}
            <div className="bg-white border-b border-neutral-100">
                <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
                    <Breadcrumbs items={[
                        { label: 'Markets', href: '/markets' },
                        { label: item.title, href: '' }
                    ]} />
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="container mx-auto px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between">
                    <Link href="/markets/discovery" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Discovery</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {/* Phase 2: Save Button */}
                        <SaveButton itemType="event" itemId={item.id} />
                        <EventIntentButtons eventId={item.id} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 lg:px-8 py-8 lg:py-12 max-w-5xl">
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
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-8 leading-tight">
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
                                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mb-8">
                                    <div className="flex items-center gap-4">
                                        {item.host.logo_url ? (
                                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-neutral-200">
                                                <Image src={item.host.logo_url} alt={item.host.name} fill sizes="56px" className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 bg-white rounded-xl border border-neutral-200 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-neutral-300" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Hosted By</p>
                                            <Link href={`/makers/${item.host.slug}`} className="text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors">
                                                {item.host.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Phase 2: Participating Entities */}
                            {item.participants && item.participants.length > 0 && (
                                <div className="mb-12">
                                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary-600" />
                                        Meet these verified makers
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {item.participants.map((participant: any) => (
                                            <Link
                                                key={participant.id}
                                                href={`/makers/${participant.slug}`}
                                                className="flex items-center gap-3 p-4 bg-white border border-neutral-100 rounded-2xl hover:border-primary-200 hover:shadow-sm transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden relative border border-neutral-100">
                                                    {participant.logo_url ? (
                                                        <Image src={participant.logo_url} alt={participant.name} fill sizes="40px" className="object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center font-bold text-neutral-300">
                                                            {participant.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <div className="font-bold text-neutral-900 truncate group-hover:text-primary-700">{participant.name}</div>
                                                        {(participant.confidence_score > 80) && (
                                                            <div className="w-4 h-4 text-emerald-500 rounded-full bg-emerald-50 flex items-center justify-center">
                                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 capitalize">{participant.role || 'Participant'}</div>
                                                </div>
                                            </Link>
                                        ))}
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
