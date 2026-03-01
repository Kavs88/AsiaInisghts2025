'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdminServer } from '@/lib/auth/server-admin-check'
import { revalidateTag } from 'next/cache'

// ─── Types ───────────────────────────────────────────────────────────────────

export type PropertyType = 'apartment' | 'house' | 'condo' | 'villa' | 'commercial' | 'land' | 'other'

export interface CreatePropertyData {
  address: string
  type: PropertyType
  availability?: string
  price: number
  bedrooms?: number | null
  bathrooms?: number | null
  square_meters?: number | null
  description?: string
  images?: string[]
  is_active?: boolean
}

export interface UpdatePropertyData {
  address?: string
  type?: PropertyType
  availability?: string
  price?: number
  bedrooms?: number | null
  bathrooms?: number | null
  square_meters?: number | null
  description?: string
  images?: string[]
  is_active?: boolean
  owner_id?: string
}

export interface CreateEventData {
  title: string
  description?: string
  event_date: string
  start_time: string
  end_time?: string
  location: string
  ticket_price?: number | null
  ticket_url?: string
  max_attendees?: number | null
  category?: string
  images?: string[]
  is_published?: boolean
  is_active?: boolean
}

export interface UpdateEventData {
  title?: string
  description?: string
  event_date?: string
  start_time?: string
  end_time?: string
  location?: string
  ticket_price?: number | null
  ticket_url?: string
  max_attendees?: number | null
  category?: string
  images?: string[]
  is_published?: boolean
  is_active?: boolean
  organizer_id?: string
}

export interface CreateBusinessData {
  name: string
  slug: string
  category: string
  description?: string
  contact_phone: string
  contact_email?: string
  address: string
  website_url?: string
  logo_url?: string
  images?: string[]
  is_verified?: boolean
  is_active?: boolean
}

export interface UpdateBusinessData {
  name?: string
  slug?: string
  category?: string
  description?: string
  contact_phone?: string
  contact_email?: string
  address?: string
  website_url?: string
  logo_url?: string
  images?: string[]
  is_verified?: boolean
  is_active?: boolean
  owner_id?: string
}

// ─── Helper ──────────────────────────────────────────────────────────────────

async function verifyAdminAndGetClient() {
  const isAdmin = await isAdminServer()
  if (!isAdmin) throw new Error('Unauthorized: Admin access required')
  const supabase = await createClient()
  if (!supabase) throw new Error('Failed to initialize database client')
  return supabase
}

async function getAdminUserId(): Promise<string> {
  const supabase = await verifyAdminAndGetClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Could not determine current user')
  return user.id
}

// ─── Properties ──────────────────────────────────────────────────────────────

export async function createProperty(
  data: CreatePropertyData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await verifyAdminAndGetClient()
    const ownerId = await getAdminUserId()

    const { data: result, error } = await (supabase as any)
      .from('properties')
      .insert({ ...data, owner_id: ownerId })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }
    revalidateTag('properties')
    return { success: true, id: (result as any).id }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateProperty(
  id: string,
  data: UpdatePropertyData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await verifyAdminAndGetClient()
    const { error } = await (supabase as any).from('properties').update(data).eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidateTag('properties')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function createEvent(
  data: CreateEventData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await verifyAdminAndGetClient()
    const organizerId = await getAdminUserId()

    const { data: result, error } = await (supabase as any)
      .from('events')
      .insert({ ...data, organizer_id: organizerId })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }
    revalidateTag('events')
    return { success: true, id: (result as any).id }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateEvent(
  id: string,
  data: UpdateEventData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await verifyAdminAndGetClient()
    const { error } = await (supabase as any).from('events').update(data).eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidateTag('events')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── Businesses ──────────────────────────────────────────────────────────────

export async function createBusiness(
  data: CreateBusinessData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await verifyAdminAndGetClient()
    const ownerId = await getAdminUserId()

    const { data: result, error } = await (supabase as any)
      .from('businesses')
      .insert({ ...data, owner_id: ownerId })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }
    revalidateTag('businesses')
    return { success: true, id: (result as any).id }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateBusiness(
  id: string,
  data: UpdateBusinessData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await verifyAdminAndGetClient()
    const { error } = await (supabase as any).from('businesses').update(data).eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidateTag('businesses')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
