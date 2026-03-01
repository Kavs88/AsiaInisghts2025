'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyInput } from '@/lib/actions/admin-properties'

interface PropertyFormProps {
    initialData?: Partial<PropertyInput> & { id?: string }
    onSubmit: (data: PropertyInput) => Promise<any>
    title: string
}

export default function PropertyForm({ initialData, onSubmit, title }: PropertyFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<PropertyInput>({
        address: initialData?.address || '',
        type: initialData?.type || 'commercial',
        availability: initialData?.availability || 'available',
        price: initialData?.price || 0,
        bedrooms: initialData?.bedrooms || 0,
        bathrooms: initialData?.bathrooms || 0,
        square_meters: initialData?.square_meters || 0,
        description: initialData?.description || '',
        contact_phone: initialData?.contact_phone || '',
        contact_email: initialData?.contact_email || '',
        is_active: initialData?.is_active ?? true,
        owner_id: initialData?.owner_id || '',
        images: initialData?.images || [],
    })

    const [hasConfirmedReassignment, setHasConfirmedReassignment] = useState(false)
    const isOwnerChanged = initialData?.id ? (formData.owner_id !== (initialData.owner_id || '')) : false

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
            const submissionData = {
                ...formData,
                owner_id: formData.owner_id || undefined,
            }
            await onSubmit(submissionData)
            router.push('/markets/admin/properties')
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
                        <label className="text-sm font-bold text-neutral-700">Property Address</label>
                        <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="e.g. 123 Sunset Blvd, Suite 10"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Property Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as any }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            >
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="condo">Condo</option>
                                <option value="villa">Villa</option>
                                <option value="commercial">Commercial</option>
                                <option value="land">Land</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Availability Status</label>
                            <select
                                name="availability"
                                value={formData.availability}
                                onChange={(e) => setFormData(p => ({ ...p, availability: e.target.value as any }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            >
                                <option value="available">Available</option>
                                <option value="rented">Rented</option>
                                <option value="sold">Sold</option>
                                <option value="pending">Pending</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Price (USD)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData(p => ({ ...p, price: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Square Meters</label>
                            <input
                                type="number"
                                name="square_meters"
                                min="0"
                                value={formData.square_meters}
                                onChange={(e) => setFormData(p => ({ ...p, square_meters: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Bedrooms</label>
                            <input
                                type="number"
                                name="bedrooms"
                                min="0"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData(p => ({ ...p, bedrooms: parseInt(e.target.value) }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Bathrooms</label>
                            <input
                                type="number"
                                name="bathrooms"
                                min="0"
                                step="0.5"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData(p => ({ ...p, bathrooms: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                            placeholder="Tell us about this property..."
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
                    <h3 className="text-xl font-bold text-neutral-900">Contact & Admin</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Contact Email</label>
                            <input
                                type="email"
                                name="contact_email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData(p => ({ ...p, contact_email: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Contact Phone</label>
                            <input
                                type="tel"
                                name="contact_phone"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Owner User ID</label>
                            <input
                                type="text"
                                name="owner_id"
                                required
                                value={formData.owner_id || ''}
                                onChange={(e) => setFormData(p => ({ ...p, owner_id: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="UUID of the owner"
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
                                        I confirm I am reassigning ownership of this property.
                                    </span>
                                </label>
                            </div>
                        )}
                        <div className="flex items-center pt-8">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                                    className="w-5 h-5 text-secondary-600 border-neutral-300 rounded focus:ring-secondary-500 focus:ring-2 focus:ring-offset-1"
                                />
                                <span className="text-sm font-bold text-neutral-700">Property is Active</span>
                            </label>
                        </div>
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
                        className="px-10 py-3 bg-secondary-600 text-white rounded-2xl font-bold hover:bg-secondary-700 disabled:opacity-50 transition-all shadow-lg shadow-secondary-200"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Property'}
                    </button>
                </div>
            </form>
        </div>
    )
}
