'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'
import { isAdminOrSuperUser } from '@/lib/auth/admin'
import Link from 'next/link'

export default function AdminProductEditPageClient() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const adminStatus = await isAdminOrSuperUser()
        setIsAdminUser(adminStatus)
        setIsChecking(false)

        if (!adminStatus) {
          return
        }

        // Fetch product
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            vendors (
              id,
              name,
              slug
            )
          `)
          .eq('id', params.id as string)
          .single()

        if (productError) {
          setError(productError.message)
        } else {
          setProduct(data)
        }
      } catch (err: any) {
        console.error('[AdminProductEdit] Error:', err)
        setIsAdminUser(false)
        setIsChecking(false)
        setError(err.message)
      }
    }

    checkAdminAndLoad()
  }, [user, authLoading, router, params.id])

  if (authLoading || isChecking) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Checking admin access...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  if (!isAdminUser) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Access Denied</h2>
            <p className="text-error-800 mb-4">You do not have admin privileges.</p>
            <Link href="/admin/products" className="text-primary-600 hover:underline">
              ← Back to Products
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Product Not Found</h2>
            <p className="text-error-800 mb-4">{error || 'The product you are looking for does not exist.'}</p>
            <Link href="/admin/products" className="text-primary-600 hover:underline">
              ← Back to Products
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Edit Product</h1>
            <p className="text-neutral-600">Edit product: {product.name}</p>
          </div>
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            ← Back to Products
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="bg-info-50 border border-info-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-info-900 mb-2">Edit Functionality Coming Soon</h3>
            <p className="text-info-800">
              The edit form for products is under development. For now, you can view the product details below.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Product Name</label>
              <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                {product.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Vendor</label>
              <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                {product.vendors ? (
                  <Link href={`/vendors/${product.vendors.slug}`} className="text-primary-600 hover:underline">
                    {product.vendors.name}
                  </Link>
                ) : (
                  'Unknown'
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Price</label>
              <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                ${parseFloat(product.price).toFixed(2)}
                {product.compare_at_price && (
                  <span className="ml-2 text-sm text-neutral-500 line-through">
                    ${parseFloat(product.compare_at_price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Stock Quantity</label>
              <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                {product.stock_quantity !== null ? product.stock_quantity : 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
              <div className="flex gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.is_available ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {product.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200">
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                View Public Product
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}




