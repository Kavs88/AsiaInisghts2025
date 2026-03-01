import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updateVendorProduct } from '@/lib/actions/vendor-products'
import ProductFormClient from '../../new/form-client'

interface Props {
  params: Promise<{ id: string }> | { id: string }
}

export const metadata = {
  title: 'Edit Product | Business Hub',
}

export default async function EditVendorProductPage({ params }: Props) {
  const { id } = params instanceof Promise ? await params : params

  const supabase = await createClient()
  if (!supabase) redirect('/markets/vendor/apply')

  // getUser() verifies JWT server-side — not a stale cookie read
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect(`/auth/login?redirect=/markets/vendor/dashboard/products/${id}/edit`)
  }

  const { getUserAuthorityServer } = await import('@/lib/auth/authority')
  const authority = await getUserAuthorityServer()

  if (authority.effectiveRole !== 'vendor' && !authority.isAdmin) {
    redirect('/markets/vendor/apply')
  }

  // Resolve vendor
  const { data: vendorData } = await (supabase.from('vendors') as any)
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!vendorData) redirect('/markets/vendor/apply')

  // Fetch product — verify ownership
  const { data: product, error } = await (supabase.from('products') as any)
    .select('id, name, description, price, category, stock_quantity, is_available, vendor_id, image_urls')
    .eq('id', id)
    .single()

  if (error || !product) notFound()
  if (product.vendor_id !== vendorData.id && !authority.isAdmin) notFound()

  async function boundUpdateAction(formData: FormData) {
    'use server'
    return updateVendorProduct(id, formData)
  }

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
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-1">Edit Product</h1>
          <p className="text-neutral-500">
            Updating <span className="font-semibold text-primary-600">{product.name}</span>
          </p>
        </div>

        <ProductFormClient
          action={boundUpdateAction}
          initialValues={{
            name: product.name,
            description: product.description ?? '',
            price: product.price,
            category: product.category ?? '',
            stock_quantity: product.stock_quantity ?? 0,
            is_available: product.is_available ?? true,
            image_url: product.image_urls?.[0] ?? '',
          }}
          vendorId={vendorData.id}
          productId={id}
          submitLabel="Save Changes"
        />
      </div>
    </main>
  )
}
