'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'
import { isAdminOrSuperUser } from '@/lib/auth/admin'
import Link from 'next/link'

export default function AdminOrderDetailsPageClient() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [order, setOrder] = useState<any>(null)
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

        // Fetch order
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            vendors (
              id,
              name,
              slug
            ),
            order_items (
              *,
              products (
                id,
                name,
                slug,
                image_urls
              )
            )
          `)
          .eq('id', params.id as string)
          .single()

        if (orderError) {
          setError(orderError.message)
        } else {
          setOrder(data)
        }
      } catch (err: any) {
        console.error('[AdminOrderDetails] Error:', err)
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
            <Link href="/admin/orders" className="text-primary-600 hover:underline">
              ← Back to Orders
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Order Not Found</h2>
            <p className="text-error-800 mb-4">{error || 'The order you are looking for does not exist.'}</p>
            <Link href="/admin/orders" className="text-primary-600 hover:underline">
              ← Back to Orders
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
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Order Details</h1>
            <p className="text-neutral-600">Order: {order.order_number || order.id.slice(0, 8)}</p>
          </div>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Order Items</h2>
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                      {item.products?.image_urls?.[0] && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          <img
                            src={item.products.image_urls[0]}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-neutral-900">{item.products?.name || 'Unknown Product'}</div>
                        <div className="text-sm text-neutral-600">
                          Quantity: {item.quantity} × ${parseFloat(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="font-semibold text-neutral-900">
                        ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">No items found</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Status</span>
                  <span className={`font-semibold ${
                    order.status === 'completed' ? 'text-success-700' :
                    order.status === 'pending' ? 'text-warning-700' :
                    order.status === 'cancelled' ? 'text-error-700' :
                    'text-neutral-700'
                  }`}>
                    {order.status || 'pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Vendor</span>
                  {order.vendors ? (
                    <Link href={`/vendors/${order.vendors.slug}`} className="text-primary-600 hover:underline">
                      {order.vendors.name}
                    </Link>
                  ) : (
                    <span className="text-neutral-500">Unknown</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total</span>
                  <span className="font-bold text-neutral-900">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Date</span>
                  <span className="text-neutral-900">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Customer Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-neutral-600">Name</span>
                  <div className="text-neutral-900">{order.customer_name || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">Email</span>
                  <div className="text-neutral-900">{order.customer_email || 'N/A'}</div>
                </div>
                {order.customer_phone && (
                  <div>
                    <span className="text-sm text-neutral-600">Phone</span>
                    <div className="text-neutral-900">{order.customer_phone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}




