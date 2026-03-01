/**
 * Supabase Storage Utilities for Image Uploads
 * Handles vendor logo, hero image, portfolio, and product image uploads
 */

import { createClient } from './client'

export type ImageUploadResult = {
  url: string
  path: string
  error?: string
}

export type ImageFile = File | Blob

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload an image smaller than 5MB.',
    }
  }

  return { valid: true }
}

/**
 * Generate a unique file path for vendor assets
 */
export function generateVendorAssetPath(vendorId: string, filename: string, type: 'logo' | 'hero'): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const extension = filename.split('.').pop() || 'jpg'
  return `vendors/${vendorId}/${type}-${timestamp}.${extension}`
}

/**
 * Generate a unique file path for portfolio images
 */
export function generatePortfolioPath(vendorId: string, filename: string): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const extension = filename.split('.').pop() || 'jpg'
  return `vendors/${vendorId}/portfolio/${timestamp}-${sanitizedFilename}`
}

/**
 * Generate a unique file path for product images
 */
export function generateProductImagePath(vendorId: string, productId: string, filename: string, index?: number): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const extension = filename.split('.').pop() || 'jpg'
  const suffix = index !== undefined ? `-${index}` : ''
  return `products/${vendorId}/${productId}/${timestamp}${suffix}.${extension}`
}

/**
 * Upload vendor logo image
 */
export async function uploadVendorLogo(
  vendorId: string,
  file: File
): Promise<ImageUploadResult> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { url: '', path: '', error: validation.error }
  }

  const supabase = createClient()
  const filePath = generateVendorAssetPath(vendorId, file.name, 'logo')

  const { data, error } = await supabase.storage
    .from('vendor-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { url: '', path: '', error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('vendor-assets')
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
    path: filePath,
  }
}

/**
 * Upload vendor hero image
 */
export async function uploadVendorHero(
  vendorId: string,
  file: File
): Promise<ImageUploadResult> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { url: '', path: '', error: validation.error }
  }

  const supabase = createClient()
  const filePath = generateVendorAssetPath(vendorId, file.name, 'hero')

  const { data, error } = await supabase.storage
    .from('vendor-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { url: '', path: '', error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('vendor-assets')
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
    path: filePath,
  }
}

/**
 * Upload portfolio image
 */
export async function uploadPortfolioImage(
  vendorId: string,
  file: File
): Promise<ImageUploadResult> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { url: '', path: '', error: validation.error }
  }

  const supabase = createClient()
  const filePath = generatePortfolioPath(vendorId, file.name)

  const { data, error } = await supabase.storage
    .from('vendor-portfolio')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { url: '', path: '', error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('vendor-portfolio')
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
    path: filePath,
  }
}

/**
 * Upload a product image to the product-images bucket.
 * Path format: products/{vendorId}/{productId}/{timestamp}[-{index}].{ext}
 */
export async function uploadProductImage(
  vendorId: string,
  productId: string,
  file: File,
  index?: number,
): Promise<ImageUploadResult> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { url: '', path: '', error: validation.error }
  }

  const supabase = createClient()
  const filePath = generateProductImagePath(vendorId, productId, file.name, index)

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { url: '', path: '', error: error.message }
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return { url: urlData.publicUrl, path: filePath }
}

/**
 * Delete an image from storage
 */
export async function deleteImage(bucket: 'vendor-assets' | 'product-images' | 'vendor-portfolio', path: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get public URL for an image
 */
export function getImageUrl(bucket: 'vendor-assets' | 'product-images' | 'vendor-portfolio', path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}


