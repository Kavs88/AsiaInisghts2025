'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCustomerOrderIntents } from '@/lib/supabase/queries'
import Toast, { ToastType } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface OrderIntent {
  id: string
  product_id: string
  vendor_id: string
  market_day_id: string
  intent_type: 'pickup' | 'delivery'
  quantity: number
  customer_name: string
  customer_email: string
  customer_notes?: string | null
  status: 'pending' | 'confirmed' | 'declined' | 'fulfilled' | 'cancelled'
  created_at: string
  updated_at?: string
  products?: {
    id: string
    name: string
    slug: string
    image_urls?: string[]
  }
  vendors?: {
    id: string
    name: string
    slug: string
  }
  market_days?: {
    id: string
    market_date: string
    location_name: string
  }
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')
  
  const [email, setEmail] = useState(emailParam || '')
  const [orderIntents, setOrderIntents] = useState<OrderIntent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  })

  const fetchOrderIntents = async (customerEmail: string) => {
    if (!customerEmail || !customerEmail.includes('@')) {
      setToast({
        message: 'Please enter a valid email address',
        type: 'error',
        visible: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const intents = await getCustomerOrderIntents(customerEmail)
      setOrderIntents(intents || [])
      
      if (intents && intents.length === 0) {
        setToast({
          message: 'No orders found for this email address',
          type: 'info',
          visible: true,
        })
      }
    } catch (error: any) {
      console.error('Error fetching order intents:', error)
      setToast({
        message: error.message || 'Failed to load orders. Please try again.',
        type: 'error',
        visible: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (emailParam) {
      fetchOrderIntents(emailParam)
    }
  }, [emailParam])

  // Auto-refresh every 30 seconds if email is set
  useEffect(() => {
    if (!email) return

    const interval = setInterval(() => {
      fetchOrderIntents(email)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [email])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrderIntents(email)
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    declined: 'bg-red-100 text-red-800 border-red-200',
    fulfilled: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  }

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-12 lg:py-16">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">My Orders</h1>
          <p className="text-lg text-white/90">Track your order status</p>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container-custom max-w-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isLoading ? 'Loading...' : 'View Orders'}
            </button>
          </form>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-12">
        <div className="container-custom max-w-4xl">
          {isLoading && orderIntents.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-neutral-600">Loading orders...</p>
            </div>
          ) : orderIntents.length > 0 ? (
            <div className="space-y-6">
              {orderIntents.map((intent) => (
                <div
                  key={intent.id}
                  className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-200"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    {intent.products?.image_urls && intent.products.image_urls.length > 0 && (
                      <div className="relative w-full sm:w-24 h-24 flex-shrink-0 bg-neutral-200 rounded-xl overflow-hidden">
                        <Image
                          src={intent.products.image_urls[0]}
                          alt={intent.products.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-neutral-900 mb-2">
                            {intent.products?.name || 'Product'}
                          </h3>
                          <div className="space-y-1 text-sm text-neutral-600">
                            <p>
                              <span className="font-medium">Vendor:</span>{' '}
                              {intent.vendors?.name || 'Unknown'}
                            </p>
                            <p>
                              <span className="font-medium">Quantity:</span> {intent.quantity}
                            </p>
                            <p>
                              <span className="font-medium">Type:</span>{' '}
                              {intent.intent_type === 'pickup' ? 'Market Pickup' : 'Delivery'}
                            </p>
                            {intent.market_days && (
                              <p>
                                <span className="font-medium">Market:</span>{' '}
                                {intent.market_days.location_name} on{' '}
                                {new Date(intent.market_days.market_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={cn(
                            'px-4 py-2 text-sm font-medium rounded-full border whitespace-nowrap',
                            statusColors[intent.status] || 'bg-neutral-100 text-neutral-800 border-neutral-200'
                          )}
                        >
                          {intent.status.charAt(0).toUpperCase() + intent.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200">
                        <p className="text-xs text-neutral-500">
                          Submitted: {new Date(intent.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {intent.updated_at && intent.updated_at !== intent.created_at && (
                            <> • Updated: {new Date(intent.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}</>
                          )}
                        </p>
                        {intent.vendors?.slug && (
                          <Link
                            href={`/vendors/${intent.vendors.slug}`}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View Vendor →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : email ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
              <p className="text-neutral-600">No orders found for this email address.</p>
              <p className="text-sm text-neutral-500 mt-2">
                Make sure you're using the same email you used when placing the order.
              </p>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
              <p className="text-neutral-600">Enter your email address above to view your orders.</p>
            </div>
          )}
        </div>
      </section>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </main>
  )
}

