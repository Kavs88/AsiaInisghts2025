'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Event {
    id: string
    title: string
    description: string | null
    start_at: string
    end_at: string
    status: 'draft' | 'published' | 'archived'
    created_at: string
}

export default function VendorEventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/vendor/events')
            if (!res.ok) throw new Error('Failed to fetch events')
            const data = await res.json()
            setEvents(data.events || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Archive this event?')) return

        try {
            const res = await fetch(`/api/vendor/events/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to archive event')
            fetchEvents() // Refresh list
        } catch (err: any) {
            alert('Error: ' + err.message)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 mb-2">
                            My Events
                        </h1>
                        <p className="text-neutral-600">
                            Manage your events and community gatherings
                        </p>
                    </div>
                    <Link
                        href="/markets/vendor/dashboard/events/create"
                        className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        Create Event
                    </Link>
                </div>

                {/* Quick Stats */}
                {events.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                            <div className="text-sm text-neutral-600 mb-1">Published</div>
                            <div className="text-2xl font-black text-success-600">
                                {events.filter(e => e.status === 'published').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                            <div className="text-sm text-neutral-600 mb-1">Drafts</div>
                            <div className="text-2xl font-black text-warning-600">
                                {events.filter(e => e.status === 'draft').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                            <div className="text-sm text-neutral-600 mb-1">Archived</div>
                            <div className="text-2xl font-black text-neutral-400">
                                {events.filter(e => e.status === 'archived').length}
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {events.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-neutral-900 mb-2">
                                Create Your First Event
                            </h2>
                            <p className="text-neutral-600 mb-6">
                                Host workshops, tastings, or special gatherings at your venue
                            </p>
                            <Link
                                href="/markets/vendor/dashboard/events/create"
                                className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                            >
                                Create Event
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">Event</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">Start Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">Status</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-neutral-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-neutral-900">{event.title}</div>
                                            {event.description && (
                                                <div className="text-sm text-neutral-600 line-clamp-1">{event.description}</div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-neutral-700 text-sm">
                                            {formatDate(event.start_at)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${event.status === 'published' ? 'bg-success-50 text-success-700' :
                                                    event.status === 'draft' ? 'bg-warning-50 text-warning-700' :
                                                        'bg-neutral-100 text-neutral-600'
                                                }`}>
                                                {event.status === 'published' && (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                {event.status === 'draft' && (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                )}
                                                {event.status === 'archived' && (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                    </svg>
                                                )}
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-3">
                                            <Link
                                                href={`/markets/vendor/dashboard/events/${event.id}/edit`}
                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="text-error-600 hover:text-error-700 text-sm font-medium"
                                            >
                                                Archive
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
