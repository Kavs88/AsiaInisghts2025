'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Deal {
    id: string
    title: string
    description: string | null
    valid_from: string | null
    valid_to: string | null
    status: 'active' | 'expired' | 'draft'
    created_at: string
}

export default function VendorDealsPage() {
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    useEffect(() => {
        fetchDeals()
    }, [])

    const fetchDeals = async () => {
        try {
            const res = await fetch('/api/vendor/deals')
            if (!res.ok) throw new Error('Failed to fetch deals')
            const data = await res.json()
            setDeals(data.deals || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleArchive = async (id: string) => {
        if (!confirm('Archive this deal?')) return

        try {
            const res = await fetch(`/api/vendor/deals/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to archive deal')
            fetchDeals() // Refresh list
        } catch (err: any) {
            alert('Error: ' + err.message)
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
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-neutral-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/3 mb-8"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                            My Deals
                        </h1>
                        <p className="text-neutral-600">
                            Create and manage special offers for your customers
                        </p>
                    </div>
                    <Link
                        href="/markets/vendor/dashboard/deals/create"
                        className="px-6 py-3 bg-success-600 text-white font-medium rounded-xl hover:bg-success-700 transition-colors"
                    >
                        Create Deal
                    </Link>
                </div>

                {/* Quick Stats */}
                {deals.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                            <div className="text-sm text-neutral-600 mb-1">Active</div>
                            <div className="text-2xl font-bold text-success-600">
                                {deals.filter(d => d.status === 'active').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                            <div className="text-sm text-neutral-600 mb-1">Drafts</div>
                            <div className="text-2xl font-bold text-warning-600">
                                {deals.filter(d => d.status === 'draft').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                            <div className="text-sm text-neutral-600 mb-1">Expired</div>
                            <div className="text-2xl font-bold text-neutral-400">
                                {deals.filter(d => d.status === 'expired').length}
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs (UI Only) */}
                {deals.length > 0 && (
                    <div className="flex gap-2 mb-6 border-b border-neutral-200">
                        <button className="px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
                            All
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
                            Active
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
                            Draft
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
                            Expired
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {deals.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                                Create Your First Deal
                            </h2>
                            <p className="text-neutral-600 mb-6">
                                Offer special discounts and promotions to attract more customers
                            </p>
                            <Link
                                href="/markets/vendor/dashboard/deals/create"
                                className="inline-block px-6 py-3 bg-success-600 text-white font-medium rounded-xl hover:bg-success-700 transition-colors"
                            >
                                Create Deal
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
                                <div key={deal.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow relative">
                                    {/* Status Badge - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${deal.status === 'active' ? 'bg-success-50 text-success-700' :
                                                deal.status === 'draft' ? 'bg-warning-50 text-warning-700' :
                                                    'bg-neutral-100 text-neutral-600'
                                            }`}>
                                            {deal.status === 'active' && (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            {deal.status === 'draft' && (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            )}
                                            {deal.status === 'expired' && (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            {deal.status}
                                        </span>
                                    </div>

                                    <div className="pr-20">
                                        <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2">{deal.title}</h3>
                                    </div>

                                    {deal.description && (
                                        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{deal.description}</p>
                                    )}

                                    {/* Expiry with Urgency Color */}
                                    <div className={`text-xs font-medium mb-4 ${isExpiringSoon ? 'text-warning-700' : 'text-neutral-500'
                                        }`}>
                                        <div>Valid: {formatDate(deal.valid_from)} - {formatDate(deal.valid_to)}</div>
                                        {isExpiringSoon && <div className="mt-1 font-semibold">⚠️ Expiring Soon!</div>}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/markets/vendor/dashboard/deals/${deal.id}/edit`}
                                            className="flex-1 text-center px-4 py-2 bg-primary-50 text-primary-700 font-medium rounded-2xl hover:bg-primary-100 transition-colors text-sm"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleArchive(deal.id)}
                                            className="flex-1 px-4 py-2 bg-error-50 text-error-700 font-medium rounded-2xl hover:bg-error-100 transition-colors text-sm"
                                        >
                                            Archive
                                        </button>
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
