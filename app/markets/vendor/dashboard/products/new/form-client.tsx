'use client'

import { useRef, useState, useTransition } from 'react'
import { Package, DollarSign, BarChart2, Tag, FileText, AlertCircle, ImagePlus, X, Loader2 } from 'lucide-react'
import { uploadProductImage } from '@/lib/supabase/storage'
import { validateImageFile } from '@/lib/supabase/storage'

const CATEGORIES = [
  'Food & Drink',
  'Baked Goods',
  'Fresh Produce',
  'Crafts & Handmade',
  'Clothing & Accessories',
  'Health & Beauty',
  'Art & Prints',
  'Plants & Flowers',
  'Home & Living',
  'Services',
  'Other',
]

interface ProductFormClientProps {
  action: (formData: FormData) => Promise<{ error?: string } | void>
  initialValues?: {
    name?: string
    description?: string
    price?: number
    category?: string
    stock_quantity?: number
    is_available?: boolean
    image_url?: string   // first image URL from image_urls[]
  }
  submitLabel?: string
  vendorId?: string
  productId?: string
}

export default function ProductFormClient({
  action,
  initialValues,
  submitLabel = 'Create Product',
  vendorId,
  productId,
}: ProductFormClientProps) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError]   = useState<string | null>(null)
  const [isAvailable, setIsAvailable]   = useState(initialValues?.is_available ?? true)

  // Image upload state
  const [imageUrl, setImageUrl]         = useState<string>(initialValues?.image_url ?? '')
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError]     = useState<string | null>(null)
  const fileInputRef                    = useRef<HTMLInputElement>(null)
  const formRef                         = useRef<HTMLFormElement>(null)

  // -------------------------------------------------------------------------
  // Image upload handler — uploads to Supabase Storage, stores public URL
  // -------------------------------------------------------------------------
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setImageError(validation.error ?? 'Invalid file.')
      return
    }

    setImageError(null)
    setImageUploading(true)

    try {
      // Use a stable but temporary product ID for new products so the path is
      // consistent; for edits we use the real productId.
      const pid  = productId ?? `new-${Date.now()}`
      const vid  = vendorId  ?? 'unknown'

      const result = await uploadProductImage(vid, pid, file, 0)
      if (result.error) {
        setImageError(result.error)
      } else {
        setImageUrl(result.url)
      }
    } catch {
      setImageError('Upload failed. Please try again.')
    } finally {
      setImageUploading(false)
      // Reset file input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage() {
    setImageUrl('')
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // -------------------------------------------------------------------------
  // Form submission
  // -------------------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('is_available', String(isAvailable))
    // Always include image_url — empty string signals "no image / image removed"
    formData.set('image_url', imageUrl)

    startTransition(async () => {
      const result = await action(formData)
      if (result && 'error' in result) {
        setServerError(result.error)
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Server error banner */}
      {serverError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Product image                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
        <label className="block text-sm font-bold text-neutral-700 mb-3">
          Product Image
        </label>

        {imageUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Product preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors border border-neutral-200"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50/30 flex flex-col items-center justify-center gap-2 transition-all text-neutral-400 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {imageUploading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-sm font-medium">Uploading…</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-7 h-7" />
                <span className="text-sm font-medium">Click to upload</span>
                <span className="text-xs">JPEG, PNG, WebP · max 5 MB</span>
              </>
            )}
          </button>
        )}

        {imageError && (
          <p className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {imageError}
          </p>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="sr-only"
          aria-hidden
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Product name                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
        <label className="block text-sm font-bold text-neutral-700 mb-2">
          Product Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            name="name"
            type="text"
            required
            defaultValue={initialValues?.name}
            placeholder="e.g. Handmade Sourdough Loaf"
            className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Description                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
        <label className="block text-sm font-bold text-neutral-700 mb-2">Description</label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
          <textarea
            name="description"
            rows={4}
            defaultValue={initialValues?.description ?? ''}
            placeholder="Tell customers what makes this product special…"
            className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Price & stock                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
          <label className="block text-sm font-bold text-neutral-700 mb-2">
            Price (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={initialValues?.price}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
          <label className="block text-sm font-bold text-neutral-700 mb-2">Stock Quantity</label>
          <div className="relative">
            <BarChart2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              defaultValue={initialValues?.stock_quantity ?? 0}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Category                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
        <label className="block text-sm font-bold text-neutral-700 mb-2">Category</label>
        <div className="relative">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <select
            name="category"
            defaultValue={initialValues?.category ?? ''}
            className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Visibility toggle                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-neutral-700">Visible to customers</div>
            <div className="text-xs text-neutral-500 mt-0.5">
              {isAvailable
                ? 'Customers can find and order this product.'
                : 'This product is hidden from your public shop.'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isAvailable ? 'bg-primary-600' : 'bg-neutral-200'
            }`}
            aria-pressed={isAvailable}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Submit                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-4 pb-4">
        <button
          type="submit"
          disabled={isPending || imageUploading}
          className="flex-1 py-3.5 px-6 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-md shadow-primary-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <a
          href="/markets/vendor/dashboard/products"
          aria-disabled={isPending || imageUploading}
          className={`px-6 py-3.5 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-50 transition-all ${
            isPending || imageUploading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
