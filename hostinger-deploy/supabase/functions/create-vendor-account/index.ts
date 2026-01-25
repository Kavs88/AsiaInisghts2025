// Supabase Edge Function: create-vendor-account
// Atomic creation of user account + vendor profile
// Handles: auth user creation, user record creation, vendor record creation, role assignment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateVendorRequest {
  // User account info
  email: string
  password: string
  fullName: string
  phone?: string
  
  // Vendor info
  vendorName: string
  slug?: string // Optional, will be generated if not provided
  tagline?: string
  bio?: string
  category?: string
  contactEmail?: string
  contactPhone?: string
  websiteUrl?: string
  instagramHandle?: string
  facebookUrl?: string
  deliveryAvailable?: boolean
  pickupAvailable?: boolean
  isActive?: boolean // Default: false for vendor applications, true for admin-created
  isVerified?: boolean // Default: false
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the request is from an authenticated user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: CreateVendorRequest = await req.json()

    // Validate required fields
    if (!body.email || !body.password || !body.fullName || !body.vendorName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, fullName, vendorName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin (for admin-created accounts) or creating their own
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', requestingUser.id)
      .single()

    const isAdmin = userRecord?.role === 'admin' || userRecord?.role === 'super_user'
    const isSelfCreation = requestingUser.email === body.email

    // Only allow admin to create accounts for others, or users to create their own
    if (!isAdmin && !isSelfCreation) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Can only create vendor account for yourself' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Create auth user (if not self-creation)
    let userId: string
    if (isSelfCreation) {
      // User is creating their own vendor account
      userId = requestingUser.id
      
      // Update user role to vendor
      const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'vendor' })
        .eq('id', userId)

      if (roleError) {
        return new Response(
          JSON.stringify({ error: `Failed to update user role: ${roleError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Admin is creating account for someone else
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true, // Auto-confirm for admin-created accounts
        user_metadata: {
          name: body.fullName,
        },
      })

      if (authError || !authData.user) {
        return new Response(
          JSON.stringify({ error: `Failed to create auth user: ${authError?.message || 'Unknown error'}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userId = authData.user.id

      // Wait briefly for trigger to create user record
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Ensure user record exists and set role
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (!existingUser) {
        // Create user record if trigger didn't work
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: body.email,
            full_name: body.fullName,
            phone: body.phone,
            role: 'vendor',
          })

        if (userError) {
          return new Response(
            JSON.stringify({ error: `Failed to create user record: ${userError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        // Update existing user record
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: 'vendor',
            full_name: body.fullName,
            phone: body.phone,
          })
          .eq('id', userId)

        if (updateError) {
          return new Response(
            JSON.stringify({ error: `Failed to update user record: ${updateError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Step 2: Generate unique slug if not provided
    let finalSlug = body.slug
    if (!finalSlug) {
      const baseSlug = body.vendorName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      let slugCounter = 1
      let attempts = 0
      const maxAttempts = 100
      finalSlug = baseSlug

      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('vendors')
          .select('id')
          .eq('slug', finalSlug)
          .maybeSingle()

        if (!existing) break

        finalSlug = `${baseSlug}-${slugCounter}`
        slugCounter++
        attempts++
      }

      if (attempts >= maxAttempts) {
        finalSlug = `${baseSlug}-${userId.slice(0, 8)}`
      }
    } else {
      // Validate provided slug is unique
      const { data: existing } = await supabase
        .from('vendors')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle()

      if (existing) {
        return new Response(
          JSON.stringify({ error: `Slug "${finalSlug}" is already taken` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Step 3: Create vendor record
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        user_id: userId,
        name: body.vendorName,
        slug: finalSlug,
        tagline: body.tagline || null,
        bio: body.bio || null,
        category: body.category || null,
        contact_email: body.contactEmail || body.email,
        contact_phone: body.contactPhone || body.phone || null,
        website_url: body.websiteUrl || null,
        instagram_handle: body.instagramHandle || null,
        facebook_url: body.facebookUrl || null,
        delivery_available: body.deliveryAvailable !== undefined ? body.deliveryAvailable : false,
        pickup_available: body.pickupAvailable !== undefined ? body.pickupAvailable : true,
        is_active: body.isActive !== undefined ? body.isActive : (isAdmin ? true : false),
        is_verified: body.isVerified !== undefined ? body.isVerified : false,
      })
      .select('id, slug, name')
      .single()

    if (vendorError || !vendorData) {
      return new Response(
        JSON.stringify({ 
          error: `Failed to create vendor profile: ${vendorError?.message || 'Unknown error'}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        userId: userId,
        vendorId: vendorData.id,
        vendorSlug: vendorData.slug,
        vendorName: vendorData.name,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})




