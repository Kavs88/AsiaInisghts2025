'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export const vendorApplicationSchema = z.object({
  agencyId: z.string().uuid('Invalid agency'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  tagline: z.string().max(120, 'Tagline must be 120 characters or less').optional(),
  category: z.string().min(1, 'Category is required'),
  bio: z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(5, 'Phone number is required'),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagramHandle: z.string().optional(),
  deliveryAvailable: z.boolean(),
  pickupAvailable: z.boolean(),
  logoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
})

export type VendorApplicationData = z.infer<typeof vendorApplicationSchema>

export async function submitVendorApplication(data: VendorApplicationData): Promise<{
  success: boolean
  vendorSlug?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Validate parsed input
    const parsed = vendorApplicationSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    // Verify agencyId belongs to this user (prevent forging)
    const { data: membership, error: membershipError } = await supabase
      .from('agency_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('agency_id', parsed.data.agencyId)
      .maybeSingle()

    if (membershipError || !membership) {
      return { success: false, error: 'You are not a member of this agency' }
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('vendors')
      .select('id')
      .eq('slug', parsed.data.slug)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'This slug is already taken. Please choose another.' }
    }

    // Insert vendor record
    const { data: vendor, error: vendorError } = await (supabase as any)
      .from('vendors')
      .insert({
        user_id: user.id,
        agency_id: parsed.data.agencyId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        tagline: parsed.data.tagline ?? null,
        category: parsed.data.category,
        bio: parsed.data.bio ?? null,
        contact_email: parsed.data.contactEmail,
        contact_phone: parsed.data.contactPhone,
        website_url: parsed.data.websiteUrl || null,
        instagram_handle: parsed.data.instagramHandle ?? null,
        delivery_available: parsed.data.deliveryAvailable,
        pickup_available: parsed.data.pickupAvailable,
        logo_url: parsed.data.logoUrl ?? null,
        hero_image_url: parsed.data.heroImageUrl ?? null,
        is_active: false,
        is_verified: false,
      })
      .select('slug')
      .single()

    if (vendorError) {
      console.error('[submitVendorApplication] vendor insert error:', vendorError.message)
      return { success: false, error: 'Failed to create vendor profile. Please try again.' }
    }

    // Update user role to vendor — failure here leaves an inconsistent state (vendor record
    // exists but role is still 'customer'), so treat it as a hard error.
    const { error: roleError } = await (supabase as any)
      .from('users')
      .update({ role: 'vendor' })
      .eq('id', user.id)

    if (roleError) {
      console.error('[submitVendorApplication] role update failed for user=%s: %s', user.id, roleError.message)
      return { success: false, error: 'Account role update failed. Please contact support.' }
    }

    revalidateTag('vendors')

    return { success: true, vendorSlug: vendor.slug }
  } catch (err) {
    console.error('[submitVendorApplication] unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
