import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getVendorBySlug } from '@/lib/supabase/queries'
import VendorProfileEditClient from './page-client'

export const metadata = {
  title: 'Edit Profile - Vendor Dashboard',
  description: 'Edit your vendor profile and images',
}

export default async function VendorProfileEditPage() {
  const supabase = await createClient()
  if (!supabase) {
    redirect('/markets/vendor/apply')
  }

  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    // QA FIX: Redirect updated to use /markets/* prefix
    redirect('/markets/vendor/apply')
  }

  // Get vendor data
  const { data: userData } = await (supabase
    .from('users') as any)
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!userData) {
    // QA FIX: Redirect updated to use /markets/* prefix
    redirect('/markets/vendor/apply')
  }

  // Get vendor record
  const { data: vendorData } = await (supabase
    .from('vendors') as any)
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (!vendorData) {
    // QA FIX: Redirect updated to use /markets/* prefix
    redirect('/markets/vendor/apply')
  }

  // Map vendor data
  const vendor = {
    id: (vendorData as any).id,
    name: (vendorData as any).name,
    slug: (vendorData as any).slug,
    tagline: (vendorData as any).tagline || (vendorData as any).short_tagline || '',
    bio: (vendorData as any).bio || '',
    category: (vendorData as any).category || '',
    logoUrl: (vendorData as any).logo_url,
    heroImageUrl: (vendorData as any).hero_image_url,
    contactEmail: (vendorData as any).contact_email || '',
    contactPhone: (vendorData as any).contact_phone || '',
    websiteUrl: (vendorData as any).website_url || '',
    instagramHandle: (vendorData as any).instagram_handle || (vendorData as any).social_links?.instagram || '',
    deliveryAvailable: (vendorData as any).delivery_available || false,
    pickupAvailable: (vendorData as any).pickup_available !== false,
  }

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Request Profile Changes</h1>
          <p className="text-neutral-600">Submit a request to update your business information. Changes require admin approval.</p>
        </div>
        <VendorProfileEditClient vendor={vendor} />
      </div>
    </main>
  )
}

