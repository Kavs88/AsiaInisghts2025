# Edge Functions Code - Ready to Copy & Paste

## Function 1: properties-crud

**Function Name:** `properties-crud`

**Copy this entire code block:**

```typescript
// Supabase Edge Function: properties-crud
// Handles CRUD operations for Properties module
// Operations: create, update, delete

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PropertyData {
  address: string
  type: 'apartment' | 'house' | 'condo' | 'villa' | 'commercial' | 'land' | 'other'
  availability?: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
  price: number
  bedrooms?: number
  bathrooms?: number
  square_meters?: number
  description?: string
  images?: string[]
  location_coords?: { lat: number; lng: number }
  contact_phone?: string
  contact_email?: string
  is_active?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userRecord?.role === 'admin' || userRecord?.role === 'super_user'

    const { operation, propertyId, data } = await req.json()

    switch (operation) {
      case 'create': {
        // Validate required fields
        if (!data.address || !data.type || !data.price) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: address, type, price' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Set owner_id (user creating or admin creating for someone)
        const ownerId = data.owner_id && isAdmin ? data.owner_id : user.id

        // Prepare property data
        const propertyData: any = {
          owner_id: ownerId,
          address: data.address,
          type: data.type,
          availability: data.availability || 'available',
          price: data.price,
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          square_meters: data.square_meters || null,
          description: data.description || null,
          images: data.images || [],
          contact_phone: data.contact_phone || null,
          contact_email: data.contact_email || null,
          is_active: data.is_active !== undefined ? data.is_active : true,
        }

        // Add location coords if provided
        if (data.location_coords) {
          propertyData.location_coords = `(${data.location_coords.lng},${data.location_coords.lat})`
        }

        const { data: property, error: createError } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: `Failed to create property: ${createError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, property }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        if (!propertyId) {
          return new Response(
            JSON.stringify({ error: 'Missing propertyId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check ownership or admin status
        const { data: existingProperty } = await supabase
          .from('properties')
          .select('owner_id')
          .eq('id', propertyId)
          .single()

        if (!existingProperty) {
          return new Response(
            JSON.stringify({ error: 'Property not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!isAdmin && existingProperty.owner_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Not the property owner' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Prepare update data
        const updateData: any = {}
        if (data.address) updateData.address = data.address
        if (data.type) updateData.type = data.type
        if (data.availability) updateData.availability = data.availability
        if (data.price !== undefined) updateData.price = data.price
        if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms
        if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms
        if (data.square_meters !== undefined) updateData.square_meters = data.square_meters
        if (data.description !== undefined) updateData.description = data.description
        if (data.images !== undefined) updateData.images = data.images
        if (data.contact_phone !== undefined) updateData.contact_phone = data.contact_phone
        if (data.contact_email !== undefined) updateData.contact_email = data.contact_email
        if (data.is_active !== undefined) updateData.is_active = data.is_active

        if (data.location_coords) {
          updateData.location_coords = `(${data.location_coords.lng},${data.location_coords.lat})`
        }

        // Admin can change owner
        if (isAdmin && data.owner_id) {
          updateData.owner_id = data.owner_id
        }

        const { data: property, error: updateError } = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', propertyId)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: `Failed to update property: ${updateError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, property }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        if (!propertyId) {
          return new Response(
            JSON.stringify({ error: 'Missing propertyId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check ownership or admin status
        const { data: existingProperty } = await supabase
          .from('properties')
          .select('owner_id')
          .eq('id', propertyId)
          .single()

        if (!existingProperty) {
          return new Response(
            JSON.stringify({ error: 'Property not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!isAdmin && existingProperty.owner_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Not the property owner' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabase
          .from('properties')
          .delete()
          .eq('id', propertyId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: `Failed to delete property: ${deleteError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation. Use: create, update, or delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## Function 2: events-crud

**Function Name:** `events-crud`

**Copy this entire code block:**

```typescript
// Supabase Edge Function: events-crud
// Handles CRUD operations for Events module
// Operations: create, update, delete

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventData {
  title: string
  description?: string
  event_date: string // ISO date string
  start_time: string // HH:MM format
  end_time?: string
  location: string
  location_coords?: { lat: number; lng: number }
  ticket_price?: number
  ticket_url?: string
  max_attendees?: number
  category?: string
  images?: string[]
  contact_phone?: string
  contact_email?: string
  website_url?: string
  is_published?: boolean
  is_active?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userRecord?.role === 'admin' || userRecord?.role === 'super_user'

    const { operation, eventId, data } = await req.json()

    switch (operation) {
      case 'create': {
        // Validate required fields
        if (!data.title || !data.event_date || !data.start_time || !data.location) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: title, event_date, start_time, location' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Set organizer_id (user creating or admin creating for someone)
        const organizerId = data.organizer_id && isAdmin ? data.organizer_id : user.id

        // Prepare event data
        const eventData: any = {
          organizer_id: organizerId,
          title: data.title,
          description: data.description || null,
          event_date: data.event_date,
          start_time: data.start_time,
          end_time: data.end_time || null,
          location: data.location,
          ticket_price: data.ticket_price || null,
          ticket_url: data.ticket_url || null,
          max_attendees: data.max_attendees || null,
          current_attendees: 0,
          category: data.category || null,
          images: data.images || [],
          contact_phone: data.contact_phone || null,
          contact_email: data.contact_email || null,
          website_url: data.website_url || null,
          is_published: data.is_published !== undefined ? data.is_published : false,
          is_active: data.is_active !== undefined ? data.is_active : true,
        }

        // Add location coords if provided
        if (data.location_coords) {
          eventData.location_coords = `(${data.location_coords.lng},${data.location_coords.lat})`
        }

        const { data: event, error: createError } = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: `Failed to create event: ${createError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, event }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        if (!eventId) {
          return new Response(
            JSON.stringify({ error: 'Missing eventId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check ownership or admin status
        const { data: existingEvent } = await supabase
          .from('events')
          .select('organizer_id')
          .eq('id', eventId)
          .single()

        if (!existingEvent) {
          return new Response(
            JSON.stringify({ error: 'Event not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!isAdmin && existingEvent.organizer_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Not the event organizer' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Prepare update data
        const updateData: any = {}
        if (data.title) updateData.title = data.title
        if (data.description !== undefined) updateData.description = data.description
        if (data.event_date) updateData.event_date = data.event_date
        if (data.start_time) updateData.start_time = data.start_time
        if (data.end_time !== undefined) updateData.end_time = data.end_time
        if (data.location) updateData.location = data.location
        if (data.ticket_price !== undefined) updateData.ticket_price = data.ticket_price
        if (data.ticket_url !== undefined) updateData.ticket_url = data.ticket_url
        if (data.max_attendees !== undefined) updateData.max_attendees = data.max_attendees
        if (data.category !== undefined) updateData.category = data.category
        if (data.images !== undefined) updateData.images = data.images
        if (data.contact_phone !== undefined) updateData.contact_phone = data.contact_phone
        if (data.contact_email !== undefined) updateData.contact_email = data.contact_email
        if (data.website_url !== undefined) updateData.website_url = data.website_url
        if (data.is_published !== undefined) updateData.is_published = data.is_published
        if (data.is_active !== undefined) updateData.is_active = data.is_active

        if (data.location_coords) {
          updateData.location_coords = `(${data.location_coords.lng},${data.location_coords.lat})`
        }

        // Admin can change organizer
        if (isAdmin && data.organizer_id) {
          updateData.organizer_id = data.organizer_id
        }

        const { data: event, error: updateError } = await supabase
          .from('events')
          .update(updateData)
          .eq('id', eventId)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: `Failed to update event: ${updateError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, event }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        if (!eventId) {
          return new Response(
            JSON.stringify({ error: 'Missing eventId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check ownership or admin status
        const { data: existingEvent } = await supabase
          .from('events')
          .select('organizer_id')
          .eq('id', eventId)
          .single()

        if (!existingEvent) {
          return new Response(
            JSON.stringify({ error: 'Event not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!isAdmin && existingEvent.organizer_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Not the event organizer' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: `Failed to delete event: ${deleteError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation. Use: create, update, or delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## Function 3: businesses-crud

**Function Name:** `businesses-crud`

**Copy this entire code block:**

```typescript
// Supabase Edge Function: businesses-crud
// Handles CRUD operations for Business Directory module
// Operations: create, update, delete

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BusinessData {
  name: string
  slug?: string
  category: string
  description?: string
  contact_phone: string
  contact_email?: string
  address: string
  location_coords?: { lat: number; lng: number }
  website_url?: string
  opening_hours?: Record<string, any>
  social_links?: Record<string, any>
  logo_url?: string
  images?: string[]
  is_verified?: boolean
  is_active?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userRecord?.role === 'admin' || userRecord?.role === 'super_user'

    const { operation, businessId, data } = await req.json()

    switch (operation) {
      case 'create': {
        // Validate required fields
        if (!data.name || !data.category || !data.contact_phone || !data.address) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: name, category, contact_phone, address' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Set owner_id (user creating or admin creating for someone)
        const ownerId = data.owner_id && isAdmin ? data.owner_id : user.id

        // Generate slug if not provided
        let slug = data.slug
        if (!slug) {
          slug = data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        }

        // Check slug uniqueness
        let finalSlug = slug
        let slugCounter = 1
        let attempts = 0
        const maxAttempts = 100

        while (attempts < maxAttempts) {
          const { data: existing } = await supabase
            .from('businesses')
            .select('id')
            .eq('slug', finalSlug)
            .maybeSingle()

          if (!existing) break

          finalSlug = `${slug}-${slugCounter}`
          slugCounter++
          attempts++
        }

        if (attempts >= maxAttempts) {
          finalSlug = `${slug}-${user.id.slice(0, 8)}`
        }

        // Prepare business data
        const businessData: any = {
          owner_id: ownerId,
          name: data.name,
          slug: finalSlug,
          category: data.category,
          description: data.description || null,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email || null,
          address: data.address,
          website_url: data.website_url || null,
          opening_hours: data.opening_hours || null,
          social_links: data.social_links || null,
          logo_url: data.logo_url || null,
          images: data.images || [],
          is_verified: data.is_verified !== undefined ? data.is_verified : false,
          is_active: data.is_active !== undefined ? data.is_active : true,
        }

        // Add location coords if provided
        if (data.location_coords) {
          businessData.location_coords = `(${data.location_coords.lng},${data.location_coords.lat})`
        }

        const { data: business, error: createError } = await supabase
          .from('businesses')
          .insert(businessData)
          .select()
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: `Failed to create business: ${createError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, business }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        if (!businessId) {
          return new Response(
            JSON.stringify({ error: 'Missing businessId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check ownership or admin status
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('owner_id, slug')
          .eq('id', businessId)
          .single()

        if (!existingBusiness) {
          return new Response(
            JSON.stringify({ error: 'Business not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!isAdmin && existingBusiness.owner_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Not the business owner' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Prepare update data
        const updateData: any = {}
        if (data.name) updateData.name = data.name
        if (data.category) updateData.category = data.category
        if (data.description !== undefined) updateData.description = data.description
        if (data.contact_phone) updateData.contact_phone = data.contact_phone
        if (data.contact_email !== undefined) updateData.contact_email = data.contact_email
        if (data.address) updateData.address = data.address
        if (data.website_url !== undefined) updateData.website_url = data.website_url
        if (data.opening_hours !== undefined) updateData.opening_hours = data.opening_hours
        if (data.social_links !== undefined) updateData.social_links = data.social_links
        if (data.logo_url !== undefined) updateData.logo_url = data.logo_url
        if (data.images !== undefined) updateData.images = data.images
        if (data.is_active !== undefined) updateData.is_active = data.is_active

        // Handle slug update if name changed
        if (data.name && data.name !== existingBusiness.name) {
          const baseSlug = data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

          let finalSlug = baseSlug
          let slugCounter = 1
          let attempts = 0
          const maxAttempts = 100

          while (attempts < maxAttempts) {
            const { data: existing } = await supabase
              .from('businesses')
              .select('id')
              .eq('slug', finalSlug)
              .neq('id', businessId)
              .maybeSingle()

            if (!existing) break

            finalSlug = `${baseSlug}-${slugCounter}`
            slugCounter++
            attempts++
          }

          updateData.slug = finalSlug
        }

        // Admin can change owner and verification status
        if (isAdmin) {
          if (data.owner_id) updateData.owner_id = data.owner_id
          if (data.is_verified !== undefined) updateData.is_verified = data.is_verified
        }

        if (data.location_coords) {
          updateData.location_coords = `(${data.location_coords.lng},${data.location_coords.lat})`
        }

        const { data: business, error: updateError } = await supabase
          .from('businesses')
          .update(updateData)
          .eq('id', businessId)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: `Failed to update business: ${updateError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, business }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        if (!businessId) {
          return new Response(
            JSON.stringify({ error: 'Missing businessId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check ownership or admin status
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('owner_id')
          .eq('id', businessId)
          .single()

        if (!existingBusiness) {
          return new Response(
            JSON.stringify({ error: 'Business not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!isAdmin && existingBusiness.owner_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Not the business owner' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabase
          .from('businesses')
          .delete()
          .eq('id', businessId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: `Failed to delete business: ${deleteError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation. Use: create, update, or delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## Instructions

1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions
2. Click "Create a new function"
3. For each function:
   - Enter the function name (exactly as shown above)
   - Copy the entire code block (from `// Supabase Edge Function:` to the last `})`)
   - Paste into the editor
   - Click "Deploy"

**Done!** After deploying all 3 functions, Phase 2 is complete! 🎉






