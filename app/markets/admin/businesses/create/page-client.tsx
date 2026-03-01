'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/contexts/AuthContext'
import { isAdminOrSuperUser } from '@/lib/auth/admin'
import { createBusiness, CreateBusinessData } from '@/lib/actions/admin-crud'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const emptyForm: CreateBusinessData = {
  name: '',
  slug: '',
  category: '',
  description: '',
  contact_phone: '',
  contact_email: '',
  address: '',
  website_url: '',
  logo_url: '',
  images: [],
  is_verified: false,
  is_active: true,
}

export default function AdminBusinessCreatePageClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<CreateBusinessData>(emptyForm)
  const [imageInput, setImageInput] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return
      if (!user) { router.push('/auth/login'); return }
      try {
        const adminStatus = await isAdminOrSuperUser()
        setIsAdminUser(adminStatus)
        setIsChecking(false)
        if (!adminStatus) router.push('/markets/admin')
      } catch (err: any) {
        setIsAdminUser(false)
        setIsChecking(false)
      }
    }
    checkAdmin()
  }, [user, authLoading, router])

  const handleNameChange = (name: string) => {
    const update: Partial<CreateBusinessData> = { name }
    if (!slugManuallyEdited) {
      update.slug = generateSlug(name)
    }
    setFormData({ ...formData, ...update })
  }

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    setFormData({ ...formData, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '') })
  }

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
      if (!formData.name || !formData.slug || !formData.category || !formData.contact_phone || !formData.address) {
        setError('Name, slug, category, phone, and address are required')
        setLoading(false)
        return
      }

      const urlPattern = /^(https?:\/\/|www\.).+/i
      if (formData.website_url && !urlPattern.test(formData.website_url)) {
        setError('Website URL must start with http://, https://, or www.')
        setLoading(false)
        return
      }

      const submitData = { ...formData }
      if (submitData.website_url?.startsWith('www.')) {
        submitData.website_url = 'https://' + submitData.website_url
      }

      const result = await createBusiness(submitData)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/markets/admin/businesses'), 2000)
      } else {
        setError(result.error || 'Failed to create business')
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error creating business')
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

  if (!user || !isAdminUser) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Access Denied</h2>
            <p className="text-error-800 mb-4">You do not have admin privileges.</p>
            <Link href="/markets/admin" className="text-primary-600 hover:underline">← Back to Dashboard</Link>
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
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Add Business</h1>
            <p className="text-neutral-600">Create a new business directory listing</p>
          </div>
          <Link href="/markets/admin/businesses" className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors">
            ← Back to Businesses
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
                <h3 className="text-lg font-semibold text-success-900">Business Created!</h3>
                <p className="text-success-700">Redirecting to businesses list...</p>
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
            {/* Business Information */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Name <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Sunrise Coffee Roasters"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="slug" className="block text-sm font-medium text-neutral-700 mb-2">
                    URL Slug <span className="text-error-600">*</span>
                  </label>
                  <div className="flex items-center border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent overflow-hidden">
                    <span className="px-4 py-3 bg-neutral-50 text-neutral-500 text-sm border-r border-neutral-300 whitespace-nowrap">/businesses/</span>
                    <input
                      id="slug"
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="flex-1 px-4 py-3 focus:outline-none"
                      placeholder="sunrise-coffee-roasters"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Auto-generated from name. Only lowercase letters, numbers, and hyphens.</p>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                    Category <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="category"
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Food & Beverage"
                  />
                </div>

                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-neutral-700 mb-2">
                    Contact Phone <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="contact_phone"
                    type="tel"
                    required
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Contact Email <span className="text-neutral-500 text-xs">(optional)</span>
                  </label>
                  <input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="hello@business.com"
                  />
                </div>

                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-neutral-700 mb-2">
                    Website URL <span className="text-neutral-500 text-xs">(optional)</span>
                  </label>
                  <input
                    id="website_url"
                    type="text"
                    value={formData.website_url || ''}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://business.com or www.business.com"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Accepts http://, https://, or www.</p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
                    Address <span className="text-error-600">*</span>
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="123 Market Street, Cebu City"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="logo_url" className="block text-sm font-medium text-neutral-700 mb-2">
                    Logo URL <span className="text-neutral-500 text-xs">(optional)</span>
                  </label>
                  <input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url || ''}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
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
                    placeholder="Tell us about this business..."
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_verified ?? false}
                      onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">Verified</span>
                  </label>

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
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Gallery Images</h2>
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
                  <button type="button" onClick={addImage} className="px-4 py-3 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors whitespace-nowrap">
                    Add URL
                  </button>
                </div>
                {(formData.images || []).length > 0 && (
                  <ul className="space-y-2">
                    {(formData.images || []).map((url, i) => (
                      <li key={i} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-2">
                        <span className="flex-1 text-sm text-neutral-700 truncate">{url}</span>
                        <button type="button" onClick={() => removeImage(i)} className="text-error-600 hover:text-error-700 text-sm">Remove</button>
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
                {loading ? 'Creating Business...' : 'Create Business'}
              </button>
              <Link href="/markets/admin/businesses" className="px-6 py-3 text-neutral-700 font-medium border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
