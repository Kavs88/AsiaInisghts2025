import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminBusinessesPageClient from './page-client'

/**
 * Admin Businesses Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminBusinessesPage() {
  await requireAdmin()
  return <AdminBusinessesPageClient />
}






