import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminVendorsPageClient from './page-client'

/**
 * Admin Vendors Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminVendorsPage() {
  await requireAdmin()
  return <AdminVendorsPageClient />
}
