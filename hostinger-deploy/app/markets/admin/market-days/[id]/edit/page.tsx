import { requireAdmin } from '@/lib/auth/server-admin-check'
import EditMarketDayPageClient from './page-client'

/**
 * Edit Market Day Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function EditMarketDayPage() {
  await requireAdmin()
  return <EditMarketDayPageClient />
}

