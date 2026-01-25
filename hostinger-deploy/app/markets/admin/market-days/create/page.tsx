import { requireAdmin } from '@/lib/auth/server-admin-check'
import CreateMarketDayPageClient from './page-client'

/**
 * Create Market Day Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function CreateMarketDayPage() {
  await requireAdmin()
  return <CreateMarketDayPageClient />
}

