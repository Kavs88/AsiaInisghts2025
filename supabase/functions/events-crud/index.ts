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






