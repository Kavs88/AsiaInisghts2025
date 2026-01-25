import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminVendorEditPageClient from './page-client'

/**
 * Edit Vendor Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminVendorEditPage() {
  await requireAdmin()
  return <AdminVendorEditPageClient />
}
