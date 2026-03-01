import Link from 'next/link'
import { Search } from 'lucide-react'
import BusinessCard from '@/components/ui/BusinessCard'
import EmptyState from '@/components/ui/EmptyState'
import { getBusinesses } from '@/lib/actions/businesses'
import HubHero from '@/components/ui/HubHero'

const CATEGORIES = [
  { id: 'setup', label: 'Setup Stack', isIntent: true },
  { id: 'all', label: 'All Businesses' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'retail', label: 'Retail' },
  { id: 'services', label: 'Services' },
  { id: 'artisan', label: 'Artisan' },
]

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const category = searchParams.category || 'all'
  const search = searchParams.search || ''

  let businesses = await getBusinesses({
    category: category === 'all' ? undefined : category,
    limit: 50,
  })

  if (search) {
    const lower = search.toLowerCase()
    businesses = businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(lower) ||
        (b.description && b.description.toLowerCase().includes(lower)),
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <HubHero
        title="Businesses"
        subtitle="Connect with verified local businesses, artisans, and service providers in Da Nang and Hoi An."
        variant="businesses"
        imageUrl="/images/Stalls 6.jpg"
      >
        <form
          action="/businesses"
          className="w-full max-w-xl mx-auto relative mt-8 flex gap-2"
        >
          {category !== 'all' && (
            <input type="hidden" name="category" value={category} />
          )}
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search businesses, services or people..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-lg"
            />
            <Search className="absolute left-4 top-[1.125rem] h-5 w-5 text-neutral-400" />
          </div>
          <button
            type="submit"
            className="px-6 py-4 bg-white text-neutral-900 font-bold rounded-2xl shadow-lg hover:bg-neutral-50 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </HubHero>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => {
            const params = new URLSearchParams()
            if (cat.id !== 'all') params.set('category', cat.id)
            if (search) params.set('search', search)
            const href = `/businesses${params.toString() ? `?${params.toString()}` : ''}`
            const isActive = category === cat.id

            return (
              <Link
                key={cat.id}
                href={href}
                className={`px-7 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-sm ${
                  isActive
                    ? cat.id === 'setup'
                      ? 'bg-neutral-900 text-white shadow-xl'
                      : 'bg-primary-600 text-white'
                    : cat.id === 'setup'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 hover:border-primary-300'
                }`}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900">
            {category === 'all'
              ? 'All Businesses'
              : CATEGORIES.find((c) => c.id === category)?.label || 'Businesses'}
          </h2>
          <span className="text-neutral-900 text-sm font-semibold">
            Showing {businesses.length} Community Members
          </span>
        </div>

        {businesses.length === 0 ? (
          <EmptyState
            icon={<Search className="w-8 h-8 text-neutral-400" />}
            title="No businesses found"
            description="Try adjusting your search or category filter."
            action={{ label: 'View All Businesses', href: '/businesses' }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
