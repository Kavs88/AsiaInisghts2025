import { getPropertyById, getUpcomingEventsForProperty } from '@/lib/actions/properties'
import { getBusinesses } from '@/lib/actions/businesses'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Bath, Users, Building2, Phone, Mail, ChevronLeft, Star, ShieldCheck, Share2, Clock, DollarSign, Calendar } from 'lucide-react'
import { notFound } from 'next/navigation'
import BusinessCard from '@/components/ui/BusinessCard'
import InteractiveMap from '@/components/ui/InteractiveMap'
import Badge from '@/components/ui/Badge'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { createClient } from '@/lib/supabase/server'
import PropertyEnquiryButton from '@/components/ui/PropertyEnquiryButton'
import { SaveButton } from '@/components/ui/SoftActionButtons'
import ShareButton from '@/components/ui/ShareButton'
import MobileActionBar from '@/components/ui/MobileActionBar'
import PropertyWatchlistButton from '@/components/ui/PropertyWatchlistButton'
import { getWatchlistStatus, getWatchlistCount } from '@/lib/actions/engagements'

interface PropertyPageProps {
    params: Promise<{
        id: string
    }> | {
        id: string
    }
}

export async function generateMetadata({ params }: PropertyPageProps) {
    const resolvedParams = params instanceof Promise ? await params : params
    const property = await getPropertyById(resolvedParams.id) as any
    if (!property) return { title: 'Property Not Found' }
    const description = property.description || `Discover ${property.address} — ${property.property_type === 'rental' ? 'rental property' : 'event space'} in Southeast Asia.`
    const image = property.images?.[0] || null
    return {
        title: property.address,
        description,
        openGraph: {
            title: property.address,
            description,
            type: 'website',
            siteName: 'Asia Insights',
            ...(image && { images: [{ url: image, width: 1200, height: 630, alt: property.address }] }),
        },
        twitter: {
            card: 'summary_large_image',
            title: property.address,
            description,
            ...(image && { images: [image] }),
        },
    }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
    // Handle both Promise and direct object params (Next.js 14.2+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params
    const property = await getPropertyById(resolvedParams.id) as any
    if (!property) notFound()

    // Fetch nearby businesses for synergy
    const nearbyBusinesses = await getBusinesses({ category: 'food', limit: 4 }).catch(() => [])

    // Fetch current user for enquiry modal pre-fill
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentUser = user ? { id: user.id, email: user.email, user_metadata: user.user_metadata } : null

    // Fetch watchlist state + upcoming events server-side
    const [watchlistWatching, watchlistCount, upcomingEvents] = await Promise.all([
        getWatchlistStatus(property.id).catch(() => false),
        getWatchlistCount(property.id).catch(() => 0),
        getUpcomingEventsForProperty(property.id).catch(() => []),
    ])

    const displayPrice = property.price ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(property.price) : null

    return (
        <div className="min-h-screen bg-white pb-20 animate-fade-in">
            {/* Breadcrumb Navigation */}
            <div className="bg-white border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <Breadcrumbs items={[
                        { label: 'Properties', href: '/properties' },
                        { label: property.address, href: '' }
                    ]} />
                </div>
            </div>

            {/* Minimal Header Nav */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/properties" className="flex items-center gap-2 px-4 py-2 -ml-4 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all font-semibold">
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Stays</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ShareButton name={property.address} />
                        <SaveButton
                            itemType="property"
                            itemId={property.id}
                            minimal={false}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 rounded-xl transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <section className="py-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px] sm:h-[500px] lg:h-[600px]">
                        <div className="relative group overflow-hidden rounded-2xl bg-neutral-100">
                            {property.images?.[0] && typeof property.images[0] === 'string' ? (
                                <Image src={property.images[0]} alt={property.address} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                            ) : (
                                <div className="w-full h-full bg-neutral-100 flex items-center justify-center"><Building2 className="w-20 h-20 text-neutral-200" /></div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {[1, 2, 3, 4].map((index) => (
                                <div key={index} className="relative group overflow-hidden rounded-2xl bg-neutral-100">
                                    {property.images?.[index] && typeof property.images[index] === 'string' ? (
                                        <Image src={property.images[index]} alt={`${property.address} ${index + 1}`} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-100 flex items-center justify-center"><Building2 className="w-10 h-10 text-neutral-200" /></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                        {/* Main Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                {property.is_featured && (
                                    <Badge variant="primary">
                                        <Star className="w-3 h-3 mr-1 fill-primary-600" />
                                        Featured {property.property_type === 'rental' ? 'Stay' : 'Venue'}
                                    </Badge>
                                )}
                                {property.is_verified && (
                                    <Badge variant="success">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        Verified Property
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 mb-8 leading-tight">{property.address}</h1>

                            <div className="flex flex-wrap items-center gap-8 mb-12 py-8 border-y border-neutral-100">
                                {property.property_type === 'rental' && (
                                    <>
                                        {property.bedrooms && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400">
                                                    <Bed className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-neutral-900 font-bold text-lg">{property.bedrooms}</div>
                                                    <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Bedrooms</div>
                                                </div>
                                            </div>
                                        )}
                                        {property.bathrooms && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400">
                                                    <Bath className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-neutral-900 font-bold text-lg">{property.bathrooms}</div>
                                                    <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Bathrooms</div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                {property.property_type === 'event_space' && property.capacity && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-neutral-900 font-bold text-lg">{property.capacity}</div>
                                            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Capacity</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-lg prose-neutral max-w-none">
                                <h3 className="text-2xl font-bold text-neutral-900 mb-6">About this space</h3>
                                <p className="text-xl text-neutral-600 leading-relaxed font-light">
                                    {property.description || "A beautiful space located in a prime area, perfect for your next stay or event. Managed by local professionals committed to excellence."}
                                </p>
                            </div>

                            {/* Location Section */}
                            <div className="mt-12">
                                <h3 className="text-2xl font-bold text-neutral-900 mb-8">Location</h3>
                                {property.location_coords?.y && property.location_coords?.x ? (
                                    <>
                                        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-soft">
                                            <InteractiveMap
                                                center={[property.location_coords.y, property.location_coords.x]}
                                                zoom={14}
                                                markers={[
                                                    {
                                                        position: [property.location_coords.y, property.location_coords.x],
                                                        label: property.address
                                                    }
                                                ]}
                                                className="h-full w-full"
                                            />
                                        </div>
                                        <p className="mt-4 text-neutral-500 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {property.address}
                                        </p>
                                    </>
                                ) : (
                                    <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-neutral-200 shrink-0 text-primary-600">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-neutral-900 mb-2">Address</h4>
                                                <p className="text-neutral-600 font-medium">
                                                    {property.address}
                                                </p>
                                                <p className="text-sm text-neutral-500 mt-2">
                                                    Exact location details provided upon booking confirmation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upcoming Events at this Venue */}
                            {upcomingEvents.length > 0 && (
                                <div className="mt-12">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-bold text-neutral-900">Upcoming Events Here</h3>
                                            <p className="text-neutral-500 mt-1">Hosted at this venue</p>
                                        </div>
                                        <Link href="/markets/discovery" className="text-primary-600 font-bold hover:underline">View All Events</Link>
                                    </div>
                                    <div className="space-y-3">
                                        {upcomingEvents.map((event: any) => {
                                            const startDate = new Date(event.start_at)
                                            const endDate = event.end_at ? new Date(event.end_at) : null
                                            return (
                                                <div key={event.id} className="flex items-center gap-5 p-5 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all">
                                                    <div className="w-14 h-14 bg-white rounded-2xl border border-neutral-200 flex flex-col items-center justify-center shrink-0 text-primary-600">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 leading-none">
                                                            {startDate.toLocaleDateString('en-US', { month: 'short' })}
                                                        </span>
                                                        <span className="text-xl font-black text-neutral-900 leading-none">
                                                            {startDate.getDate()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                                                {event.event_type === 'market' ? 'Market Day' : event.event_type}
                                                            </span>
                                                        </div>
                                                        <p className="font-bold text-neutral-900 truncate">{event.title}</p>
                                                        <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
                                                            <Clock className="w-3.5 h-3.5 shrink-0" />
                                                            {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                            {endDate && ` – ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                                                        </p>
                                                    </div>
                                                    <Calendar className="w-5 h-5 text-neutral-300 shrink-0" />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Synergy Section: Nearby Hotspots */}
                            <div className="mt-12">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-neutral-900">Nearby Hotspots</h3>
                                        <p className="text-neutral-500 mt-1">Local businesses within walking distance</p>
                                    </div>
                                    <Link href="/businesses" className="text-primary-600 font-bold hover:underline">View All</Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {nearbyBusinesses.map((biz: any) => (
                                        <BusinessCard
                                            key={biz.id}
                                            business={{
                                                id: biz.id,
                                                name: biz.name,
                                                slug: biz.slug,
                                                category: biz.category,
                                                description: biz.description || undefined,
                                                address: biz.address || undefined,
                                                logo_url: biz.logo_url || undefined,
                                                is_verified: biz.is_verified || undefined
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Booking Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-white border border-neutral-200 rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow duration-500">
                                {property.property_type === 'rental' && (
                                    <div className="flex items-end gap-2 mb-8">
                                        <span className="text-4xl font-black text-neutral-900">{displayPrice}</span>
                                        <span className="text-neutral-500 font-medium mb-1">/ month</span>
                                    </div>
                                )}
                                {property.property_type === 'event_space' && (
                                    <div className="mb-8 space-y-4">
                                        {property.hourly_rate && (
                                            <div>
                                                <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium mb-1">
                                                    <Clock className="w-4 h-4" />
                                                    Hourly Rate
                                                </div>
                                                <div className="text-3xl font-black text-neutral-900">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                        maximumFractionDigits: 0
                                                    }).format(property.hourly_rate)}
                                                </div>
                                            </div>
                                        )}
                                        {property.daily_rate && (
                                            <div>
                                                <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium mb-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    Daily Rate
                                                </div>
                                                <div className="text-3xl font-black text-neutral-900">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                        maximumFractionDigits: 0
                                                    }).format(property.daily_rate)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4 mb-8">
                                    <PropertyEnquiryButton
                                        propertyId={property.id}
                                        propertyAddress={property.address}
                                        propertyType={property.property_type}
                                        currentUser={currentUser}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        {(property.host_phone || property.contact_phone) ? (
                                        <a href={`tel:${property.host_phone || property.contact_phone}`} className="flex items-center justify-center gap-2 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all">
                                            <Phone className="w-4 h-4" />
                                            Call Host
                                        </a>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-400 cursor-not-allowed">
                                            <Phone className="w-4 h-4" />
                                            Call Host
                                        </span>
                                    )}
                                        {(property.host_email || property.contact_email) ? (
                                            <a href={`mailto:${property.host_email || property.contact_email}?subject=${encodeURIComponent(`Inquiry about ${property.address} via Asia Insights`)}&body=${encodeURIComponent(`Hi,\n\nI found your listing for ${property.address} on Asia Insights and wanted to ask about...`)}`} className="flex items-center justify-center gap-2 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all">
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </a>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-400 cursor-not-allowed">
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-center pt-2">
                                        <Link href="/concierge" className="inline-block text-sm font-semibold text-neutral-500 hover:text-primary-600 transition-colors">
                                            Need integrated support? Contact Concierge.
                                        </Link>
                                    </div>
                                    <PropertyWatchlistButton
                                        propertyId={property.id}
                                        initialWatching={watchlistWatching}
                                        initialCount={watchlistCount}
                                        className="w-full justify-center"
                                    />
                                </div>

                                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center gap-4">
                                    {(property.businesses?.logo_url && typeof property.businesses.logo_url === 'string') ? (
                                        <Image src={property.businesses.logo_url} alt={property.businesses.name} width={48} height={48} className="rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-neutral-100 text-neutral-300">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Managed by</div>
                                        <Link href={`/businesses/${property.businesses?.slug || '#'}`} className="text-sm font-bold text-neutral-900 hover:text-primary-600 transition-colors">
                                            {property.businesses?.name || "Local Professional"}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile bottom padding spacer */}
            <div className="h-24 lg:hidden" />

            {/* Mobile Sticky Action Bar */}
            <MobileActionBar className="flex items-center gap-3">
                <div className="flex-1">
                    <PropertyEnquiryButton
                        propertyId={property.id}
                        propertyAddress={property.address}
                        propertyType={property.property_type}
                        currentUser={currentUser}
                        className="h-[52px] py-0 m-0"
                    />
                </div>
                <div className="flex-shrink-0">
                    <PropertyWatchlistButton
                        propertyId={property.id}
                        initialWatching={watchlistWatching}
                        initialCount={watchlistCount}
                        minimal={true}
                        className="h-[52px] w-[52px]"
                    />
                </div>
                <div className="flex-shrink-0">
                    <SaveButton
                        itemType="property"
                        itemId={property.id}
                        minimal={false}
                        className="h-[52px] px-5"
                    />
                </div>
            </MobileActionBar>
        </div>
    )
}
