'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'
import { isAdminOrSuperUser } from '@/lib/auth/admin'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminProductsPageClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [products, setProducts] = useState<any[]>([])
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

        // Fetch products
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            vendors (
              id,
              name,
              slug
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100)

        if (productsError) {
          setError(productsError.message)
        } else {
          setProducts(data || [])
        }
      } catch (err: any) {
        console.error('[AdminProducts] Error:', err)
        setIsAdminUser(false)
        setIsChecking(false)
        setError(err.message)
      }
    }

    checkAdminAndLoad()
  }, [user, authLoading, router])

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
            <Link href="/admin" className="text-primary-600 hover:underline">
              ← Back to Dashboard
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
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Manage Products</h1>
            <p className="text-neutral-600">View, edit, and manage all products</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 rounded-xl p-4">
            <p className="text-sm text-error-800">Error: {error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {products && products.length > 0 ? (
                  products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                              <Image
                                src={product.image_urls[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-neutral-900">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-neutral-600 line-clamp-1">{product.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.vendors ? (
                          <Link
                            href={`/vendors/${product.vendors.slug}`}
                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {product.vendors.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-neutral-500">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-semibold text-neutral-900">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                          {product.compare_at_price && (
                            <div className="text-xs text-neutral-500 line-through">
                              ${parseFloat(product.compare_at_price).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {product.stock_quantity !== null ? (
                            <span className={product.stock_quantity > 0 ? 'text-success-700' : 'text-error-700'}>
                              {product.stock_quantity}
                            </span>
                          ) : (
                            <span className="text-neutral-500">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.is_available ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      {error ? 'Error loading products' : 'No products found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}




