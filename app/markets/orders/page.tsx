import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import EmptyState from '@/components/ui/EmptyState'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import OrdersAutoRefresh from './OrdersAutoRefresh'

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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const email = typeof searchParams.email === 'string' ? searchParams.email : undefined

  // Pre-populate email from server-side auth session if not in URL
  let userEmail: string | undefined
  if (!email) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userEmail = user?.email ?? undefined
    } catch {
      // Not authenticated — continue without pre-population
    }
  }

  const defaultEmail = email ?? userEmail ?? ''

  // Fetch orders server-side when email is provided
  let orderIntents: OrderIntent[] = []
  let fetchError: string | null = null

  if (email) {
    try {
      const supabase = await createClient()
      const { data, error } = await (supabase
        .from('order_intents') as any)
        .select(`
          *,
          products(*, vendors(name, slug, logo_url)),
          vendors(id, name, slug),
          market_days(id, market_date, location_name)
        `)
        .eq('customer_email', email)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      orderIntents = (data || []) as OrderIntent[]
    } catch (error: any) {
      fetchError = error.message || 'Failed to load orders. Please try again.'
    }
  }

  const statusColors = {
    pending: 'bg-secondary-50 text-secondary-700 border-secondary-100',
    confirmed: 'bg-brand-50 text-brand-700 border-brand-100',
    declined: 'bg-error-50 text-error-600 border-error-100',
    fulfilled: 'bg-success-50 text-success-700 border-success-100',
    cancelled: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  }

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      {/* Auto-refresh island — preserves 30s polling behaviour when email is active */}
      {email && <OrdersAutoRefresh email={email} />}

      {/* Page Header */}
      <section className="bg-neutral-900 text-white py-12 lg:py-20">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">My Orders</h1>
          <p className="text-lg text-neutral-300">Track your order status</p>
        </div>
      </section>

      {/* Search Form — native GET, no JS required */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container-custom max-w-2xl">
          <form method="GET" action="/markets/orders" className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              name="email"
              defaultValue={defaultEmail}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              View Orders
            </button>
          </form>
        </div>
      </section>

      {/* Fetch error */}
      {fetchError && (
        <section className="pt-6">
          <div className="container-custom max-w-4xl">
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl">
              {fetchError}
            </div>
          </div>
        </section>
      )}

      {/* Orders List */}
      <section className="py-12">
        <div className="container-custom max-w-4xl">
          {orderIntents.length > 0 ? (
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
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8 text-neutral-400" />}
              title="You haven't placed any orders yet"
              description="If you recently purchased an item, ensure you're using the correct email address."
              className="my-12 shadow-soft bg-white"
            />
          ) : (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8 text-neutral-400" />}
              title="View Your Orders"
              description="Enter your email address above to securely check your order history."
              className="my-12 shadow-soft bg-white"
            />
          )}
        </div>
      </section>
    </main>
  )
}
