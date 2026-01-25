import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminProductEditPageClient from './page-client'

/**
 * Edit Product Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminProductEditPage() {
  await requireAdmin()
  return <AdminProductEditPageClient />
}
