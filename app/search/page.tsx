import { getProperties } from '@/lib/actions/properties'
import { getBusinesses } from '@/lib/actions/businesses'
import { getVendors, searchProducts } from '@/lib/supabase/queries'
import PropertyCard from '@/components/ui/PropertyCard'
import BusinessCard from '@/components/ui/BusinessCard'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'

interface SearchPageProps {
    searchParams: {
        q?: string
    }
}

async function SearchResults({ query }: { query: string }) {
    if (!query) return null;

    // Fetch all entities in parallel
    const [businesses, properties, vendors, products] = await Promise.all([
        getBusinesses({ limit: 10, category: undefined }).then(data => data.filter(b => b.name.toLowerCase().includes(query.toLowerCase()) || (b.description && b.description.toLowerCase().includes(query.toLowerCase())))),
        getProperties({ limit: 10 }).then(data => data.filter((p: any) => p.address.toLowerCase().includes(query.toLowerCase()) || (p.description && p.description.toLowerCase().includes(query.toLowerCase())))),
        getVendors({ searchQuery: query, limit: 10 }).catch(() => []),
        searchProducts(query, 10).catch(() => [])
    ])

    const hasResults = businesses.length > 0 || properties.length > 0 || vendors.length > 0 || products.length > 0;

    if (!hasResults) {
        return (
            <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200 shadow-sm mt-8">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">No results found for &quot;{query}&quot;</h3>
                <p className="text-neutral-500 max-w-md mx-auto mb-8">
                    We couldn't find anything matching your search. Try checking for typos or using broader terms.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:-translate-y-1"
                >
                    Return Home
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-12 mt-12 pb-12">
            {/* Businesses Section */}
            {businesses.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
                        <h2 className="text-3xl font-black text-neutral-900">Local Businesses</h2>
                        <span className="text-sm font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{businesses.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.map((business: any) => (
                            <BusinessCard key={business.id} business={business} />
                        ))}
                    </div>
                </section>
            )}

            {/* Properties Section */}
            {properties.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
                        <h2 className="text-3xl font-black text-neutral-900">Curated Spaces</h2>
                        <span className="text-sm font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{properties.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property: any) => (
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
                </section>
            )}

            {/* Vendors Section */}
            {vendors.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
                        <h2 className="text-3xl font-black text-neutral-900">Sellers & Artisans</h2>
                        <span className="text-sm font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{vendors.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {vendors.map((vendor: any) => (
                            <Link key={vendor.id} href={`/vendors/${vendor.slug}`} className="group block bg-white rounded-2xl shadow-sm border border-neutral-200 hover:shadow-xl transition-all overflow-hidden">
                                <div className="aspect-[4/3] bg-neutral-100 relative">
                                    {vendor.hero_image_url || vendor.logo_url ? (
                                        <Image src={vendor.hero_image_url || vendor.logo_url} alt={vendor.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">No Image</div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">{vendor.name}</h3>
                                    {vendor.short_tagline && <p className="text-sm text-neutral-500 line-clamp-2">{vendor.short_tagline}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Products Section */}
            {products.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
                        <h2 className="text-3xl font-black text-neutral-900">Products</h2>
                        <span className="text-sm font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{products.length}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product: any) => (
                            <Link key={product.id} href={`/products/${product.slug}`} className="group block bg-white rounded-2xl shadow-sm border border-neutral-200 hover:shadow-xl transition-all overflow-hidden p-4">
                                <div className="aspect-square bg-neutral-100 rounded-xl relative overflow-hidden mb-4">
                                    {product.image_urls?.[0] ? (
                                        <Image src={product.image_urls[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">No Image</div>
                                    )}
                                </div>
                                <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-1">{product.name}</h3>
                                {product.vendors && <p className="text-sm text-neutral-500 line-clamp-1">by {product.vendors.name}</p>}
                                <div className="mt-2 font-bold text-primary-600">{product.price ? `${product.price.toLocaleString()} VND` : 'Price varies'}</div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

export default async function GlobalSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    const query = params.q || '';

    return (
        <main className="min-h-screen bg-neutral-50 pt-24 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-4">
                        Search Results
                    </h1>
                    {query ? (
                        <p className="text-xl text-neutral-600 font-medium">
                            Showing results for <span className="text-primary-600 font-bold">&quot;{query}&quot;</span>
                        </p>
                    ) : (
                        <p className="text-xl text-neutral-600 font-medium">
                            Enter a search term to find businesses, spaces, sellers, and products.
                        </p>
                    )}
                </div>

                <Suspense fallback={
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-500 font-medium">Searching the directory...</p>
                    </div>
                }>
                    <SearchResults query={query} />
                </Suspense>
            </div>
        </main>
    )
}
