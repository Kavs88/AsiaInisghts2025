import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createVendorProduct } from '@/lib/actions/vendor-products'
import ProductFormClient from './form-client'

export const metadata = {
  title: 'Add Product | Business Hub',
  description: 'Create a new product offering',
}

export default async function NewVendorProductPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/markets/vendor/apply')

  // getUser() verifies JWT server-side — not a stale cookie read
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login?redirect=/markets/vendor/dashboard/products/new')
  }

  const { getUserAuthorityServer } = await import('@/lib/auth/authority')
  const authority = await getUserAuthorityServer()

  if (authority.effectiveRole !== 'vendor' && !authority.isAdmin) {
    redirect('/markets/vendor/apply')
  }

  if (!authority.hasVendorRecord) {
    redirect('/markets/vendor/apply')
  }

  const { data: vendorData } = await (supabase.from('vendors') as any)
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!vendorData) redirect('/markets/vendor/apply')

  return (
    <main className="min-h-screen bg-neutral-50 py-10">
      <div className="container-custom max-w-2xl">
        <div className="mb-8">
          <Link
            href="/markets/vendor/dashboard/products"
            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-5 transition-colors"
          >
            &larr; Back to Products
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-1">Add New Product</h1>
          <p className="text-neutral-500">
            Adding to <span className="font-semibold text-primary-600">{vendorData.name}</span>
          </p>
        </div>

        <ProductFormClient action={createVendorProduct} vendorId={vendorData.id} />
      </div>
    </main>
  )
}
