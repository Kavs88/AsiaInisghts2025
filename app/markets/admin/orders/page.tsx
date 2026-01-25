import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminOrdersPageClient from './page-client'

/**
 * Admin Orders Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminOrdersPage() {
  await requireAdmin()
  return <AdminOrdersPageClient />
}
