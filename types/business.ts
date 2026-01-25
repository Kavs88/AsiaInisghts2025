/**
 * PHASE 1: Canonical Entity Enforcement
 * 
 * Business is the primary, long-term canonical entity.
 * Markets Vendors are Businesses (not a separate conceptual entity).
 * 
 * A Business may appear as:
 * - Market Vendor
 * - Event Host
 * - Rental Space
 * - Service Provider
 * 
 * But Business is the source of truth.
 * 
 * Note: Database still uses `vendors` table and `vendor_id` references
 * for backward compatibility. This abstraction layer provides the
 * Business-first model at the application level.
 */

import { Database } from './database'

// Business type - canonical entity
export type Business = Database['public']['Tables']['vendors']['Row'] & {
  // Business can have multiple roles
  roles?: BusinessRole[]
}

// Business roles/types
export type BusinessRole = 
  | 'market_vendor'
  | 'event_host'
  | 'rental_space'
  | 'service_provider'

// Business types (for future rental spaces & services)
export type BusinessType = 
  | 'market_vendor'
  | 'event_host'
  | 'rental_space'
  | 'service_provider'
  | 'mixed' // Multiple types

// Business capabilities (structural readiness for future features)
export interface BusinessCapabilities {
  hosts_events?: boolean
  rents_space?: boolean
  provides_services?: boolean
  market_vendor?: boolean
}

// Business display metadata
export interface BusinessDisplay {
  id: string
  name: string
  slug: string
  tagline?: string | null
  bio?: string | null
  logoUrl?: string | null
  heroImageUrl?: string | null
  category?: string | null
  isVerified: boolean
  isActive: boolean
  roles?: BusinessRole[]
}

/**
 * Convert vendor data to Business display format
 * This maintains compatibility with existing vendor_id references
 * while presenting the Business-first model to users
 */
export function vendorToBusiness(vendor: Database['public']['Tables']['vendors']['Row']): BusinessDisplay {
  return {
    id: vendor.id,
    name: vendor.name,
    slug: vendor.slug,
    tagline: vendor.tagline,
    bio: vendor.bio,
    logoUrl: vendor.logo_url,
    heroImageUrl: vendor.hero_image_url,
    category: vendor.category,
    isVerified: vendor.is_verified,
    isActive: vendor.is_active,
    roles: ['market_vendor'], // Default role for vendors table entries
  }
}

