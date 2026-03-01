import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBusinessBySlug } from '@/lib/actions/businesses'
import { getPropertiesByBusiness } from '@/lib/actions/properties'
import { getEntitySignals } from '@/lib/actions/signals'
import { ShieldCheck, MapPin, Calendar, ShoppingBag, Home } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import EventCard from '@/components/ui/EventCard'
import PropertyCard from '@/components/ui/PropertyCard'
import Badge from '@/components/ui/Badge'
import TrustBadgeList from '@/components/ui/TrustBadgeList'
import { EntitySignalButtons } from '@/components/ui/EntitySignalButtons'
import { SaveButton } from '@/components/ui/SoftActionButtons'
import { getSavedStatus } from '@/lib/actions/social'
import { EntitySignalSummary } from '@/components/ui/EntitySignalSummary'
import StructuredData from '@/components/seo/StructuredData'
import MakerAnchorNav from '@/components/ui/MakerAnchorNav'

export const revalidate = 3600 // Revalidate every hour

export default async function MakerProfilePage({ params }: { params: { slug: string } }) {
    const business = await getBusinessBySlug(params.slug)

    if (!business) {
        notFound()
    }

    const { events, products, activityStats } = business as any

    // Parallel fetch — all three are independent of each other
    const [properties, signals, isSaved] = await Promise.all([
        getPropertiesByBusiness(business.id).catch(() => []),
        getEntitySignals(business.id).catch(() => ({
            user: { isRecommended: false, isRegular: false },
            community: { hasRecommendations: false, hasRegulars: false, recommendCount: 0, regularCount: 0 },
            founder: { isRecommended: false },
        })),
        getSavedStatus('entity', business.id).catch(() => false),
    ])


    const isVerified = business.is_verified || ((business as any).confidence_score && (business as any).confidence_score > 80)

    return (
        <main className="min-h-screen bg-white pb-20">
            <StructuredData entity={business} />
            {/* Header / Cover */}
            <div className="h-56 md:h-72 bg-neutral-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-neutral-900" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent" />
            </div>

            <div className="container-custom relative -mt-20">
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-xl border border-neutral-100">

                    {/* Identity Section */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                        {/* Avatar */}
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-neutral-50">
                            {business.logo_url ? (
                                <Image src={business.logo_url} alt={business.name} fill sizes="(max-width: 768px) 128px, 160px" className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-300">
                                    {business.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pt-2">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-black text-neutral-900 leading-tight">
                                    {business.name}
                                </h1>
                                {isVerified && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified Member
                                    </span>
                                )}
                            </div>

                            {/* Trust Signals Summary & Action */}
                            <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                <EntitySignalSummary signals={signals} />
                                {(signals.founder.isRecommended || signals.community.hasRecommendations || signals.community.hasRegulars) && (
                                    <div className="hidden sm:block text-neutral-200">|</div>
                                )}
                                <div className="flex items-center gap-2">
                                    <EntitySignalButtons entityId={business.id} initialUserSignals={signals.user} />
                                    <SaveButton itemType="entity" itemId={business.id} initialIsSaved={isSaved} />
                                </div>
                            </div>

                            {/* Trust Badges */}
                            {(business as any).trust_badges && (business as any).trust_badges.length > 0 && (
                                <div className="mb-4">
                                    <TrustBadgeList badges={(business as any).trust_badges} size="sm" />
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-neutral-500 text-sm font-medium mb-5">
                                {business.address && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{business.address}</span>
                                        </div>
                                        <span className="text-neutral-300">|</span>
                                    </>
                                )}
                                <span>Member since {new Date(business.created_at).getFullYear()}</span>
                            </div>

                            {/* Trust/Activity Stats — elevated above description for scanability */}
                            <div className="flex gap-6 mb-6 pb-6 border-b border-neutral-100">
                                {products.length > 0 && (
                                    <div>
                                        <div className="text-2xl font-black text-neutral-900">{products.length}</div>
                                        <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Offers</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-2xl font-black text-neutral-900">{properties.length}</div>
                                    <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Properties</div>
                                </div>
                                {(activityStats?.hostedEventsCount || 0) > 0 && (
                                    <div>
                                        <div className="text-2xl font-black text-neutral-900">{activityStats?.hostedEventsCount || 0}</div>
                                        <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Events</div>
                                    </div>
                                )}
                            </div>

                            <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
                                {business.description || "No bio provided."}
                            </p>

                            {/* Founder Signals - Phase 4 Intelligence */}
                            {((business as any).founder_tags?.length > 0 || (business as any).founder_notes?.length > 0) && (
                                <div className="mt-8 mb-4 p-6 bg-primary-50 rounded-2xl border border-primary-100">
                                    <h3 className="text-xs font-black text-primary-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                                        Founder Insight
                                    </h3>

                                    {/* Tags */}
                                    {(business as any).founder_tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(business as any).founder_tags.map((t: any, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-white border border-primary-200 text-primary-700 text-xs font-bold rounded-lg shadow-sm">
                                                    {t.tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {(business as any).founder_notes?.length > 0 && (
                                        <div className="space-y-3">
                                            {(business as any).founder_notes.map((n: any, i: number) => (
                                                <div key={i}>
                                                    <p className="text-neutral-700 font-medium leading-relaxed text-sm">
                                                        "{n.note}"
                                                    </p>
                                                    {/* Contextual Transparency */}
                                                    <p className="mt-1 text-[10px] text-neutral-400 font-medium">
                                                        Shown because Asia Insights {n.visibility === 'public' ? 'verified this detail' : 'marked this for internal context'}.
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            <MakerAnchorNav sections={[
                ...(products.length > 0 ? [{ id: 'products', label: `Products (${products.length})` }] : []),
                ...(properties.length > 0 ? [{ id: 'properties', label: `Spaces (${properties.length})` }] : []),
                ...(events.length > 0 ? [{ id: 'events', label: `Events (${events.length})` }] : []),
            ]} />

            {/* Offerings Grid */}
            <div className="container-custom pt-12 space-y-14">

                {/* Products */}
                {products.length > 0 && (
                    <section id="products" className="scroll-mt-24">
                        <div className="flex items-center gap-2 mb-6 text-primary-600">
                            <ShoppingBag className="w-5 h-5" />
                            <h2 className="text-2xl font-black">Curated Offers</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((product: any) => (
                                <div key={product.id} className="h-full">
                                    {/* We manually reconstruct minimal props if needed, but ProductCard takes raw props mostly */}
                                    <ProductCard
                                        {...product}
                                        vendorName={business.name}
                                        vendorSlug={business.slug}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Properties */}
                {properties.length > 0 && (
                    <section id="properties" className="scroll-mt-24">
                        <div className="flex items-center gap-2 mb-6 text-primary-600">
                            <Home className="w-5 h-5" />
                            <h2 className="text-2xl font-black">Managed Spaces</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property: any) => (
                                <div key={property.id} className="h-full">
                                    <PropertyCard
                                        {...property}
                                        businesses={business} // Pass the full business object for the signature
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Events */}
                {events.length > 0 && (
                    <section id="events" className="scroll-mt-24">
                        <div className="flex items-center gap-2 mb-6 text-primary-600">
                            <Calendar className="w-5 h-5" />
                            <h2 className="text-2xl font-black">Upcoming Events</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event: any) => (
                                <div key={event.id} className="h-full">
                                    <EventCard
                                        {...event}
                                        hosting_business={business}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {products.length === 0 && properties.length === 0 && events.length === 0 && (
                    <div className="text-center py-20 bg-neutral-50 rounded-2xl">
                        <p className="text-neutral-400 font-medium">This member has no active listings yet.</p>
                    </div>
                )}

            </div>
        </main>
    )
}
