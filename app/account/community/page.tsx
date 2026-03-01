import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bookmark, Star, Calendar, Building2, Home, MessageSquare } from 'lucide-react'
import { getMyEnquiries } from '@/lib/actions/enquiries'

export const metadata = {
    title: 'My Community | Asia Insights',
    description: 'Your personal connection to the community.',
}

export default async function MyCommunityPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login?next=/account/community')

    // Fetch all data in parallel
    const [
        { data: contentSignals },
        { data: contentEvents },
        { data: savedProperties },
        { data: savedBusinesses },
        enquiries
    ] = await Promise.all([
        supabase
            .from('user_entity_signals')
            .select('*, entities(id, name, slug)')
            .eq('user_id', user.id)
            .eq('signal_type', 'recommend')
            .order('created_at', { ascending: false }),
        supabase
            .from('user_event_bookmarks')
            .select('*, market_days(market_date, title, location_name)')
            .eq('user_id', user.id)
            .eq('intent_type', 'saved')
            .order('created_at', { ascending: false }),
        supabase
            .from('user_saved_items')
            .select('id, item_id, created_at')
            .eq('user_id', user.id)
            .eq('item_type', 'property')
            .order('created_at', { ascending: false }),
        supabase
            .from('user_saved_items')
            .select('id, item_id, created_at')
            .eq('user_id', user.id)
            .eq('item_type', 'entity')
            .order('created_at', { ascending: false }),
        getMyEnquiries(),
    ])

    // Enrich saved properties
    const propertyIds = savedProperties?.map((s: any) => s.item_id) || []
    const { data: propertyData } = propertyIds.length > 0
        ? await supabase.from('properties').select('id, address, type, images').in('id', propertyIds)
        : { data: [] }

    // Enrich saved businesses
    const entityIds = savedBusinesses?.map((s: any) => s.item_id) || []
    const { data: entityData } = entityIds.length > 0
        ? await supabase.from('entities').select('id, name, slug').in('id', entityIds)
        : { data: [] }

    const recommends = contentSignals || []
    const events = contentEvents || []
    const totalItems = recommends.length + events.length + propertyIds.length + entityIds.length + enquiries.length

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            new: 'bg-secondary-50 text-secondary-700 border-secondary-100',
            read: 'bg-brand-50 text-brand-700 border-brand-100',
            responded: 'bg-primary-50 text-primary-700 border-primary-100',
            archived: 'bg-neutral-50 text-neutral-500 border-neutral-100',
        }
        return map[status] || map.new
    }

    return (
        <main className="min-h-screen bg-neutral-50 pb-20">
            {/* Header */}
            <section className="bg-white border-b border-neutral-100 sticky top-0 z-30">
                <div className="container-custom py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/account" className="p-2 -ml-2 text-neutral-400 hover:text-neutral-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-neutral-900">My Community</h1>
                            {totalItems > 0 && (
                                <p className="text-sm text-neutral-500 font-medium mt-0.5">
                                    {totalItems} item{totalItems !== 1 ? 's' : ''} across the platform
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-custom space-y-12 py-10">

                {totalItems === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-neutral-100">
                            <Bookmark className="w-7 h-7 text-neutral-300" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 mb-2">Nothing saved yet</h2>
                        <p className="text-neutral-500 max-w-sm mx-auto leading-relaxed">
                            Bookmark properties, events, and businesses as you explore. They'll appear here.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-sm">
                            Start Exploring
                        </Link>
                    </div>
                )}

                {/* SAVED PROPERTIES */}
                {propertyIds.length > 0 && (
                    <section>
                        <SectionHeader icon={<Home className="w-5 h-5" />} color="bg-primary-100 text-primary-600" title="Saved Stays" count={propertyIds.length} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                            {(propertyData || []).map((property: any) => {
                                const savedRecord: any = (savedProperties as any[])?.find((s: any) => s.item_id === property.id)
                                const image = property.images?.[0]
                                return (
                                    <Link key={property.id} href={`/properties/${property.id}`} className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {image ? <img src={image} alt={property.address} className="w-full h-full object-cover" /> : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary-50"><Home className="w-6 h-6 text-primary-300" strokeWidth={1} /></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-1">{property.address}</h3>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{property.type}</p>
                                            {savedRecord && <p className="text-xs text-neutral-400 mt-1">Saved {formatDate(savedRecord.created_at)}</p>}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* SAVED BUSINESSES */}
                {entityIds.length > 0 && (
                    <section>
                        <SectionHeader icon={<Building2 className="w-5 h-5" />} color="bg-brand-100 text-brand-600" title="Saved Businesses" count={entityIds.length} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                            {(entityData || []).map((entity: any) => {
                                const savedRecord: any = (savedBusinesses as any[])?.find((s: any) => s.item_id === entity.id)
                                return (
                                    <Link key={entity.id} href={`/businesses/${entity.slug}`} className="bg-white p-4 rounded-2xl border border-neutral-200/60 hover:border-brand-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                        <div className="w-16 h-16 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl font-black text-brand-300">{entity.name.charAt(0)}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">{entity.name}</h3>
                                            {savedRecord && <p className="text-xs text-neutral-400 mt-1">Saved {formatDate(savedRecord.created_at)}</p>}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* RECOMMENDS */}
                {recommends.length > 0 && (
                    <section>
                        <SectionHeader icon={<Star className="w-5 h-5" />} color="bg-amber-100 text-amber-600" title="My Recommendations" count={recommends.length} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                            {recommends.map((item: any) => (
                                <Link href={`/businesses/${item.entities?.slug}`} key={item.entity_id} className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl font-black text-amber-300">{item.entities?.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">{item.entities?.name}</h3>
                                        <p className="text-xs text-neutral-400 mt-1">Recommended {formatDate(item.created_at)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* SAVED EVENTS */}
                {events.length > 0 && (
                    <section>
                        <SectionHeader icon={<Calendar className="w-5 h-5" />} color="bg-primary-100 text-primary-600" title="Saved Events" count={events.length} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                            {events.map((item: any) => {
                                const date = new Date(item.market_days?.market_date)
                                return (
                                    <Link key={item.id} href="/markets/market-days" className="bg-white p-4 rounded-2xl border border-neutral-200/60 hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                        <div className="w-16 h-16 bg-primary-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-wider">{date.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                            <span className="text-2xl font-black text-primary-900 leading-none">{date.getDate()}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{item.market_days?.title || 'Market Day'}</h3>
                                            {item.market_days?.location_name && <p className="text-sm text-neutral-500 mt-0.5">{item.market_days.location_name}</p>}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* MY ENQUIRIES */}
                {enquiries.length > 0 && (
                    <section>
                        <SectionHeader icon={<MessageSquare className="w-5 h-5" />} color="bg-neutral-100 text-neutral-600" title="My Enquiries" count={enquiries.length} />
                        <div className="space-y-3 mt-5">
                            {enquiries.map((enquiry: any) => {
                                const property = enquiry.properties
                                const image = property?.images?.[0]
                                return (
                                    <div key={enquiry.id} className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-start gap-4">
                                        <div className="w-16 h-14 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {image ? (
                                                <img src={image} alt={property?.address} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                                    <Home className="w-5 h-5 text-neutral-300" strokeWidth={1} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-bold text-neutral-900 text-sm line-clamp-1">{property?.address || 'Property'}</h3>
                                                <span className={`flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${statusBadge(enquiry.status)}`}>
                                                    {enquiry.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{enquiry.message}</p>
                                            <p className="text-xs text-neutral-400 mt-1.5">Sent {formatDate(enquiry.created_at)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

            </div>
        </main>
    )
}

function SectionHeader({ icon, color, title, count }: { icon: React.ReactNode, color: string, title: string, count: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
            <h2 className="text-lg font-black text-neutral-900">{title}</h2>
            <span className="ml-auto text-sm font-bold text-neutral-400">{count} item{count !== 1 ? 's' : ''}</span>
        </div>
    )
}
