import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminPropertiesPageClient from './page-client'

/**
 * Admin Properties Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminPropertiesPage() {
  await requireAdmin()
  return <AdminPropertiesPageClient />
}




