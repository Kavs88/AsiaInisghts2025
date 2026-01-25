'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Deal {
    id: string
    title: string
    description: string | null
    valid_from: string | null
    valid_to: string | null
    vendors: {
        id: string
        name: string
        slug: string
        logo_url: string | null
    } | null
}

export default function ConciergeDealsPage() {
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDeals()
    }, [])

    const fetchDeals = async () => {
        try {
            const res = await fetch('/api/deals')
            if (!res.ok) throw new Error('Failed to fetch deals')
            const data = await res.json()
            setDeals(data.deals || [])
        } catch (err) {
            console.error('Error fetching deals:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-10 bg-neutral-200 rounded w-1/3 mb-4"></div>
                        <div className="h-6 bg-neutral-200 rounded w-1/2 mb-12"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-neutral-200 rounded-2xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                        Deals & Discounts
                    </h1>
                    <p className="text-lg text-neutral-600">
                        Exclusive offers from local vendors and businesses
                    </p>
                </div>

                {deals.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                                No Deals Available
                            </h2>
                            <p className="text-neutral-600 mb-6">
                                Deals and special offers will appear here once vendors create them.
                            </p>
                            <Link
                                href="/markets"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Explore Markets
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deals.map((deal) => {
                            const daysUntilExpiry = deal.valid_to
                                ? Math.ceil((new Date(deal.valid_to).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                : null
                            const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7

                            return (
                                <div key={deal.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                                    <div className="p-6">
                                        {/* Discount Hero - Visual Anchor */}
                                        <div className="mb-4">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                <span className="font-bold text-lg">SPECIAL OFFER</span>
                                            </div>
                                        </div>

                                        {/* Deal Title */}
                                        <h3 className="text-lg font-semibold text-neutral-900 mb-3 line-clamp-2">
                                            {deal.title}
                                        </h3>

                                        {/* Description */}
                                        {deal.description && (
                                            <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                                                {deal.description}
                                            </p>
                                        )}

                                        {/* Expiry with Urgency Color */}
                                        <div className={`text-xs font-medium mb-4 flex items-center gap-1 ${isExpiringSoon ? 'text-warning-700' : 'text-neutral-500'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Valid until {formatDate(deal.valid_to)}
                                            {isExpiringSoon && <span className="ml-1 font-semibold">• Expiring Soon!</span>}
                                        </div>

                                        {/* Vendor Attribution */}
                                        {deal.vendors && (
                                            <div className="pt-4 border-t border-neutral-100">
                                                <div className="text-xs text-neutral-500 mb-2">Offered by</div>
                                                <Link
                                                    href={`/markets/sellers/${deal.vendors.slug}`}
                                                    className="flex items-center gap-3 group"
                                                >
                                                    {deal.vendors.logo_url && (
                                                        <img
                                                            src={deal.vendors.logo_url}
                                                            alt={deal.vendors.name}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-neutral-100"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-neutral-900 group-hover:text-success-600 transition-colors">
                                                            {deal.vendors.name}
                                                        </div>
                                                    </div>
                                                    <svg className="w-4 h-4 text-neutral-400 group-hover:text-success-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
