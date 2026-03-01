'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessInput } from '@/lib/actions/admin-businesses'

interface BusinessFormProps {
    initialData?: Partial<BusinessInput> & { id?: string }
    onSubmit: (data: BusinessInput) => Promise<any>
    title: string
}

export default function BusinessForm({ initialData, onSubmit, title }: BusinessFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<BusinessInput>({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        location_text: initialData?.location_text || '',
        tags: initialData?.tags || [],
        logo_url: initialData?.logo_url || '',
        hero_image_url: initialData?.hero_image_url || '',
        confidence_score: initialData?.confidence_score || 70,
        owner_id: initialData?.owner_id || '',
    })

    const [hasConfirmedReassignment, setHasConfirmedReassignment] = useState(false)
    const isOwnerChanged = initialData?.id ? (formData.owner_id !== (initialData.owner_id || '')) : false

    const [tagInput, setTagInput] = useState('')

    const generateSlug = useCallback((name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }, [])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        setFormData(prev => ({
            ...prev,
            name,
            slug: prev.slug === generateSlug(prev.name) ? generateSlug(name) : prev.slug
        }))
    }

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()]
            }))
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tagToRemove)
        }))
    }

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
            // Omit empty UUID fields so the DB doesn't receive invalid "" values
            const submissionData = {
                ...formData,
                owner_id: formData.owner_id || undefined,
            }
            await onSubmit(submissionData)
            router.push('/markets/admin/businesses')
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Business Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleNameChange}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="e.g. Sunny Deli"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">URL Slug</label>
                            <input
                                type="text"
                                name="slug"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="e.g. sunny-deli"
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
                            placeholder="Tell us about this business..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700">Location / Address</label>
                        <input
                            type="text"
                            name="location_text"
                            value={formData.location_text || ''}
                            onChange={(e) => setFormData(p => ({ ...p, location_text: e.target.value }))}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="e.g. 123 Market St, San Francisco"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700">Tags / Categories</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Add a tag..."
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags?.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-primary-900"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
                    <h3 className="text-xl font-bold text-neutral-900">Media</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Logo URL</label>
                            <input
                                type="text"
                                value={formData.logo_url || ''}
                                onChange={(e) => setFormData(p => ({ ...p, logo_url: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Hero Image URL</label>
                            <input
                                type="text"
                                value={formData.hero_image_url || ''}
                                onChange={(e) => setFormData(p => ({ ...p, hero_image_url: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
                    <h3 className="text-xl font-bold text-neutral-900">Admin Controls</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Owner User ID</label>
                            <input
                                type="text"
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
                                        I confirm I am reassigning ownership of this business.
                                    </span>
                                </label>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Confidence Score (0-100)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.confidence_score}
                                onChange={(e) => setFormData(p => ({ ...p, confidence_score: parseInt(e.target.value) }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
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
                        className="px-10 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Business'}
                    </button>
                </div>
            </form>
        </div>
    )
}
