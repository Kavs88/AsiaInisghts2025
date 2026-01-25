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






