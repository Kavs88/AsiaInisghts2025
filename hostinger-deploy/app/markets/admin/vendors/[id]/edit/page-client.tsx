'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/contexts/AuthContext'
import { isAdminOrSuperUser } from '@/lib/auth/admin'
import { updateVendor, UpdateVendorData } from '@/lib/auth/admin-vendor-creation'
import { uploadVendorLogo, uploadVendorHero, validateImageFile, deleteImage } from '@/lib/supabase/storage'
import Link from 'next/link'

export default function AdminVendorEditPageClient() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [vendor, setVendor] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Image state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [heroPreview, setHeroPreview] = useState<string | null>(null)
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<UpdateVendorData>({
    vendorName: '',
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
    isActive: true,
    isVerified: false,
  })

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const adminStatus = await isAdminOrSuperUser()
        setIsAdminUser(adminStatus)
        setIsChecking(false)

        if (!adminStatus) {
          return
        }

        // Fetch vendor
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', params.id as string)
          .single()

        if (vendorError) {
          setError(vendorError.message)
        } else {
          const vendorData = data as any
          setVendor(vendorData)
          // Set image previews from existing vendor data
          setLogoPreview(vendorData.logo_url)
          setHeroPreview(vendorData.hero_image_url)
          // Pre-fill form with vendor data
          setFormData({
            vendorName: vendorData.name || '',
            tagline: vendorData.tagline || '',
            bio: vendorData.bio || '',
            contactEmail: vendorData.contact_email || '',
            contactPhone: vendorData.contact_phone || '',
            category: vendorData.category || '',
            websiteUrl: vendorData.website_url || '',
            instagramHandle: vendorData.instagram_handle || '',
            facebookUrl: vendorData.facebook_url || '',
            deliveryAvailable: vendorData.delivery_available || false,
            pickupAvailable: vendorData.pickup_available !== undefined ? vendorData.pickup_available : true,
            isActive: vendorData.is_active !== undefined ? vendorData.is_active : true,
            isVerified: vendorData.is_verified || false,
          })
        }
      } catch (err: any) {
        console.error('[AdminVendorEdit] Error:', err)
        setIsAdminUser(false)
        setIsChecking(false)
        setError(err.message)
      }
    }

    checkAdminAndLoad()
  }, [user, authLoading, router, params.id])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.vendorName) {
        setError('Vendor name is required')
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

      // Upload new images if provided
      let logoUrl = vendor.logo_url || null
      let heroImageUrl = vendor.hero_image_url || null

      if (logoFile) {
        const logoResult = await uploadVendorLogo(params.id as string, logoFile)
        if (logoResult.error) {
          setError(`Logo upload failed: ${logoResult.error}`)
          setLoading(false)
          return
        } else {
          // Delete old logo if it exists and is different
          if (vendor.logo_url && vendor.logo_url !== logoResult.url) {
            // Extract path from full URL: https://.../vendor-assets/vendors/{id}/logo-{timestamp}.ext
            const urlParts = vendor.logo_url.split('/vendor-assets/')
            if (urlParts.length > 1) {
              const oldPath = urlParts[1]
              await deleteImage('vendor-assets', oldPath).catch(console.error)
            }
          }
          logoUrl = logoResult.url
        }
      }

      if (heroFile) {
        const heroResult = await uploadVendorHero(params.id as string, heroFile)
        if (heroResult.error) {
          setError(`Hero image upload failed: ${heroResult.error}`)
          setLoading(false)
          return
        } else {
          // Delete old hero if it exists and is different
          if (vendor.hero_image_url && vendor.hero_image_url !== heroResult.url) {
            // Extract path from full URL: https://.../vendor-assets/vendors/{id}/hero-{timestamp}.ext
            const urlParts = vendor.hero_image_url.split('/vendor-assets/')
            if (urlParts.length > 1) {
              const oldPath = urlParts[1]
              await deleteImage('vendor-assets', oldPath).catch(console.error)
            }
          }
          heroImageUrl = heroResult.url
        }
      }

      // Update vendor with form data
      const result = await updateVendor(params.id as string, normalizedData)

      // If images were uploaded, update vendor record with new image URLs
      if ((logoFile || heroFile) && result.success) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const updateData: any = {}
        if (logoFile) updateData.logo_url = logoUrl
        if (heroFile) updateData.hero_image_url = heroImageUrl

        const { error: imageUpdateError } = await supabase
          .from('vendors')
          // @ts-ignore
          .update(updateData)
          .eq('id', params.id as string)

        if (imageUpdateError) {
          console.error('Failed to update image URLs:', imageUpdateError)
          // Don't fail the whole update, just log the error
        }
      }

      if (result.success) {
        setSuccess(true)
        // Reload vendor data to show updated info
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: updatedVendor } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', params.id as string)
          .single()

        if (updatedVendor) {
          setVendor(updatedVendor)
          // Update image previews if images were uploaded
          if (logoFile && logoUrl) {
            setLogoPreview(logoUrl)
            setLogoFile(null)
          }
          if (heroFile && heroImageUrl) {
            setHeroPreview(heroImageUrl)
            setHeroFile(null)
          }
        }

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/admin/vendors')
        }, 2000)
      } else {
        setError(result.error || 'Failed to update vendor')
      }
    } catch (err: any) {
      console.error('[AdminVendorEdit] Error:', err)
      setError(err.message || 'Unexpected error updating vendor')
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

  if (!user) {
    return null // Will redirect
  }

  if (!isAdminUser) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Access Denied</h2>
            <p className="text-error-800 mb-4">You do not have admin privileges.</p>
            <Link href="/admin/vendors" className="text-primary-600 hover:underline">
              ← Back to Vendors
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (error || !vendor) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Vendor Not Found</h2>
            <p className="text-error-800 mb-4">{error || 'The vendor you are looking for does not exist.'}</p>
            <Link href="/admin/vendors" className="text-primary-600 hover:underline">
              ← Back to Vendors
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* GUARDRAIL: Admin form width constraint. Why: Forms wider than max-w-4xl (896px) become hard to read. DO NOT: Remove max-w-4xl or increase beyond max-w-5xl. Standard: All admin edit/create forms use max-w-4xl. */}
      <div className="container-custom max-w-4xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Edit Vendor</h1>
            <p className="text-neutral-600">Edit vendor: {vendor.name}</p>
          </div>
          <Link
            href="/admin/vendors"
            className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            ← Back to Vendors
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
                <h3 className="text-lg font-semibold text-success-900">Vendor Updated Successfully!</h3>
                <p className="text-success-700">Redirecting to vendors list...</p>
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
            {/* Images Section */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                            setLogoPreview(vendor.logo_url)
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                            setHeroPreview(vendor.hero_image_url)
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

            {/* Vendor Information Section */}
            <div>
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

                <div className="md:col-span-2 flex items-center gap-6">
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

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">Verified</span>
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
                {loading ? 'Updating Vendor...' : 'Update Vendor'}
              </button>
              <Link
                href="/admin/vendors"
                className="px-6 py-3 text-neutral-700 font-medium border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </Link>
              <Link
                href={`/vendors/${vendor.slug}`}
                target="_blank"
                className="px-6 py-3 text-neutral-700 font-medium border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                View Public Profile
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}




