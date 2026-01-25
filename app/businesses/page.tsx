'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useTransition } from 'react';
import BusinessCard from '@/components/ui/BusinessCard';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface Business {
    id: string;
    name: string;
    category: string;
    excerpt: string;
    description?: string;
    image_url: string;
    slug: string;
    location?: string;
    rating?: number;
    review_count?: number;
}

const CATEGORIES = [
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

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true);
            const supabase = createClient();
            let query = supabase.from('businesses').select('*');

            const category = searchParams.get('category') || 'all';
            const search = searchParams.get('search');

            if (category !== 'all') {
                const categoryLabel = CATEGORIES.find(c => c.id === category)?.label;
                if (categoryLabel) {
                    if (category === 'food') query = query.ilike('category', '%Food%');
                    else if (category === 'retail') query = query.ilike('category', '%Retail%');
                    else if (category === 'services') query = query.ilike('category', '%Service%');
                    else if (category === 'artisan') query = query.ilike('category', '%Artisan%');
                }
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching businesses:', error);
            } else {
                setBusinesses(data || []);
            }
            setLoading(false);
        };

        fetchBusinesses();
    }, [searchParams]);

    const handleCategoryChange = (categoryId: string) => {
        startTransition(() => {
            if (categoryId === 'all') {
                router.push('/businesses');
            } else {
                router.push(`/businesses?category=${categoryId}`);
            }
        });
    };

    const [searchQuery, setSearchQuery] = useState('');
    const currentSearch = searchParams.get('search') || '';

    // Sync local state with URL
    useEffect(() => {
        setSearchQuery(currentSearch);
    }, [currentSearch]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const params = new URLSearchParams(searchParams.toString());
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
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-24 lg:py-32 px-4">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                        Community Members
                    </h1>
                    <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        The definitive guide to the people building our community. Find them in town or at our **weekly flagship markets**.
                    </p>

                    <div className="max-w-xl mx-auto relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Search businesses, services, or people... (Press Enter)"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-lg"
                        />
                        <Search className="absolute left-4 top-4.5 h-5 w-5 text-neutral-400" />
                    </div>
                </div>
            </div>

            <div className="container-custom py-16 lg:py-20">
                <div className="flex flex-wrap justify-center gap-3 mb-14">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`px-7 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-sm ${currentCategory === cat.id
                                ? 'bg-primary-600 text-white shadow-primary-200 scale-105'
                                : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 hover:border-primary-300'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className={`transition-opacity duration-300 ${isPending || loading ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-neutral-900">
                            {currentCategory === 'all'
                                ? 'All Businesses'
                                : CATEGORIES.find(c => c.id === currentCategory)?.label || 'Businesses'}
                        </h2>
                        <span className="text-neutral-500 text-sm font-medium">
                            Showing {businesses.length} Community Members
                        </span>
                    </div>

                    {loading && businesses.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="h-[400px] bg-neutral-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {businesses.map((business) => (
                                <BusinessCard key={business.id} business={business} />
                            ))}
                        </div>
                    )}

                    {!loading && businesses.length === 0 && (
                        <div className="text-center py-24">
                            <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">No businesses found</h3>
                            <p className="text-neutral-500">Try adjusting your category filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
