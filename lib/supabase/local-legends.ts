import { createClient } from '@/lib/supabase/server'

export type LocalLegend = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  hero_image_url: string | null
  audio_url: string | null
  video_url: string | null
  related_vendor_id: string | null
  related_business_id: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  vendors?: { id: string; name: string; slug: string } | null
}

/** Public: all published stories ordered by publish date. */
export async function getPublishedLegends(): Promise<LocalLegend[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('local_legends')
      .select('id, slug, title, excerpt, hero_image_url, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (error) return []
    return (data ?? []) as LocalLegend[]
  } catch {
    return []
  }
}

/** Public: single published story by slug, with related vendor name. */
export async function getLegendBySlug(slug: string): Promise<LocalLegend | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('local_legends')
      .select('*, vendors:related_vendor_id (id, name, slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (error || !data) return null
    return data as LocalLegend
  } catch {
    return null
  }
}

/** Admin: paginated list of all stories (any status). */
export async function getAllLegendsAdmin(
  page = 1,
  pageSize = 20
): Promise<{ data: LocalLegend[]; count: number }> {
  try {
    const supabase = await createClient()
    const from = (page - 1) * pageSize
    const { data, error, count } = await supabase
      .from('local_legends')
      .select('id, slug, title, status, published_at, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)
    if (error) return { data: [], count: 0 }
    return { data: (data ?? []) as LocalLegend[], count: count ?? 0 }
  } catch {
    return { data: [], count: 0 }
  }
}

/** Admin: single story by id (for edit form). */
export async function getLegendByIdAdmin(id: string): Promise<LocalLegend | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('local_legends')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return null
    return data as LocalLegend
  } catch {
    return null
  }
}

/**
 * Optional vendor-page helper: check if a vendor is featured in any published story.
 * Call this addtively inside app/makers/[slug]/page.tsx when ready.
 */
export async function getLegendsByVendorId(vendorId: string): Promise<Pick<LocalLegend, 'id' | 'slug' | 'title'>[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('local_legends')
      .select('id, slug, title')
      .eq('related_vendor_id', vendorId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}
