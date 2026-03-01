'use client'

import { useState, useEffect } from 'react'
import { createVendorAccount, CreateVendorAccountData } from '@/lib/auth/admin-vendor-creation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Agency {
  id: string
  name: string
  slug: string
}

export default function CreateVendorPageClient() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdAccount, setCreatedAccount] = useState<{
    userId: string
    vendorId: string
    vendorSlug: string
    email: string
  } | null>(null)
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('agencies')
      .select('id, name, slug')
      .order('name')
      .then(({ data }) => {
        if (data) setAgencies(data)
      })
  }, [])

  const [formData, setFormData] = useState<CreateVendorAccountData>({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    vendorName: '',
    agencyId: '',
    tagline: '',
    bio: '',
    contactEmail: '',
    contactPhone: '',
    category: '',
    websiteUrl: '',
    instagramHandle: '',
    facebookUrl: '',
    deliveryAvailable: false,
    pickupAvailable: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.email || !formData.password || !formData.fullName || !formData.vendorName) {
        setError('Please fill in all required fields (Email, Password, Full Name, Vendor Name)')
        setLoading(false)
        return
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        setLoading(false)
        return
      }

      // Validate and normalize URL fields only if they have a value
      const urlPattern = /^(https?:\/\/|www\.).+/i
      if (formData.websiteUrl && !urlPattern.test(formData.websiteUrl)) {
        setError('Website URL must start with http://, https://, or www.')
        setLoading(false)
        return
      }
      if (formData.facebookUrl && !urlPattern.test(formData.facebookUrl)) {
        setError('Facebook URL must start with http://, https://, or www.')
        setLoading(false)
        return
      }

      // Normalize URLs: prepend https:// if they start with www.
      const normalizedData = { ...formData }
      if (normalizedData.websiteUrl && normalizedData.websiteUrl.startsWith('www.')) {
        normalizedData.websiteUrl = 'https://' + normalizedData.websiteUrl
      }
      if (normalizedData.facebookUrl && normalizedData.facebookUrl.startsWith('www.')) {
        normalizedData.facebookUrl = 'https://' + normalizedData.facebookUrl
      }

      const result = await createVendorAccount(normalizedData)

      if (result.success && result.userId && result.vendorId && result.vendorSlug) {
        setSuccess(true)
        setCreatedAccount({
          userId: result.userId,
          vendorId: result.vendorId,
          vendorSlug: result.vendorSlug,
          email: formData.email,
        })
        // Reset form
        setFormData({
          email: '',
          password: '',
          fullName: '',
          phone: '',
          vendorName: '',
          agencyId: '',
          tagline: '',
          bio: '',
          contactEmail: '',
          contactPhone: '',
          category: '',
          websiteUrl: '',
          instagramHandle: '',
          facebookUrl: '',
          deliveryAvailable: false,
          pickupAvailable: true,
        })
      } else {
        setError(result.error || 'Failed to create vendor account')
      }
    } catch (err: any) {
      console.error('[CreateVendor] Error:', err)
      setError(err.message || 'Unexpected error creating vendor account')
    } finally {
      setLoading(false)
    }
  }

  if (success && createdAccount) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-success-50 border border-success-200 rounded-xl p-8 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-success-900">Vendor Account Created!</h2>
                  <p className="text-success-700">The vendor account has been successfully created.</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Account Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Email:</span>
                    <span className="font-medium text-neutral-900">{createdAccount.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Vendor Slug:</span>
                    <span className="font-medium text-neutral-900">/{createdAccount.vendorSlug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">User ID:</span>
                    <span className="font-mono text-xs text-neutral-500">{createdAccount.userId.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/markets/admin/vendors"
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                >
                  View All Vendors
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setCreatedAccount(null)
                  }}
                  className="px-6 py-3 bg-neutral-100 text-neutral-900 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">Create Vendor Account</h1>
              <p className="text-neutral-600">Create a new vendor account with user login credentials</p>
            </div>
            <Link
              href="/markets/admin/vendors"
              className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              ← Back to Vendors
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-error-50 border border-error-200 rounded-xl p-4">
              <p className="text-sm text-error-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8">
            <div className="space-y-8">
              {/* User Account Section */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">User Account</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email <span className="text-error-600">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="vendor@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                      Password <span className="text-error-600">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Minimum 8 characters"
                    />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name <span className="text-error-600">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>

              {/* Vendor Information Section */}
              <div className="border-t border-neutral-200 pt-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Vendor Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="vendorName" className="block text-sm font-medium text-neutral-700 mb-2">
                      Vendor Name <span className="text-error-600">*</span>
                    </label>
                    <input
                      id="vendorName"
                      type="text"
                      required
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Greenway Bakery"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="agencyId" className="block text-sm font-medium text-neutral-700 mb-2">
                      Agency
                    </label>
                    <select
                      id="agencyId"
                      value={formData.agencyId}
                      onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                      <option value="">— Auto-create new agency for this vendor —</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name} ({agency.slug})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-neutral-500 mt-1">
                      Leave as "Auto-create" to provision a new agency owned by this vendor.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="tagline" className="block text-sm font-medium text-neutral-700 mb-2">
                      Tagline
                    </label>
                    <input
                      id="tagline"
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Fresh baked goods daily"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us about your business..."
                    />
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-neutral-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="contact@vendor.com"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Defaults to user email if not provided</p>
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-neutral-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                      Category
                    </label>
                    <input
                      id="category"
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Food & Beverage"
                    />
                  </div>

                  <div>
                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-neutral-700 mb-2">
                      Website URL <span className="text-neutral-500 text-xs">(optional)</span>
                    </label>
                    <input
                      id="websiteUrl"
                      type="text"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://vendor.com or www.vendor.com (optional)"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Leave blank if vendor doesn't have a website. Accepts http://, https://, or www.</p>
                  </div>

                  <div>
                    <label htmlFor="instagramHandle" className="block text-sm font-medium text-neutral-700 mb-2">
                      Instagram Handle <span className="text-neutral-500 text-xs">(optional)</span>
                    </label>
                    <input
                      id="instagramHandle"
                      type="text"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="@vendorhandle (optional)"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Leave blank if vendor doesn't have Instagram</p>
                  </div>

                  <div>
                    <label htmlFor="facebookUrl" className="block text-sm font-medium text-neutral-700 mb-2">
                      Facebook URL <span className="text-neutral-500 text-xs">(optional)</span>
                    </label>
                    <input
                      id="facebookUrl"
                      type="text"
                      value={formData.facebookUrl}
                      onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://facebook.com/vendor or www.facebook.com/vendor (optional)"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Leave blank if vendor doesn't have Facebook. Accepts http://, https://, or www.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.deliveryAvailable}
                        onChange={(e) => setFormData({ ...formData, deliveryAvailable: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-neutral-700">Delivery Available</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pickupAvailable}
                        onChange={(e) => setFormData({ ...formData, pickupAvailable: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-neutral-700">Pickup Available</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Vendor Account'}
                </button>
                <Link
                  href="/markets/admin/vendors"
                  className="px-6 py-3 text-neutral-700 font-medium border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

