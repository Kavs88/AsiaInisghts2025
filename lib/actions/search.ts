'use server'

import { createClient } from '@/lib/supabase/server'

export interface SearchResult {
  id: string
  type: 'product' | 'vendor' | 'business'
  title: string
  subtitle?: string
  imageUrl?: string
  href: string
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const supabase = await createClient()
  const limit = 5

  const [productResult, vendorResult, businessResult] = await Promise.all([
    // Products — try RPC first, fall back to ILIKE
    (supabase as any)
      .rpc('search_products', { search_text: query, result_limit: limit })
      .then(({ data, error }: { data: any[] | null; error: any }) => {
        if (error) {
          return supabase
            .from('products')
            .select('id, name, slug, image_urls, vendors(name, slug)')
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .eq('is_available', true)
            .limit(limit)
            .then(({ data: fd }) => fd || [])
        }
        return data || []
      })
      .catch(() => [] as any[]),

    // Vendors
    supabase
      .from('vendors')
      .select('id, name, slug, tagline, logo_url')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(3)
      .then(({ data, error }: { data: any[] | null; error: any }) => {
        if (error) return [] as any[]
        return data || []
      }),

    // Businesses (entities)
    supabase
      .from('entities')
      .select('id, name, slug, tags, location_text, logo_url')
      .eq('type', 'business')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,location_text.ilike.%${query}%`)
      .limit(3)
      .then(({ data, error }: { data: any[] | null; error: any }) => {
        if (error) return [] as any[]
        return data || []
      }),
  ])

  const products: SearchResult[] = productResult.map((p: any) => ({
    id: p.id,
    type: 'product',
    title: p.name,
    subtitle: p.vendors?.name ? `by ${p.vendors.name}` : undefined,
    imageUrl: p.image_urls?.[0],
    href: `/markets/products/${p.slug}`,
  }))

  const vendors: SearchResult[] = vendorResult.map((v: any) => ({
    id: v.id,
    type: 'vendor',
    title: v.name,
    subtitle: v.tagline || undefined,
    imageUrl: v.logo_url || undefined,
    href: `/markets/sellers/${v.slug}`,
  }))

  const businesses: SearchResult[] = businessResult.map((b: any) => ({
    id: b.id,
    type: 'business',
    title: b.name,
    subtitle: b.tags?.[0] || undefined,
    imageUrl: b.logo_url || undefined,
    href: `/businesses/${b.slug}`,
  }))

  return [...products, ...vendors, ...businesses].slice(0, 10)
}
