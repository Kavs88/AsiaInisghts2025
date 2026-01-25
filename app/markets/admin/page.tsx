import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminDashboardClient from './page-client'

/**
 * Admin Dashboard - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminDashboard() {
  // Server-side admin check - redirects if not admin
  await requireAdmin()
  
  // If we get here, user is admin
  return <AdminDashboardClient />
}
