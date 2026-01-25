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




