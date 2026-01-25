import { getProperties } from '@/lib/actions/properties'
import PropertyCard from '@/components/ui/PropertyCard'
import { MapPin, Home, Star } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { GridSkeleton } from '@/components/ui/LoadingSkeleton'

interface PropertiesPageProps {
    searchParams: {
        type?: string
        property_type?: string
    }
}

import HubHero from '@/components/ui/HubHero'

async function PropertiesGrid({
    propertyType,
    category
}: {
    propertyType?: 'rental' | 'event_space'
    category?: string
}) {
    const properties = await getProperties({
        property_type: propertyType,
        type: category,
        limit: 40
    })

    return (
        <>
            {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
            ) : (
                <div className="text-center py-32 bg-white rounded-[2.5rem] border border-neutral-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
                    <div className="w-24 h-24 bg-neutral-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Home className="w-12 h-12 text-neutral-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">No properties found</h3>
                    <p className="text-neutral-500 max-w-md mx-auto mb-8">
                        We couldn't find any properties matching your current criteria. Try adjusting your filters or browsing all categories.
                    </p>
                    <Link
                        href="/properties"
                        className="inline-flex items-center justify-center px-8 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold rounded-2xl transition-all mb-4"
                    >
                        Clear All Filters
                    </Link>
                    <div className="text-sm text-neutral-500">
                        Own a property? <Link href="/markets/vendor/apply" className="text-primary-600 font-semibold hover:underline">List it with us</Link>
                    </div>
                </div>
            )}
        </>
    )
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
    const propertyType = searchParams.property_type as 'rental' | 'event_space' | undefined
    const category = searchParams.type

    const categories = [
        { id: 'all', label: 'All Stays', value: '', icon: Home },
        { id: 'villa', label: 'Villas', value: 'villa', icon: Star },
        { id: 'apartment', label: 'Apartments', value: 'apartment', icon: Home },
        { id: 'house', label: 'Houses', value: 'house', icon: Home },
        { id: 'events', label: 'Event Spaces', value: 'event_space', icon: MapPin, property_type: 'event_space' },
    ]

    return (
        <main id="main-content" className="min-h-screen bg-white">
            <HubHero
                title="Find Your Perfect Space."
                subtitle="Discover premium villas, cozy apartments, and stunning venues managed by local experts in Da Nang and Hoi An."
                imageUrl="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80"
                anchorId="properties-grid"
            >
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-8">
                    {categories.map((cat) => {
                        const Icon = cat.icon
                        const isActive = (cat.property_type ? propertyType === cat.property_type : !propertyType) && (cat.value ? (category === cat.value || propertyType === cat.value) : !category)

                        let href = '/properties'
                        const params = new URLSearchParams()
                        if (cat.property_type) params.set('property_type', cat.property_type)
                        if (cat.value && cat.value !== 'event_space') params.set('type', cat.value)
                        const queryStr = params.toString()
                        if (queryStr) href += `?${queryStr}`

                        return (
                            <Link
                                key={cat.id}
                                href={href}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm ${isActive
                                    ? 'bg-primary-600 text-white shadow-primary-200'
                                    : 'bg-white/80 backdrop-blur-md text-neutral-900 hover:bg-white border border-white/20'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.label}
                            </Link>
                        )
                    })}
                </div>
            </HubHero>

            {/* Results Grid - Enhanced consistency */}
            <section id="properties-grid" className="py-16 lg:py-24 bg-neutral-50/50 animate-fade-up">
                <div className="container-custom max-w-7xl">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-neutral-900">
                            {propertyType === 'event_space' ? 'Available Event Venues' : 'Recommended Stays'}
                        </h2>
                    </div>

                    <Suspense fallback={<GridSkeleton count={8} />}>
                        <PropertiesGrid propertyType={propertyType} category={category} />
                    </Suspense>
                </div>
            </section>
        </main>
    )
}
