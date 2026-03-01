'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/contexts/AuthContext'
import { isAdminOrSuperUser } from '@/lib/auth/admin'
import { updateProperty, UpdatePropertyData, PropertyType } from '@/lib/actions/admin-crud'

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'condo', 'villa', 'commercial', 'land', 'other']

export default function AdminPropertyEditPageClient() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [imageInput, setImageInput] = useState('')

  const [formData, setFormData] = useState<UpdatePropertyData>({
    address: '',
    type: 'apartment',
    availability: 'available',
    price: 0,
    bedrooms: null,
    bathrooms: null,
    square_meters: null,
    description: '',
    images: [],
    is_active: true,
    owner_id: '',
  })

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      if (authLoading) return
      if (!user) { router.push('/auth/login'); return }

      try {
        const adminStatus = await isAdminOrSuperUser()
        setIsAdminUser(adminStatus)
        setIsChecking(false)
        if (!adminStatus) return

        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: rawData, error: fetchError } = await (supabase as any)
          .from('properties')
          .select('*')
          .eq('id', params.id as string)
          .single()
        const data = rawData as any

        if (fetchError) {
          setError(fetchError.message)
        } else {
          setProperty(data)
          setFormData({
            address: data.address || '',
            type: data.type || 'apartment',
            availability: data.availability || 'available',
            price: data.price || 0,
            bedrooms: data.bedrooms ?? null,
            bathrooms: data.bathrooms ?? null,
            square_meters: data.square_meters ?? null,
            description: data.description || '',
            images: data.images || [],
            is_active: data.is_active ?? true,
            owner_id: data.owner_id || '',
          })
        }
      } catch (err: any) {
        setIsAdminUser(false)
        setIsChecking(false)
        setError(err.message)
      }
    }

    checkAdminAndLoad()
  }, [user, authLoading, router, params.id])

  const addImage = () => {
    const trimmed = imageInput.trim()
    if (!trimmed) return
    setFormData({ ...formData, images: [...(formData.images || []), trimmed] })
    setImageInput('')
  }

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: (formData.images || []).filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await updateProperty(params.id as string, formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/markets/admin/properties'), 2000)
      } else {
        setError(result.error || 'Failed to update property')
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error updating property')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || isChecking) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Checking admin access...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!user) return null

  if (!isAdminUser) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Access Denied</h2>
            <p className="text-error-800 mb-4">You do not have admin privileges.</p>
            <Link href="/markets/admin/properties" className="text-primary-600 hover:underline">← Back to Properties</Link>
          </div>
        </div>
      </main>
    )
  }

  if (error && !property) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Property Not Found</h2>
            <p className="text-error-800 mb-4">{error}</p>
            <Link href="/markets/admin/properties" className="text-primary-600 hover:underline">← Back to Properties</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* GUARDRAIL: Admin form width constraint. All admin create/edit forms use max-w-4xl. */}
      <div className="container-custom max-w-4xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Edit Property</h1>
            <p className="text-neutral-600">{property?.address}</p>
          </div>
          <Link href="/markets/admin/properties" className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors">
            ← Back to Properties
          </Link>
        </div>

        {success && (
          <div className="mb-6 bg-success-50 border border-success-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success-900">Property Updated!</h3>
                <p className="text-success-700">Redirecting to properties list...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 rounded-xl p-4">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8">
          <div className="space-y-8">
            {/* Property Details */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
                    Address <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-2">
                    Property Type <span className="text-error-600">*</span>
                  </label>
                  <select
                    id="type"
                    required
                    value={formData.type || 'apartment'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-neutral-700 mb-2">
                    Availability
                  </label>
                  <input
                    id="availability"
                    type="text"
                    value={formData.availability || ''}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-2">
                    Price (₱) <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="price"
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formData.price ?? 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-neutral-700 mb-2">
                    Bedrooms
                  </label>
                  <input
                    id="bedrooms"
                    type="number"
                    min={0}
                    value={formData.bedrooms ?? ''}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-neutral-700 mb-2">
                    Bathrooms
                  </label>
                  <input
                    id="bathrooms"
                    type="number"
                    min={0}
                    step="0.5"
                    value={formData.bathrooms ?? ''}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="square_meters" className="block text-sm font-medium text-neutral-700 mb-2">
                    Floor Area (m²)
                  </label>
                  <input
                    id="square_meters"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.square_meters ?? ''}
                    onChange={(e) => setFormData({ ...formData, square_meters: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="owner_id" className="block text-sm font-medium text-neutral-700 mb-2">
                    Owner ID <span className="text-neutral-500 text-xs">(UUID)</span>
                  </label>
                  <input
                    id="owner_id"
                    type="text"
                    value={formData.owner_id || ''}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Image URLs */}
            <div className="border-t border-neutral-200 pt-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Images</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-3 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors whitespace-nowrap"
                  >
                    Add URL
                  </button>
                </div>
                {(formData.images || []).length > 0 && (
                  <ul className="space-y-2">
                    {(formData.images || []).map((url, i) => (
                      <li key={i} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-2">
                        <span className="flex-1 text-sm text-neutral-700 truncate">{url}</span>
                        <button type="button" onClick={() => removeImage(i)} className="text-error-600 hover:text-error-700 text-sm">
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Property...' : 'Update Property'}
              </button>
              <Link href="/markets/admin/properties" className="px-6 py-3 text-neutral-700 font-medium border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
