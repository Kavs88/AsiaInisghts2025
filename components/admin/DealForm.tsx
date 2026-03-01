'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DealInput } from '@/lib/actions/admin-deals'
import { createClient } from '@/lib/supabase/client'

interface DealFormProps {
    initialData?: Partial<DealInput> & { id?: string }
    onSubmit: (data: DealInput) => Promise<any>
    title: string
}

export default function DealForm({ initialData, onSubmit, title }: DealFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [vendors, setVendors] = useState<any[]>([])

    const [formData, setFormData] = useState<DealInput>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        vendor_id: initialData?.vendor_id || '',
        valid_from: initialData?.valid_from ? new Date(initialData.valid_from).toISOString().slice(0, 16) : '',
        valid_to: initialData?.valid_to ? new Date(initialData.valid_to).toISOString().slice(0, 16) : '',
        status: initialData?.status || 'active',
    })

    useEffect(() => {
        const fetchVendors = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('vendors')
                .select('id, name')
                .order('name')

            if (data) setVendors(data)
        }
        fetchVendors()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const submissionData = {
                ...formData,
                valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : undefined,
                valid_to: formData.valid_to ? new Date(formData.valid_to).toISOString() : undefined,
            }
            await onSubmit(submissionData)
            router.push('/markets/admin/deals')
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
                        <label className="text-sm font-bold text-neutral-700">Deal Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="e.g. 20% off all organic products"
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
                            placeholder="Details about the offer..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Vendor / Seller</label>
                            <select
                                required
                                value={formData.vendor_id}
                                onChange={(e) => setFormData(p => ({ ...p, vendor_id: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            >
                                <option value="">-- Select Vendor --</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
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
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Valid From</label>
                            <input
                                type="datetime-local"
                                value={formData.valid_from}
                                onChange={(e) => setFormData(p => ({ ...p, valid_from: e.target.value }))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Valid To</label>
                            <input
                                type="datetime-local"
                                value={formData.valid_to}
                                onChange={(e) => setFormData(p => ({ ...p, valid_to: e.target.value }))}
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
                        {isSubmitting ? 'Saving...' : 'Save Deal'}
                    </button>
                </div>
            </form>
        </div>
    )
}
