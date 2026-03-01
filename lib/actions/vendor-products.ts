'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserAuthorityServer } from '@/lib/auth/authority'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Shared return type — normalised across all mutations
// ---------------------------------------------------------------------------
export type ActionResult = { error: string } | { success: true }

// ---------------------------------------------------------------------------
// Allowed status transitions — prevents illegal state rollbacks
// ---------------------------------------------------------------------------
const ALLOWED_TRANSITIONS: Record<string, readonly string[]> = {
  pending:   ['contacted', 'cancelled'],
  contacted: ['confirmed', 'cancelled'],
  confirmed: ['fulfilled'],
  fulfilled: [],  // terminal
  cancelled: [],  // terminal
}

// ---------------------------------------------------------------------------
// Internal auth helper
// ---------------------------------------------------------------------------

/**
 * Resolves the authenticated vendor's ID.
 *
 * Uses `getUser()` (not `getSession()`) so the JWT is verified server-side
 * on every call — `getSession()` only reads cookies and can be stale.
 * Throws a redirect on any auth or role failure.
 */
async function resolveVendorId(): Promise<string> {
  const supabase = await createClient()

  // Verify JWT with Supabase auth server — not just cookie read
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login?redirect=/markets/vendor/dashboard/products')
  }

  const authority = await getUserAuthorityServer()
  if (authority.effectiveRole !== 'vendor' && !authority.isAdmin) {
    redirect('/markets/vendor/apply')
  }
  if (!authority.hasVendorRecord) {
    redirect('/markets/vendor/apply')
  }

  const { data: vendor } = await (supabase.from('vendors') as any)
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor?.id) redirect('/markets/vendor/apply')
  return vendor.id as string
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Returns ALL products for this vendor including hidden ones. */
export async function getVendorAllProducts(vendorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_at_price, image_urls, category, stock_quantity, is_available, requires_preorder, created_at')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[getVendorAllProducts] vendor=%s error=%s', vendorId, error.message)
    return []
  }
  return data || []
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Creates a new product scoped to the authenticated vendor. */
export async function createVendorProduct(formData: FormData): Promise<ActionResult | void> {
  const supabase  = await createClient()
  const vendorId  = await resolveVendorId()

  const name        = (formData.get('name') as string | null)?.trim() ?? ''
  const description = (formData.get('description') as string | null)?.trim() ?? ''
  const priceRaw    = formData.get('price') as string | null
  const category    = (formData.get('category') as string | null)?.trim() ?? ''
  const stockRaw    = formData.get('stock_quantity') as string | null
  const isAvailable = formData.get('is_available') === 'true'
  const imageUrl    = (formData.get('image_url') as string | null)?.trim() ?? ''

  // --- Input validation ---
  if (!name)     return { error: 'Product name is required.' }
  if (!priceRaw) return { error: 'Price is required.' }

  const price = parseFloat(priceRaw)
  if (isNaN(price) || price < 0) return { error: 'Price must be a positive number.' }

  const stock_quantity = stockRaw ? parseInt(stockRaw, 10) : 0
  if (isNaN(stock_quantity) || stock_quantity < 0) return { error: 'Stock quantity must be 0 or more.' }

  // Collision-resistant slug: slugified name + random base-36 suffix
  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 10)}`

  const { data, error } = await (supabase.from('products') as any)
    .insert({
      name,
      slug,
      description:  description || null,
      price,
      category:     category || null,
      stock_quantity,
      is_available: isAvailable,
      vendor_id:    vendorId,
      image_urls:   imageUrl ? [imageUrl] : [],
    })
    .select('id')
    .single()

  if (error) {
    // Unique constraint violation on slug (code 23505) — surface a meaningful message
    if (error.code === '23505') {
      console.warn('[createVendorProduct] vendor=%s slug collision slug=%s', vendorId, slug)
      return { error: 'A product with a very similar name already exists. Try a slightly different name.' }
    }
    console.error('[createVendorProduct] vendor=%s error=%s code=%s', vendorId, error.message, error.code)
    return { error: 'Failed to create product. Please try again.' }
  }

  revalidatePath('/markets/vendor/dashboard/products')
  redirect(`/markets/vendor/dashboard/products/${data.id}/edit`)
}

/**
 * Updates a product.
 *
 * Ownership is enforced ATOMICALLY inside the UPDATE statement via
 * `.eq('vendor_id', vendorId)` — there is no separate SELECT for ownership
 * checking, which eliminates the TOCTOU (time-of-check time-of-use) race
 * present in the naive SELECT-then-UPDATE pattern.
 *
 * If the UPDATE affects 0 rows the product either does not exist or belongs
 * to a different vendor — both are treated as access denied.
 */
export async function updateVendorProduct(productId: string, formData: FormData): Promise<ActionResult | void> {
  const supabase = await createClient()
  const vendorId = await resolveVendorId()

  const name        = (formData.get('name') as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim()
  const priceRaw    = formData.get('price') as string | null
  const category    = (formData.get('category') as string | null)?.trim()
  const stockRaw    = formData.get('stock_quantity') as string | null
  const isAvailable = formData.get('is_available') === 'true'
  const imageUrl    = formData.get('image_url') as string | null // null means "not submitted"

  if (!name)     return { error: 'Product name is required.' }
  if (!priceRaw) return { error: 'Price is required.' }

  const price = parseFloat(priceRaw)
  if (isNaN(price) || price < 0) return { error: 'Price must be a positive number.' }

  const stock_quantity = stockRaw ? parseInt(stockRaw, 10) : 0
  if (isNaN(stock_quantity) || stock_quantity < 0) return { error: 'Stock quantity must be 0 or more.' }

  // Build update payload — only include image_urls when the field was submitted
  const updatePayload: Record<string, unknown> = {
    name,
    description:  description || null,
    price,
    category:     category || null,
    stock_quantity,
    is_available: isAvailable,
  }
  if (imageUrl !== null) {
    // imageUrl === '' means the image was removed; imageUrl !== '' means new/unchanged URL
    updatePayload.image_urls = imageUrl ? [imageUrl] : []
  }

  // Single atomic UPDATE — vendor_id in WHERE prevents TOCTOU race
  const { data: updated, error } = await (supabase.from('products') as any)
    .update(updatePayload)
    .eq('id', productId)
    .eq('vendor_id', vendorId)  // ownership enforced atomically
    .select('id')

  if (error) {
    console.error('[updateVendorProduct] vendor=%s product=%s error=%s code=%s', vendorId, productId, error.message, error.code)
    return { error: 'Failed to update product. Please try again.' }
  }

  if (!updated || updated.length === 0) {
    console.warn('[updateVendorProduct] vendor=%s attempted update on unowned/missing product=%s', vendorId, productId)
    return { error: 'Product not found or access denied.' }
  }

  revalidatePath('/markets/vendor/dashboard/products')
  redirect('/markets/vendor/dashboard/products')
}

/**
 * Advances an order intent's status.
 *
 * Validates that the requested transition is allowed from the current status
 * before issuing any UPDATE, preventing illegal state rollbacks.
 * Ownership (vendor_id) is enforced on both the SELECT and the UPDATE.
 */
export async function updateOrderStatus(
  orderId: string,
  nextStatus: 'pending' | 'contacted' | 'confirmed' | 'fulfilled' | 'cancelled',
): Promise<ActionResult> {
  const supabase = await createClient()
  const vendorId = await resolveVendorId()

  // Fetch current status — scoped to vendor immediately
  const { data: current, error: fetchError } = await (supabase.from('order_intents') as any)
    .select('status')
    .eq('id', orderId)
    .eq('vendor_id', vendorId)
    .single()

  if (fetchError || !current) {
    console.error('[updateOrderStatus] vendor=%s order=%s fetch failed: %s', vendorId, orderId, fetchError?.message ?? 'not found')
    return { error: 'Order not found or access denied.' }
  }

  // Guard: validate allowed transition
  const allowed = ALLOWED_TRANSITIONS[current.status] ?? []
  if (!allowed.includes(nextStatus)) {
    console.warn(
      '[updateOrderStatus] vendor=%s order=%s invalid transition "%s"→"%s"',
      vendorId, orderId, current.status, nextStatus,
    )
    return { error: `Cannot move an order from "${current.status}" to "${nextStatus}".` }
  }

  const { error } = await (supabase.from('order_intents') as any)
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('vendor_id', vendorId)

  if (error) {
    console.error('[updateOrderStatus] vendor=%s order=%s update failed: %s', vendorId, orderId, error.message)
    return { error: 'Failed to update order status. Please try again.' }
  }

  revalidatePath('/markets/vendor/dashboard/orders')
  return { success: true }
}
