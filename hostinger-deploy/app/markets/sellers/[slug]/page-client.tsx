'use client'

import { useState, useMemo } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import Image from 'next/image'
import Link from 'next/link'
import ReviewsSection from '@/components/ui/ReviewsSection'


/**
 * SELLER PROFILE CLIENT - DESIGN SYSTEM RULES
 * 
 * TABS:
 * - Padding: px-4 sm:px-6 py-4 (standard tap targets)
 * - Typography: text-sm font-medium
 * - Gap: gap-1 (4px) between tabs
 * - No negative margins or overflow hacks
 * 
 * FILTERS:
 * - Standard gap scale: gap-4 mobile, gap-6 desktop
 * - Standard padding: p-6
 * - Button padding: px-4 py-2 (tap-friendly)
 * 
 * GRIDS:
 * - Products: gap-4 sm:gap-6 (16px/24px - 8px grid)
 * - Portfolio: gap-4 sm:gap-6
 * - All grids use standard gap scale
 */

interface SellerProfileClientProps {
  vendor: {
    id: string
    name: string
    slug: string
    tagline?: string
    bio?: string
    category?: string
    deliveryAvailable?: boolean
    pickupAvailable?: boolean
    attendingStatus?: 'attending' | 'delivery-only' | 'online-only'
    nextMarketStall?: string
    nextMarketDate?: string
  }
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number | null
    imageUrl?: string | null
    vendorName: string
    vendorSlug: string
    stockQuantity: number
    isAvailable: boolean
    requiresPreorder: boolean
    preorderLeadDays?: number
    category?: string
    tags?: string[]
  }>
  portfolio: Array<{
    id: string
    imageUrl?: string
    title: string
  }>
  productCategories: string[]
  productTags: string[]
  events: any[]
  deals: any[]
  pastMarketsCount?: number
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name'

