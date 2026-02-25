'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Share2, Check, Copy, Phone, Mail, ShoppingBag, Calendar, Tag, Image as ImageIcon, MessageSquare, MapPin } from 'lucide-react'
import ReviewsSection from '@/components/ui/ReviewsSection'
import PropertyCard from '@/components/ui/PropertyCard'
import ShareButton from '@/components/ui/ShareButton'

interface BusinessProfileClientProps {
    business: any
    products: any[]
    events: any[]
    deals: any[]
    nearbyProperties?: any[]
    contact_phone?: string | null
    contact_email?: string | null
}

export default function BusinessProfileClient({
    business,
    products,
    events,
    deals,
    nearbyProperties = [],
    contact_phone,
    contact_email
}: BusinessProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'shop' | 'events' | 'deals' | 'gallery' | 'reviews' | 'neighborhood'>('shop')

    const handleTabClick = (tab: 'shop' | 'events' | 'deals' | 'gallery' | 'reviews' | 'neighborhood') => {
        setActiveTab(tab)
        setTimeout(() => {
            const element = document.getElementById('tab-content')
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }, 100)
    }

    return (
        <>
            {/* Header Action Buttons - Fully aligned with Seller Profile */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {contact_phone && contact_phone !== 'No Phone' && (
                    <a
                        href={`tel:${contact_phone}`}
                        className="flex items-center justify-center gap-0 sm:gap-2 p-0 sm:px-5 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md h-11 min-w-[44px] flex-1 sm:h-auto sm:w-auto sm:min-w-[auto] sm:flex-none whitespace-nowrap"
                        aria-label="Call business"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="hidden sm:inline">Contact</span>
                    </a>
                )}

                {contact_email && (
                    <a
                        href={`mailto:${contact_email}`}
                        className="flex items-center justify-center gap-0 sm:gap-2 p-0 sm:px-5 sm:py-3 bg-white hover:bg-neutral-50 text-neutral-700 text-sm sm:text-base font-semibold rounded-xl border border-neutral-200 transition-colors shadow-sm hover:shadow-md h-11 min-w-[44px] flex-1 sm:h-auto sm:w-auto sm:min-w-[auto] sm:flex-none whitespace-nowrap"
                        aria-label="Email business"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Email</span>
                    </a>
                )}

                <ShareButton name={business.name} />
            </div>

            {/* Tab Navigation */}
            <section className="sticky top-16 lg:top-20 z-30 bg-white border-b border-neutral-200 mt-6">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => handleTabClick('shop')}
                            className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] flex items-center gap-2 ${activeTab === 'shop'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Shop ({products.length})
                        </button>
                        <button
                            onClick={() => handleTabClick('events')}
                            className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] flex items-center gap-2 ${activeTab === 'events'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Events {events.length > 0 && `(${events.length})`}
                        </button>
                        <button
                            onClick={() => handleTabClick('deals')}
                            className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] flex items-center gap-2 ${activeTab === 'deals'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                }`}
                        >
                            <Tag className="w-4 h-4" />
                            Deals {deals.length > 0 && `(${deals.length})`}
                        </button>
                        {business.images && business.images.length > 0 && (
                            <button
                                onClick={() => handleTabClick('gallery')}
                                className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] flex items-center gap-2 ${activeTab === 'gallery'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                    }`}
                            >
                                <ImageIcon className="w-4 h-4" />
                                Gallery
                            </button>
                        )}
                        <button
                            onClick={() => handleTabClick('reviews')}
                            className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] flex items-center gap-2 ${activeTab === 'reviews'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Reviews
                        </button>
                        {nearbyProperties.length > 0 && (
                            <button
                                onClick={() => handleTabClick('neighborhood')}
                                className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] flex items-center gap-2 ${activeTab === 'neighborhood'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                    }`}
                            >
                                <MapPin className="w-4 h-4" />
                                Neighborhood ({nearbyProperties.length})
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div id="tab-content" className="scroll-mt-36 lg:scroll-mt-40">
                {/* Active Tab Content will be rendered here */}
                {activeTab === 'shop' && (
                    <section className="py-12 bg-neutral-50">
                        <div className="container mx-auto px-4 max-w-7xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Products</h2>
                            </div>
                            {products.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {products.map((product: any) => (
                                        <div key={product.id} className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="aspect-square relative bg-neutral-100">
                                                {product.image_urls?.[0] && (
                                                    <Image
                                                        src={product.image_urls[0]}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, 25vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm">
                                                        <ShoppingBag className="w-4 h-4 text-primary-600" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-neutral-900 mb-1 truncate">{product.name}</h3>
                                                <p className="text-primary-600 font-bold">${product.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200">
                                    <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-black text-neutral-900 mb-2">No products yet</h3>
                                    <p className="text-neutral-500 text-sm">Check back later for new items.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'events' && (
                    <section className="py-12 bg-neutral-50">
                        <div className="container mx-auto px-4 max-w-7xl">
                            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-8 tracking-tight">Upcoming Events</h2>
                            {events.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((event: any) => (
                                        <Link key={event.id} href={`/markets/events/${event.id}`} className="block p-6 bg-white border border-neutral-200 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all group">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 bg-primary-50 rounded-xl flex flex-col items-center justify-center text-primary-600 shrink-0 group-hover:bg-primary-100 transition-colors">
                                                    <span className="text-xs font-bold uppercase">{new Date(event.start_at).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-xl font-bold leading-none">{new Date(event.start_at).getDate()}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-lg font-bold text-neutral-900 mb-1 truncate group-hover:text-primary-600 transition-colors">{event.title}</h4>
                                                    <p className="text-sm text-neutral-500 mb-2">{new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    {event.location && (
                                                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                                            <Mail className="w-3 h-3" />
                                                            <span className="truncate">{event.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200">
                                    <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-black text-neutral-900 mb-2">No events scheduled</h3>
                                    <p className="text-neutral-500 text-sm">Stay tuned for future events.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'deals' && (
                    <section className="py-12 bg-neutral-50">
                        <div className="container mx-auto px-4 max-w-7xl">
                            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-8 tracking-tight">Active Deals</h2>
                            {deals.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {deals.map((deal: any) => (
                                        <div key={deal.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 -mr-12 -mt-12 rounded-full group-hover:scale-110 transition-transform duration-500" />
                                            <Tag className="absolute top-4 right-4 w-5 h-5 text-primary-400" />
                                            <h4 className="text-xl font-bold text-neutral-900 mb-2 pr-10">{deal.title}</h4>
                                            <p className="text-neutral-600 mb-4">{deal.description}</p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="px-3 py-1 bg-success-50 text-success-700 rounded-lg font-bold">Active Offer</span>
                                                <span className="text-neutral-400">Exp: {new Date(deal.valid_to).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200">
                                    <Tag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-black text-neutral-900 mb-2">No active deals</h3>
                                    <p className="text-neutral-500 text-sm">Check back for special offers.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'gallery' && business.images && business.images.length > 0 && (
                    <section className="py-12 bg-neutral-50">
                        <div className="container mx-auto px-4 max-w-7xl">
                            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-8 tracking-tight">Gallery</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {business.images.map((img: string, i: number) => (
                                    <div key={i} className="aspect-square relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-zoom-in group border border-neutral-100">
                                        <Image src={img} alt={`${business.name} ${i + 1}`} fill sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'reviews' && (
                    <section className="py-12 bg-neutral-50">
                        <div className="container mx-auto px-4 max-w-7xl">
                            <ReviewsSection subjectId={business.id} subjectType="business" subjectName={business.name} />
                        </div>
                    </section>
                )}

                {activeTab === 'neighborhood' && (
                    <section className="py-12 bg-neutral-50">
                        <div className="container mx-auto px-4 max-w-7xl">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                                <div className="max-w-2xl">
                                    <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3 tracking-tight">Stay & Play Nearby</h2>
                                    <p className="text-neutral-600">
                                        Discover accommodations and event spaces just around the corner from {business.name}.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {nearbyProperties.map((property: any) => (
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
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </>
    )
}
