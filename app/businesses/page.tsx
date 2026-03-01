'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import BusinessCard from '@/components/ui/BusinessCard';
import { GridSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { getBusinesses, Business } from '@/lib/actions/businesses';
import HubHero from '@/components/ui/HubHero';

const CATEGORIES = [
    { id: 'setup', label: 'Setup Stack', isIntent: true },
    { id: 'all', label: 'All Businesses' },
    { id: 'food', label: 'Food & Drink' },
    { id: 'retail', label: 'Retail' },
    { id: 'services', label: 'Services' },
    { id: 'artisan', label: 'Artisan' },
];

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentCategory = searchParams.get('category') || 'all';

    // Sync local search query state with URL
    const [searchQuery, setSearchQuery] = useState('');
    const currentSearch = searchParams.get('search') || '';

    useEffect(() => {
        setSearchQuery(currentSearch);
    }, [currentSearch]);

    // Fetch Logic
    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true);
            try {
                // Call Server Action (Sources from 'entities')
                const data = await getBusinesses({
                    category: currentCategory === 'all' ? undefined : currentCategory,
                    limit: 50
                });

                // Client-side search filtering
                let filtered = data;
                if (currentSearch) {
                    const lowerSearch = currentSearch.toLowerCase();
                    filtered = data.filter(b =>
                        b.name.toLowerCase().includes(lowerSearch) ||
                        (b.description && b.description.toLowerCase().includes(lowerSearch))
                    );
                }

                setBusinesses(filtered);
            } catch (error) {
                console.error('Error fetching businesses:', error);
                setBusinesses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [currentCategory, currentSearch]);

    const handleCategoryChange = (categoryId: string) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (categoryId === 'all') {
                params.delete('category');
            } else {
                params.set('category', categoryId);
            }
            // Keep search logic consistent
            if (currentSearch) {
                params.set('search', currentSearch);
            }
            router.push(`/businesses?${params.toString()}`);
        });
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const params = new URLSearchParams(searchParams.toString());
            // Preserve category
            if (currentCategory !== 'all') {
                params.set('category', currentCategory);
            }

            if (searchQuery) {
                params.set('search', searchQuery);
            } else {
                params.delete('search');
            }
            router.push(`/businesses?${params.toString()}`);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <HubHero
                title="Businesses"
                subtitle="Connect with verified local businesses, artisans, and service providers in Da Nang and Hoi An."
                variant="businesses"
                imageUrl="/images/Stalls 6.jpg"
            >
                <div className="w-full max-w-xl mx-auto relative mt-8 flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Search businesses, services or people..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-lg"
                        />
                        <Search className="absolute left-4 top-4.5 h-5 w-5 text-neutral-400" />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString())
                            if (currentCategory !== 'all') params.set('category', currentCategory)
                            if (searchQuery) { params.set('search', searchQuery) } else { params.delete('search') }
                            router.push(`/businesses?${params.toString()}`)
                        }}
                        className="px-6 py-4 bg-white text-neutral-900 font-bold rounded-2xl shadow-lg hover:bg-neutral-50 transition-colors whitespace-nowrap"
                    >
                        Search
                    </button>
                </div>
            </HubHero>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`px-7 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-sm ${currentCategory === cat.id
                                ? (cat.id === 'setup' ? 'bg-neutral-900 text-white shadow-xl' : 'bg-primary-600 text-white shadow-primary-200')
                                : (cat.id === 'setup' ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 hover:border-primary-300')
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className={`transition-opacity duration-300 ${isPending || loading ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black text-neutral-900">
                            {currentCategory === 'all'
                                ? 'All Businesses'
                                : CATEGORIES.find(c => c.id === currentCategory)?.label || 'Businesses'}
                        </h2>
                        <span className="text-neutral-900 text-sm font-semibold">
                            Showing {businesses.length} Community Members
                        </span>
                    </div>

                    {loading && businesses.length === 0 ? (
                        <GridSkeleton count={6} columns={3} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {businesses.map((business) => (
                                <BusinessCard key={business.id} business={business} />
                            ))}
                        </div>
                    )}

                    {!loading && businesses.length === 0 && (
                        <EmptyState
                            icon={<Search className="w-8 h-8 text-neutral-400" />}
                            title="No businesses found"
                            description="Try adjusting your search or category filter."
                            action={{ label: 'View All Businesses', href: '/businesses' }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
