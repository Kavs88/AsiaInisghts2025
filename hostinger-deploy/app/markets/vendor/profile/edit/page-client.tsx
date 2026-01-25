'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { uploadVendorLogo, uploadVendorHero, validateImageFile, deleteImage } from '@/lib/supabase/storage'
import { submitVendorChangeRequest } from '@/app/actions/vendor-change-requests'

interface Vendor {
  id: string
  name: string
  slug: string
  tagline: string
  bio: string
  category: string
  logoUrl: string | null
  heroImageUrl: string | null
  contactEmail: string
  contactPhone: string
  websiteUrl: string
  instagramHandle: string
  deliveryAvailable: boolean
  pickupAvailable: boolean
}

interface VendorProfileEditClientProps {
  vendor: Vendor
}

export default function VendorProfileEditClient({ vendor: initialVendor }: VendorProfileEditClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<Vendor>(initialVendor)

  // Image state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialVendor.logoUrl)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [heroPreview, setHeroPreview] = useState<string | null>(initialVendor.heroImageUrl)
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

  // Generate slug from name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }, [])

  // Handle image file selection
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setLogoUploadError(validation.error || 'Invalid file')
      return
    }

    setLogoFile(file)
    setLogoUploadError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleHeroSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setHeroUploadError(validation.error || 'Invalid file')
      return
    }

    setHeroFile(file)
    setHeroUploadError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setHeroPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle form submission - now submits a change request instead of direct update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Upload new images if provided
      let logoUrl = formData.logoUrl
      let heroImageUrl = formData.heroImageUrl

      if (logoFile) {
        const logoResult = await uploadVendorLogo(formData.id, logoFile)
        if (logoResult.error) {
          console.error('Logo upload error:', logoResult.error)
        } else {
          // Delete old logo if it exists and is different
          if (formData.logoUrl && formData.logoUrl !== logoResult.url) {
            const oldPath = formData.logoUrl.split('/').slice(-2).join('/')
            await deleteImage('vendor-assets', oldPath).catch(console.error)
          }
          logoUrl = logoResult.url
        }
      }

      if (heroFile) {
        const heroResult = await uploadVendorHero(formData.id, heroFile)
        if (heroResult.error) {
          console.error('Hero upload error:', heroResult.error)
        } else {
          // Delete old hero if it exists and is different
          if (formData.heroImageUrl && formData.heroImageUrl !== heroResult.url) {
            const oldPath = formData.heroImageUrl.split('/').slice(-2).join('/')
            await deleteImage('vendor-assets', oldPath).catch(console.error)
          }
          heroImageUrl = heroResult.url
        }
      }

      // Build requested changes object (only include fields that changed)
      const requestedChanges: Record<string, any> = {}
      
      // Compare with initial values and only include changed fields
      if (formData.name !== initialVendor.name) {
        requestedChanges.name = formData.name
      }
      if (formData.tagline !== initialVendor.tagline) {
        requestedChanges.tagline = formData.tagline || null
      }
      if (formData.bio !== initialVendor.bio) {
        requestedChanges.bio = formData.bio || null
      }
      if (formData.category !== initialVendor.category) {
        requestedChanges.category = formData.category || null
      }
      if (logoUrl !== initialVendor.logoUrl) {
        requestedChanges.logo_url = logoUrl
      }
      if (heroImageUrl !== initialVendor.heroImageUrl) {
        requestedChanges.hero_image_url = heroImageUrl
      }
      if (formData.contactEmail !== initialVendor.contactEmail) {
        requestedChanges.contact_email = formData.contactEmail || null
      }
      if (formData.contactPhone !== initialVendor.contactPhone) {
        requestedChanges.contact_phone = formData.contactPhone || null
      }
      if (formData.websiteUrl !== initialVendor.websiteUrl) {
        requestedChanges.website_url = formData.websiteUrl || null
      }
      if (formData.instagramHandle !== initialVendor.instagramHandle) {
        requestedChanges.instagram_handle = formData.instagramHandle || null
      }
      if (formData.deliveryAvailable !== initialVendor.deliveryAvailable) {
        requestedChanges.delivery_available = formData.deliveryAvailable
      }
      if (formData.pickupAvailable !== initialVendor.pickupAvailable) {
        requestedChanges.pickup_available = formData.pickupAvailable
      }

      // Note: slug is NOT included - vendors cannot request slug changes (admin-only)

      // Submit change request
      const result = await submitVendorChangeRequest(formData.id, requestedChanges)

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit change request')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/vendor/dashboard')
      }, 2000)
    } catch (err: any) {
      console.error('Change request submission error:', err)
      setError(err.message || 'Failed to submit change request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Review Process Explanation */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary-900 mb-1">Profile Changes Require Review</h3>
            <p className="text-sm text-primary-800">
              You cannot directly edit your live profile. All changes must be reviewed and approved by an administrator. This process helps maintain quality and trust in our marketplace, ensuring accurate information for all customers.
            </p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Business Information</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-neutral-900 mb-2">
              Business Name <span className="text-error-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-neutral-900 mb-2">
              URL Slug
            </label>
            <input
              type="text"
              id="slug"
              disabled
              value={formData.slug}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-neutral-50 text-neutral-500 cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Profile URL: /sellers/{formData.slug}
            </p>
            <p className="mt-1 text-xs text-warning-600">
              ⚠️ Slug changes require admin approval. Contact support if you need to change your URL.
            </p>
          </div>

          <div>
            <label htmlFor="tagline" className="block text-sm font-semibold text-neutral-900 mb-2">
              Tagline
            </label>
            <input
              type="text"
              id="tagline"
              value={formData.tagline}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-neutral-900 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            >
              <option value="">Select a category</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Arts & Crafts">Arts & Crafts</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Fashion & Accessories">Fashion & Accessories</option>
              <option value="Health & Beauty">Health & Beauty</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-neutral-900 mb-2">
              About Your Business
            </label>
            <textarea
              id="bio"
              rows={6}
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Images</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Logo
            </label>
            <div className="space-y-3">
              {logoPreview ? (
                <div className="relative w-full aspect-square max-w-48 bg-neutral-50 rounded-xl overflow-hidden border-2 border-neutral-200">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain p-4"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(initialVendor.logoUrl)
                      if (logoInputRef.current) logoInputRef.current.value = ''
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                    aria-label="Remove logo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="relative w-full aspect-square max-w-48 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors flex items-center justify-center"
                >
                  <div className="text-center p-4">
                    <svg className="w-12 h-12 mx-auto text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-neutral-600">Click to upload</p>
                  </div>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleLogoSelect}
                className="hidden"
              />
              {logoUploadError && (
                <p className="text-sm text-error-600">{logoUploadError}</p>
              )}
              <p className="text-xs text-neutral-500">Square image recommended. Max 5MB.</p>
            </div>
          </div>

          {/* Hero Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Hero/Banner Image
            </label>
            <div className="space-y-3">
              {heroPreview ? (
                <div className="relative w-full aspect-video max-w-full bg-neutral-50 rounded-xl overflow-hidden border-2 border-neutral-200">
                  <Image
                    src={heroPreview}
                    alt="Hero preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setHeroFile(null)
                      setHeroPreview(initialVendor.heroImageUrl)
                      if (heroInputRef.current) heroInputRef.current.value = ''
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                    aria-label="Remove hero image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => heroInputRef.current?.click()}
                  className="relative w-full aspect-video bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors flex items-center justify-center"
                >
                  <div className="text-center p-4">
                    <svg className="w-12 h-12 mx-auto text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-neutral-600">Click to upload</p>
                  </div>
                </div>
              )}
              <input
                ref={heroInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleHeroSelect}
                className="hidden"
              />
              {heroUploadError && (
                <p className="text-sm text-error-600">{heroUploadError}</p>
              )}
              <p className="text-xs text-neutral-500">Wide image recommended (16:9). Max 5MB.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Contact Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-semibold text-neutral-900 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              value={formData.contactEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="contactPhone" className="block text-sm font-semibold text-neutral-900 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-semibold text-neutral-900 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="instagramHandle" className="block text-sm font-semibold text-neutral-900 mb-2">
              Instagram Handle
            </label>
            <input
              type="text"
              id="instagramHandle"
              value={formData.instagramHandle}
              onChange={(e) => setFormData((prev) => ({ ...prev, instagramHandle: e.target.value.replace('@', '') }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="@yourhandle"
            />
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Delivery Options</h2>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.pickupAvailable}
              onChange={(e) => setFormData((prev) => ({ ...prev, pickupAvailable: e.target.checked }))}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2 focus:ring-offset-1 cursor-pointer"
            />
            <span className="text-base text-neutral-700 group-hover:text-neutral-900 transition-colors">
              Pickup Available
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.deliveryAvailable}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveryAvailable: e.target.checked }))}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2 focus:ring-offset-1 cursor-pointer"
            />
            <span className="text-base text-neutral-700 group-hover:text-neutral-900 transition-colors">
              Delivery Available
            </span>
          </label>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-success-50 border border-success-200 rounded-xl p-4">
          <p className="text-success-700 font-medium">
            Change request submitted successfully! An admin will review your request shortly. Redirecting to dashboard...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-xl p-4">
          <p className="text-error-700 font-medium">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-base font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 text-base font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting Request...' : 'Submit Change Request'}
        </button>
      </div>
    </form>
  )
}

