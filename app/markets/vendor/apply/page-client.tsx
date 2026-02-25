'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { uploadVendorLogo, uploadVendorHero, validateImageFile } from '@/lib/supabase/storage'
import { useAuth } from '@/components/contexts/AuthContext'

// Note: This component requires AuthProvider in layout

interface FormData {
  name: string
  slug: string
  tagline: string
  bio: string
  category: string
  contactEmail: string
  contactPhone: string
  websiteUrl: string
  instagramHandle: string
  deliveryAvailable: boolean
  pickupAvailable: boolean
}

export default function VendorApplyPageClient() {
  const router = useRouter()
  const { user, refresh } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    tagline: '',
    bio: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    instagramHandle: '',
    deliveryAvailable: false,
    pickupAvailable: true,
  })

  // Image state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [heroPreview, setHeroPreview] = useState<string | null>(null)
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

  // Handle name change and auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }))
  }

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!user) {
        setError('You must be logged in to apply as a vendor')
        setIsSubmitting(false)
        return
      }

      const supabase = createClient()

      // Check if user already has a vendor account
      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingVendor) {
        setError('You already have a vendor account')
        setIsSubmitting(false)
        return
      }

      // Validate URL format if provided
      const urlPattern = /^(https?:\/\/|www\.).+/i
      if (formData.websiteUrl && !urlPattern.test(formData.websiteUrl)) {
        setError('Website URL must start with http://, https://, or www.')
        setIsSubmitting(false)
        return
      }

      // Normalize URLs: prepend https:// if they start with www.
      let websiteUrl = formData.websiteUrl || null
      if (websiteUrl && websiteUrl.startsWith('www.')) {
        websiteUrl = 'https://' + websiteUrl
      }

      // Create vendor record first (we need the ID for image uploads)
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        // @ts-ignore
        .insert({
          user_id: user.id,
          name: formData.name,
          slug: formData.slug,
          tagline: formData.tagline || null,
          bio: formData.bio || null,
          category: formData.category || null,
          contact_email: formData.contactEmail || null,
          contact_phone: formData.contactPhone || null,
          website_url: websiteUrl,
          instagram_handle: formData.instagramHandle || null,
          delivery_available: formData.deliveryAvailable,
          pickup_available: formData.pickupAvailable,
          is_active: false, // Requires admin approval
        })
        .select()
        .single()

      const vendor = vendorData as any

      if (vendorError || !vendor) {
        throw new Error(vendorError?.message || 'Failed to create vendor account')
      }

      // Upload images if provided
      let logoUrl = null
      let heroImageUrl = null

      if (logoFile && vendor.id) {
        const logoResult = await uploadVendorLogo(vendor.id, logoFile)
        if (logoResult.error) {
          console.error('Logo upload error:', logoResult.error)
          // Continue even if logo upload fails
        } else {
          logoUrl = logoResult.url
        }
      }

      if (heroFile && vendor.id) {
        const heroResult = await uploadVendorHero(vendor.id, heroFile)
        if (heroResult.error) {
          console.error('Hero upload error:', heroResult.error)
          // Continue even if hero upload fails
        } else {
          heroImageUrl = heroResult.url
        }
      }

      // Update vendor with image URLs if uploaded
      if (logoUrl || heroImageUrl) {
        await supabase
          .from('vendors')
          // @ts-ignore
          .update({
            logo_url: logoUrl,
            hero_image_url: heroImageUrl,
          })
          .eq('id', vendor.id)
      }

      // Update user role to vendor
      await supabase
        .from('users')
        // @ts-ignore
        .update({ role: 'vendor' })
        .eq('id', user.id)

      setSuccess(true)
      await refresh()

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/vendor/dashboard')
      }, 2000)
    } catch (err: any) {
      console.error('Vendor application error:', err)
      setError(err.message || 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="container-custom max-w-2xl py-16">
        <div className="bg-white rounded-2xl shadow-soft p-8 lg:p-12 text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-success-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-4">Application Submitted!</h2>
          <p className="text-neutral-600 mb-8">
            Your vendor application has been submitted successfully. We'll review it and get back to you soon.
          </p>
          <p className="text-sm text-neutral-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom max-w-4xl py-12">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <h2 className="text-2xl font-black text-neutral-900 mb-6">Business Information</h2>

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
                onChange={handleNameChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="e.g., Luna Ceramics"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-neutral-900 mb-2">
                URL Slug <span className="text-error-600">*</span>
              </label>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="e.g., luna-ceramics"
              />
              <p className="mt-1 text-sm text-neutral-500">
                This will be your profile URL: /sellers/{formData.slug || 'your-slug'}
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
                placeholder="e.g., Handmade ceramics from small-batch kiln"
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
                placeholder="Tell customers about your business, your story, and what makes you unique..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <h2 className="text-2xl font-black text-neutral-900 mb-6">Images</h2>

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
                        setLogoPreview(null)
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
                        setHeroPreview(null)
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
          <h2 className="text-2xl font-black text-neutral-900 mb-6">Contact Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-semibold text-neutral-900 mb-2">
                Contact Email <span className="text-neutral-500 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="email"
                id="contactEmail"
                value={formData.contactEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="contact@yourbusiness.com (optional)"
              />
              <p className="text-xs text-neutral-500 mt-1">Defaults to your account email if not provided</p>
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-semibold text-neutral-900 mb-2">
                Contact Phone <span className="text-neutral-500 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="+1 (555) 123-4567 (optional)"
              />
              <p className="text-xs text-neutral-500 mt-1">Leave blank if you prefer not to share</p>
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-semibold text-neutral-900 mb-2">
                Website URL <span className="text-neutral-500 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="https://yourwebsite.com or www.yourwebsite.com (optional)"
              />
              <p className="text-xs text-neutral-500 mt-1">Leave blank if you don't have a website. Accepts http://, https://, or www.</p>
            </div>

            <div>
              <label htmlFor="instagramHandle" className="block text-sm font-semibold text-neutral-900 mb-2">
                Instagram Handle <span className="text-neutral-500 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="instagramHandle"
                value={formData.instagramHandle}
                onChange={(e) => setFormData((prev) => ({ ...prev, instagramHandle: e.target.value.replace('@', '') }))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="@yourhandle (optional)"
              />
              <p className="text-xs text-neutral-500 mt-1">Leave blank if you don't have Instagram</p>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <h2 className="text-2xl font-black text-neutral-900 mb-6">Delivery Options</h2>

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
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  )
}

