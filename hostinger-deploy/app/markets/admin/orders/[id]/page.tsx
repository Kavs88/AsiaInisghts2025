import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminOrderDetailsPageClient from './page-client'

/**
 * Order Details Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminOrderDetailsPage() {
  await requireAdmin()
  return <AdminOrderDetailsPageClient />
}
