'use server'

import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'

const _fetchProductBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicClient()
    const { data, error } = await (supabase
      .from('products') as any)
      .select('*, vendors(*)')
      .eq('slug', slug)
      .eq('is_available', true)
      .maybeSingle()
    if (error) throw error
    return data || null
  },
  ['product-by-slug'],
  { revalidate: 1800, tags: ['products'] }
)

export async function getProductBySlug(slug: string) {
  return _fetchProductBySlug(slug)
}

const _fetchVendorProductsByVendor = unstable_cache(
  async (vendorId: string) => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return data || []
  },
  ['vendor-products-by-vendor'],
  { revalidate: 1800, tags: ['products'] }
)

export async function getVendorProducts(vendorId: string) {
  return _fetchVendorProductsByVendor(vendorId)
}

export async function getVendorNextMarketAttendance(vendorId: string) {
  const supabase = createPublicClient()
  const { data, error } = await (supabase
    .from('market_stalls') as any)
    .select('*, market_days(*)')
    .eq('vendor_id', vendorId)
    .eq('attending_physically', true)
    .gte('market_days.market_date', new Date().toISOString().split('T')[0])
    .order('market_days.market_date', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('Error fetching vendor next market attendance:', error)
    return null
  }
  return data || null
}
