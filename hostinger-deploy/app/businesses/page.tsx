import HubHero from '@/components/ui/HubHero'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Clock } from 'lucide-react'
import BusinessCard from '@/components/ui/BusinessCard'
import { getBusinesses } from '@/lib/actions/businesses'

export const metadata = {
    title: 'Business Directory | AI Markets',
    description: 'Discover local businesses, services, and venues.',
}

export default async function BusinessesPage({
    searchParams,
}: {
    searchParams: { category?: string }
}) {
    const categoryQuery = searchParams.category
    const businesses = await getBusinesses(categoryQuery)

    const categories = [
        { id: 'all', label: 'All Businesses', value: '' },
        { id: 'retail', label: 'Retail & Shops', value: 'retail' },
        { id: 'food', label: 'Food & Drink', value: 'food' },
        { id: 'service', label: 'Professional Services', value: 'service' },
        { id: 'venue', label: 'Venues & Spaces', value: 'venue' },
    ]

    return (
        <main id="main-content" className="min-h-screen bg-white">
            <HubHero
                title="Business Directory."
                subtitle="The definitive guide to local businesses, services, and venues. Connect with the community's best and discover what's near you."
                imageUrl="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&h=900&fit=crop"
                variant="businesses"
            >
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    {categories.map((cat) => {
                        const isActive = cat.value === (categoryQuery || '')
                        return (
                            <Link
                                key={cat.id}
                                href={cat.value ? `/businesses?category=${cat.value}` : '/businesses'}
                                className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm ${isActive
                                    ? 'bg-primary-600 text-white shadow-primary-200'
                                    : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'
                                    }`}
                            >
                                {cat.label}
                            </Link>
                        )
                    })}
                </div>
            </HubHero>

            {/* Results Grid - Standardized Components */}
            <section className="py-16 lg:py-24 bg-neutral-50/50">
                <div className="container-custom max-w-7xl animate-fade-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-bold text-neutral-900">
                            {categoryQuery ? `${categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1)} Businesses` : 'All Local Businesses'}
                        </h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                            Exploring {businesses.length} Local Artisans
                        </span>
                    </div>

                    {businesses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {businesses.map((business) => (
                                <BusinessCard key={business.id} business={business as any} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-white rounded-[2.5rem] border border-neutral-200/60 shadow-sm">
                            <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary-600">
                                <MapPin className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Be the first to list here!</h3>
                            <p className="text-neutral-500 max-w-md mx-auto mb-8">
                                We're actively growing our network of local artisans and businesses.
                                Do you own a business in this category?
                            </p>
                            <Link
                                href="/markets/vendor/apply"
                                className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 transform hover:-translate-y-1"
                            >
                                List Your Business
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
