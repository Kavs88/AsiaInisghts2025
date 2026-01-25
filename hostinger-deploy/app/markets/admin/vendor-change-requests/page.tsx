import { requireAdmin } from '@/lib/auth/server-admin-check'
import VendorChangeRequestsClient from './page-client'

export const metadata = {
  title: 'Vendor Change Requests - Admin',
  description: 'Review and manage vendor profile change requests',
}

/**
 * Vendor Change Requests Page - Server Component
 * Verifies admin access before rendering client component
 */
export default async function VendorChangeRequestsPage() {
  await requireAdmin()
  
  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Vendor Change Requests</h1>
          <p className="text-neutral-600">Review and approve vendor profile change requests</p>
        </div>
        <VendorChangeRequestsClient />
      </div>
    </main>
  )
}