export default function SellerProfileClient({
  vendor,
  products,
  portfolio,
  productCategories,
  productTags,
  events,
  deals,
  pastMarketsCount = 0,
}: SellerProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'portfolio' | 'events' | 'deals' | 'policies' | 'reviews'>('products')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false
      }
      if (selectedTags.length > 0) {
        const productTags = product.tags || []
        const hasSelectedTag = selectedTags.some(tag => productTags.includes(tag))
        if (!hasSelectedTag) return false
      }
      return true
    })

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        case 'newest':
        default:
          return 0
      }
    })

    return sorted
  }, [products, selectedCategory, selectedTags, sortBy])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + selectedTags.length

  const handleTabClick = (tab: 'products' | 'portfolio' | 'events' | 'deals' | 'policies' | 'reviews') => {
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
      {/* Tabs Navigation - Matches content width, verified header height offset */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white border-b border-neutral-200">
        <div className="container-custom max-w-7xl">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => handleTabClick('products')}
              className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] ${activeTab === 'products'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Shop ({products.length})
            </button>
            <button
              onClick={() => handleTabClick('events')}
              className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] ${activeTab === 'events'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Events {events.length > 0 && `(${events.length})`}
              {deals.length > 0 && activeTab !== 'events' && (
                <span className="ml-1.5 text-xs text-success-600">• {deals.length} deal{deals.length !== 1 ? 's' : ''}</span>
              )}
            </button>
            <button
              onClick={() => handleTabClick('deals')}
              className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] ${activeTab === 'deals'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Deals {deals.length > 0 && `(${deals.length})`}
              {events.length > 0 && activeTab !== 'deals' && (
                <span className="ml-1.5 text-xs text-primary-600">• {events.length} event{events.length !== 1 ? 's' : ''}</span>
              )}
            </button>
            {portfolio.length > 0 && (
              <button
                onClick={() => handleTabClick('portfolio')}
                className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] ${activeTab === 'portfolio'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
              >
                Portfolio ({portfolio.length})
              </button>
            )}
            <button
              onClick={() => handleTabClick('policies')}
              className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] ${activeTab === 'policies'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Policies
            </button>
            <button
              onClick={() => handleTabClick('reviews')}
              className={`px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] ${activeTab === 'reviews'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Reviews
            </button>
          </div>
        </div>
      </section>

      <div id="tab-content">
        {/* Tab Content: Products - Standard section padding */}
        {activeTab === 'products' && (
          <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
            <div className="container-custom max-w-7xl">
              {/* Filters and Sort - Standard gap scale */}
              <div className="mb-8 space-y-6">
                {/* Sort and Filter Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-base text-neutral-600">
                      Showing <span className="font-bold text-neutral-900">{filteredAndSortedProducts.length}</span> of {products.length} products
                    </p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => {
                          setSelectedCategory('All')
                          setSelectedTags([])
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                      >
                        Clear {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm font-medium text-neutral-700">Sort:</label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-4 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>
                </div>

                {/* Filters - Standard padding, standard gap scale */}
                {(productCategories.length > 0 || productTags.length > 0) && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Category Filter */}
                      {productCategories.length > 0 && (
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wide">Category</h3>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedCategory('All')}
                              className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${selectedCategory === 'All'
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50 text-neutral-700'
                                }`}
                            >
                              All
                            </button>
                            {productCategories.map((category) => (
                              <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${selectedCategory === category
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50 text-neutral-700'
                                  }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags Filter */}
                      {productTags.length > 0 && (
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wide">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {productTags.map((tag) => {
                              const isSelected = selectedTags.includes(tag)
                              return (
                                <button
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${isSelected
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50 text-neutral-700'
                                    }`}
                                >
                                  {tag}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Products Grid - Standard gap scale */}
              {filteredAndSortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-300">
                  <svg className="w-20 h-20 mx-auto text-neutral-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-2xl font-bold text-neutral-900 mb-3">No products found</p>
                  <p className="text-base text-neutral-600 mb-8">Try adjusting your filters or sorting options</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All')
                      setSelectedTags([])
                      setSortBy('newest')
                    }}
                    className="px-8 py-4 bg-primary-600 text-white text-base font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab Content: Events - Only show if events exist */}
        {activeTab === 'events' && (
          <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
            <div className="container-custom max-w-7xl">
              {events.length > 0 ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">Events</h2>
                    <p className="text-base sm:text-lg text-neutral-600">Upcoming events hosted by {vendor.name}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg font-semibold text-sm mb-4">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(event.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{event.description}</p>
                          )}
                          {event.location && (
                            <p className="text-sm text-neutral-500 flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-300">
                  <svg className="w-20 h-20 mx-auto text-neutral-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Upcoming Events</h2>
                  <p className="text-neutral-600">No events scheduled at this time.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab Content: Deals - Only show if deals exist */}
        {activeTab === 'deals' && (
          <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
            <div className="container-custom max-w-7xl">
              {deals.length > 0 ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">Current Offers</h2>
                    <p className="text-base sm:text-lg text-neutral-600">Active deals and special offers</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deals.map((deal) => (
                      <div key={deal.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-2 mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success-50 text-success-700 rounded-lg font-semibold text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                              </svg>
                              Active Deal
                            </div>
                            {deal.event_id && (
                              <Link
                                href={`/markets/market-days`}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Event Offer
                              </Link>
                            )}
                          </div>
                          <div className="mb-2">
                            <p className="text-xs text-neutral-500 mb-1">From {vendor.name}</p>
                          </div>
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{deal.title}</h3>
                          {deal.description && (
                            <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{deal.description}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            {deal.valid_from && deal.valid_to && (
                              <span>
                                {new Date(deal.valid_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(deal.valid_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                            {deal.valid_to && !deal.valid_from && (
                              <span>
                                Valid until {new Date(deal.valid_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-300">
                  <svg className="w-20 h-20 mx-auto text-neutral-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Active Offers</h2>
                  <p className="text-neutral-600">No deals available at this time.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab Content: Portfolio - Standard section padding */}
        {activeTab === 'portfolio' && (
          <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
            <div className="container-custom max-w-7xl">
              {portfolio.length > 0 ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">Portfolio</h2>
                    <p className="text-base sm:text-lg text-neutral-600">Work by {vendor.name}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all"
                      >
                        {item.imageUrl ? (
                          <div className="relative aspect-video bg-neutral-200">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-neutral-200 flex items-center justify-center">
                            <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="font-bold text-lg text-neutral-900">{item.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-300">
                  <svg className="w-20 h-20 mx-auto text-neutral-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl font-semibold text-neutral-600">No portfolio items available yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab Content: Policies - Standardized container width */}
        {activeTab === 'policies' && (
          <section className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="container-custom max-w-7xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-12 tracking-tight">Shop Policies</h2>

              <div className="space-y-8">
                {/* Shipping Policy */}
                <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    Shipping
                  </h3>
                  <div className="text-neutral-700 space-y-3 text-base sm:text-lg leading-relaxed pl-16">
                    {vendor.deliveryAvailable ? (
                      <>
                        <p>Delivery available.</p>
                        <p className="text-sm text-neutral-600">Contact for rates and delivery times.</p>
                      </>
                    ) : (
                      <p className="text-neutral-600">Pickup only.</p>
                    )}
                  </div>
                </div>

                {/* Returns Policy */}
                <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    Returns & Exchanges
                  </h3>
                  <div className="text-neutral-700 space-y-3 text-base sm:text-lg leading-relaxed pl-16">
                    <p>Contact directly to discuss returns or exchanges.</p>
                    <p className="text-sm text-neutral-600">Return policies vary. Reach out before purchasing if you have questions.</p>
                  </div>
                </div>

                {/* Payment Policy */}
                <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    Payment
                  </h3>
                  <div className="text-neutral-700 space-y-3 text-base sm:text-lg leading-relaxed pl-16">
                    <p>Contact to arrange payment.</p>
                    <p className="text-sm text-neutral-600">Payment methods vary. Common options include cash, bank transfer, or digital payment apps.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab Content: Reviews - Live Review System */}
        {activeTab === 'reviews' && (
          <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
            <div className="container-custom max-w-7xl">
              <ReviewsSection subjectId={vendor.id} subjectType="vendor" subjectName={vendor.name} />
            </div>
          </section>
        )}
      </div>
    </>
  )
}


