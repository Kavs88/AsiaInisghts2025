import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminProductsPageClient from './page-client'

/**
 * Admin Products Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminProductsPage() {
  await requireAdmin()
  return <AdminProductsPageClient />
}
