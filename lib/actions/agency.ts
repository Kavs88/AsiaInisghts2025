'use server'

import { createClient } from '@/lib/supabase/server'

export type UserAgency = {
  id: string
  name: string
  slug: string
  role: string
}

export async function getUserAgencies(): Promise<UserAgency[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from('agency_members')
      .select('role, agencies(id, name, slug)')
      .eq('user_id', user.id)

    if (error || !data) return []

    return data.map((m: any) => ({
      id: m.agencies.id,
      name: m.agencies.name,
      slug: m.agencies.slug,
      role: m.role,
    }))
  } catch {
    return []
  }
}
