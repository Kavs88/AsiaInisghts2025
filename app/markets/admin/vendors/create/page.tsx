import { requireAdmin } from '@/lib/auth/server-admin-check'
import CreateVendorPageClient from './page-client'

/**
 * Create Vendor Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function CreateVendorPage() {
  await requireAdmin()
  return <CreateVendorPageClient />
}




