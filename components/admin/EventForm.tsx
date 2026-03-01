'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EventInput } from '@/lib/actions/admin-events'
import { createClient } from '@/lib/supabase/client'

interface EventFormProps {
    initialData?: Partial<EventInput> & { id?: string }
    onSubmit: (data: EventInput) => Promise<any>
    title: string
}

export default function EventForm({ initialData, onSubmit, title }: EventFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [properties, setProperties] = useState<any[]>([])

    const [formData, setFormData] = useState<EventInput>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        event_type: initialData?.event_type || 'market',
        start_at: initialData?.start_at ? new Date(initialData.start_at).toISOString().slice(0, 16) : '',
        end_at: initialData?.end_at ? new Date(initialData.end_at).toISOString().slice(0, 16) : '',
        status: initialData?.status || 'draft',
        property_id: initialData?.property_id || null,
        location: (initialData as any)?.location || '',
        organizer_id: initialData?.organizer_id || '',
    })

    const [hasConfirmedReassignment, setHasConfirmedReassignment] = useState(false)
    const isOwnerChanged = initialData?.id ? (formData.organizer_id !== (initialData.organizer_id || '')) : false

    useEffect(() => {
        const fetchProperties = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('properties')
                .select('id, address')
                .eq('is_active', true)
                .order('address')

            if (data) setProperties(data)
        }
        fetchProperties()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        if (isOwnerChanged && !hasConfirmedReassignment) {
            setError('Please confirm that you are reassigning ownership.')
            setIsSubmitting(false)
            return
        }

        try {
            // Convert local datetime to ISO; omit empty UUID fields
            const submissionData = {
                ...formData,
                start_at: new Date(formData.start_at).toISOString(),
                end_at: new Date(formData.end_at).toISOString(),
                organizer_id: formData.organizer_id || undefined,
                property_id: formData.property_id || null,
            }
            await onSubmit(submissionData)
            router.push('/markets/admin/events')
        } catch (err: any) {
            setError(err.message || 'An error occurred during submission')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-3xl font-black text-neutral-900">{title}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700">Event Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="e.g. Saturday Night Market"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                            placeholder="What's happening at this event?"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Event Type</label>
                            <select
                                name="event_type"
                                value={formData.event_type}
                                onChange={(e) => setFormData(p => ({ ...p, event_type: e.target.value as any }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            >
                                <option value="market">Market</option>
                                <option value="pantry">Pantry</option>
                                <option value="workshop">Workshop</option>
                                <option value="gathering">Gathering</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Start Time</label>
                            <input
                                type="datetime-local"
                                name="start_at"
                                required
                                value={formData.start_at}
                                onChange={(e) => setFormData(p => ({ ...p, start_at: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">End Time (Optional)</label>
                            <input
                                type="datetime-local"
                                name="end_at"
                                value={formData.end_at}
                                onChange={(e) => setFormData(p => ({ ...p, end_at: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
                    <h3 className="text-xl font-bold text-neutral-900">Venue Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Select Property (Venue)</label>
                            <select
                                value={formData.property_id || ''}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setFormData(p => ({ ...p, property_id: val || null }))
                                    const prop = properties.find(p => p.id === val)
                                    if (prop) {
                                        setFormData(p => ({ ...p, location: prop.address }))
                                    }
                                }}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            >
                                <option value="">-- No Property Linked --</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.address}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Venue / Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location || ''}
                                onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="UUID of the host user"
                            />
                        </div>
                        {isOwnerChanged && (
                            <div className="col-span-1 md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasConfirmedReassignment}
                                        onChange={(e) => setHasConfirmedReassignment(e.target.checked)}
                                        className="w-5 h-5 text-amber-600 border-neutral-300 rounded focus:ring-amber-500 focus:ring-2"
                                    />
                                    <span className="text-sm font-bold text-amber-900">
                                        I confirm I am reassigning ownership of this event.
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
                    <h3 className="text-xl font-bold text-neutral-900">Admin Controls</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700">Organizer User ID</label>
                        <input
                            type="text"
                            value={formData.organizer_id || ''}
                            onChange={(e) => setFormData(p => ({ ...p, organizer_id: e.target.value }))}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="UUID of the organizer"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-error-50 border border-error-100 rounded-2xl text-error-600 font-medium text-center">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold hover:bg-neutral-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-10 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Event'}
                    </button>
                </div>
            </form>
        </div>
    )
}
