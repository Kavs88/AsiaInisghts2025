import { requireAdmin } from '@/lib/auth/server-admin-check'
import AdminMarketDaysPageClient from './page-client'

/**
 * Admin Market Days Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function AdminMarketDaysPage() {
  await requireAdmin()
  return <AdminMarketDaysPageClient />
}

