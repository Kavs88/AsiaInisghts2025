'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserAuthorityServer } from '@/lib/auth/authority'

export type BusinessSummary = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  category: string | null
  is_active: boolean
  is_verified: boolean
  agency_id: string | null
}

export async function getBusinessesForCurrentUser(): Promise<BusinessSummary[]> {
  try {
    const supabase = await createClient()
    const authority = await getUserAuthorityServer()

    const base = (supabase as any)
      .from('entities')
      .select('id, name, slug, logo_url, category, is_active, is_verified, agency_id')
      .eq('type', 'business')
      .order('created_at', { ascending: false })

    // Platform admins see everything
    if (authority.isAdmin) {
      const { data, error } = await base
      if (error) {
        console.error('[getBusinessesForCurrentUser] admin query error:', error.message)
        return []
      }
      return data ?? []
    }

    // All other roles: scope strictly by agency membership — no user_id fallback
    const agencyIds = authority.agencies.map((a) => a.id)
    if (agencyIds.length === 0) return []

    const { data, error } = await base.in('agency_id', agencyIds)
    if (error) {
      console.error('[getBusinessesForCurrentUser] agency query error:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('[getBusinessesForCurrentUser] unexpected error:', err)
    return []
  }
}
