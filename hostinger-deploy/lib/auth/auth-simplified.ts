/**
 * SIMPLIFIED SIGNUP - Use this version if the current one keeps failing
 * This version relies entirely on the database trigger for user creation
 */

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Vendor {
  id: string
  slug: string
  name: string
  logo_url?: string | null
}

interface AuthResult {
  user: User
  vendor: Vendor
}

/**
 * Simplified vendor signup - relies on trigger for user creation
 */
export async function signUpVendorSimple(data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Promise<AuthResult> {
  const supabase = createClient()

  // Validate passwords match
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match')
  }

  // Validate password strength
  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        role: 'vendor', // Pass role in metadata for trigger
      },
    },
  })

  if (authError) {
    throw new Error(authError.message || 'Failed to create account')
  }

  if (!authData.user) {
    throw new Error('Failed to create user account')
  }

  // Wait for trigger to create user record (2 seconds to be safe)
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Verify user record exists
  const { data: userRecord, error: userCheckError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', authData.user.id)
    .single()

  if (!userRecord) {
    throw new Error('User profile was not created automatically. Please contact support.')
  }

  // Generate slug
  const baseSlug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let finalSlug = baseSlug
  let slugCounter = 1
  let attempts = 0
  const maxAttempts = 10

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
    finalSlug = `${baseSlug}-${authData.user.id.slice(0, 8)}`
  }

  // Create vendor record
  await new Promise(resolve => setTimeout(resolve, 500))

  const { data: vendorData, error: vendorError } = await supabase
    .from('vendors')
    // @ts-ignore
    .insert({
      name: data.name,
      slug: finalSlug,
      contact_email: data.email,
      is_active: true,
      user_id: authData.user.id,
    })
    .select('id, slug, name')
    .single()

  if (vendorError) {
    // Don't clean up - let admin handle it
    if (vendorError.message?.includes('row-level security') || vendorError.message?.includes('policy')) {
      throw new Error('Vendor creation blocked by security policy. Please run: supabase/fix_vendor_insert_policy.sql in Supabase SQL Editor.')
    }
    throw new Error(`Failed to create vendor profile: ${vendorError.message || 'Unknown error'}`)
  }

  if (!vendorData) {
    throw new Error('Vendor record was created but no data was returned.')
  }

  return {
    user: authData.user,
    vendor: vendorData,
  }
}





