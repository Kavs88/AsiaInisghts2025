'use client'

import { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import Image from 'next/image'
import VendorNotificationSettings from './VendorNotificationSettings'
import OrderIntentCard from './OrderIntentCard'

interface VendorTabsProps {
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number
    imageUrl?: string | null
    vendorName?: string
    vendorSlug?: string
    stockQuantity?: number
    isAvailable?: boolean
    requiresPreorder?: boolean
    preorderLeadDays?: number
    category?: string
    tags?: string[]
  }>
  portfolioItems: Array<{
    id: string
    imageUrl?: string | null
    title: string
  }>
  vendor: {
    name: string
    bio?: string
    tagline?: string
    contactEmail?: string
    contactPhone?: string
    websiteUrl?: string
    instagramHandle?: string
    attendingStatus?: 'attending' | 'delivery-only' | 'online-only'
    stallNumber?: string
    marketDate?: string
  }
  orderIntents?: Array<{
    id: string
    product_id: string
    market_day_id: string
    intent_type: 'pickup' | 'delivery'
    quantity: number
    customer_name: string
    customer_email: string
    customer_notes?: string | null
    status: 'pending' | 'confirmed' | 'declined' | 'fulfilled' | 'cancelled'
    created_at: string
    products?: {
      id: string
      name: string
      slug: string
      image_urls?: string[]
    }
    market_days?: {
      id: string
      market_date: string
      location_name: string
    }
  }>
  vendorId?: string
  notificationChannel?: 'email' | 'whatsapp' | 'zalo' | null
  notificationTarget?: string | null
}

export default function VendorTabs({ products, portfolioItems, vendor, orderIntents, vendorId, notificationChannel, notificationTarget }: VendorTabsProps) {
  const [activeTab, setActiveTab] = useState('Store')
  const [refreshKey, setRefreshKey] = useState(0) // Force re-render when order intents update
  const tabs = ['Store', 'Portfolio', 'About', 'Stall Info', 'Orders', 'Settings']

  const handleOrderIntentUpdate = () => {
    // Trigger a refresh by updating the key
    // In a real app, you'd refetch the data here
    setRefreshKey(prev => prev + 1)
    // Reload the page to refresh order intents (simple approach)
    // In production, you'd use a data fetching library like SWR or React Query
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 border-b-2 border-neutral-200 max-w-4xl mx-auto overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-semibold text-sm transition-all duration-200 border-b-3 whitespace-nowrap ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                : 'border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
            }`}
            aria-selected={activeTab === tab}
            role="tab"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content: Store */}
      {activeTab === 'Store' && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
            {products.length === 0 && (
              <div className="text-center py-12 text-neutral-600">
                No products available at this time
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab Content: Portfolio */}
      {activeTab === 'Portfolio' && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">Portfolio</h2>
            </div>
            {portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-soft overflow-hidden"
                  >
                    {item.imageUrl ? (
                      <div className="relative aspect-video bg-neutral-200">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-neutral-200 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-neutral-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-600">
                No portfolio items available
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab Content: About */}
      {activeTab === 'About' && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">About {vendor.name}</h2>
              {vendor.bio ? (
                <div className="prose prose-neutral max-w-none">
                  <p className="text-neutral-700 leading-relaxed mb-6">{vendor.bio}</p>
                </div>
              ) : (
                <p className="text-neutral-600">No bio available.</p>
              )}

              {/* Contact Information */}
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  {vendor.contactEmail && (
                    <a
                      href={`mailto:${vendor.contactEmail}`}
                      className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {vendor.contactEmail}
                    </a>
                  )}
                  {vendor.contactPhone && (
                    <a
                      href={`tel:${vendor.contactPhone}`}
                      className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {vendor.contactPhone}
                    </a>
                  )}
                  {vendor.websiteUrl && (
                    <a
                      href={vendor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Visit Website
                    </a>
                  )}
                  {vendor.instagramHandle && (
                    <a
                      href={`https://instagram.com/${vendor.instagramHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      {vendor.instagramHandle}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab Content: Stall Info */}
      {activeTab === 'Stall Info' && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Stall Information</h2>
              {vendor.attendingStatus === 'attending' && vendor.stallNumber ? (
                <div className="bg-white rounded-2xl shadow-soft p-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Stall Number</h3>
                      <p className="text-3xl font-bold text-primary-600">{vendor.stallNumber}</p>
                    </div>
                    {vendor.marketDate && (
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Market Date</h3>
                        <p className="text-neutral-700">{vendor.marketDate}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Status</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-50 text-success-700 border border-success-200">
                        Attending
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-600">
                  {vendor.attendingStatus === 'delivery-only' ? (
                    <p>This vendor is delivery-only and will not have a physical stall.</p>
                  ) : vendor.attendingStatus === 'online-only' ? (
                    <p>This vendor is online-only and will not have a physical stall.</p>
                  ) : (
                    <p>No stall information available at this time.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tab Content: Orders */}
      {activeTab === 'Orders' && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom max-w-4xl">
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Order Intents</h2>
              {(() => {
                // Memoize grouped order intents to prevent recalculation on every render
                const groupedIntents = useMemo(() => {
                  if (!orderIntents || orderIntents.length === 0) return []
                  const grouped = orderIntents.reduce((acc: Record<string, typeof orderIntents>, intent) => {
                    const marketDate = intent.market_days?.market_date || 'Unknown'
                    if (!acc[marketDate]) {
                      acc[marketDate] = []
                    }
                    acc[marketDate].push(intent)
                    return acc
                  }, {})
                  return Object.entries(grouped).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                }, [orderIntents])

                if (!orderIntents || orderIntents.length === 0) {
                  return (
                    <div className="text-center py-12 text-neutral-600">
                      <p>No order intents yet.</p>
                      <p className="text-sm text-neutral-500 mt-2">Customer requests will appear here.</p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-6">
                    {groupedIntents.map(([marketDate, intents]) => {
                      const marketDay = intents[0]?.market_days
                      return (
                        <div key={marketDate} className="border border-neutral-200 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-neutral-900 mb-4">
                            {marketDay?.location_name || 'Market'} - {new Date(marketDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                          </h3>
                          <div className="space-y-4">
                            {intents.map((intent) => (
                              <OrderIntentCard
                                key={intent.id}
                                intent={intent}
                                vendorId={vendorId || ''}
                                onStatusUpdate={handleOrderIntentUpdate}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'Settings' && vendorId && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom max-w-2xl">
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <VendorNotificationSettings
                vendorId={vendorId}
                initialChannel={notificationChannel}
                initialTarget={notificationTarget}
                contactEmail={vendor.contactEmail}
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}


