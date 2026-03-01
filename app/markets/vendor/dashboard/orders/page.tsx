import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import EmptyState from '@/components/ui/EmptyState'
import { ShoppingBag, ShoppingCart } from 'lucide-react'
import { updateOrderStatus } from '@/lib/actions/vendor-products'
import OrderStatusForm from './status-form'

export const metadata = {
  title: 'Orders | Business Hub',
  description: 'Manage your customer orders',
}

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/markets/vendor/apply')

  // getUser() verifies JWT server-side — not a stale cookie read
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login?redirect=/markets/vendor/dashboard/orders')
  }

  const { getUserAuthorityServer } = await import('@/lib/auth/authority')
  const authority = await getUserAuthorityServer()

  if (authority.effectiveRole !== 'vendor' && !authority.isAdmin) {
    redirect('/markets/vendor/apply')
  }

  let vendorData: any = null

  if (authority.hasVendorRecord) {
    const { data } = await (supabase.from('vendors') as any)
      .select('id, name')
      .eq('user_id', user.id)
      .single()
    vendorData = data
  } else if (authority.isAdmin) {
    return (
      <div className="container-custom py-10">
        <EmptyState
          title="Admin View Restricted"
          description="Admins must impersonate a vendor to view their specific orders."
          action={{ label: 'Go to Admin Panel', href: '/markets/admin' }}
        />
      </div>
    )
  }

  if (!vendorData) redirect('/markets/vendor/apply')

  const { data: ordersData } = await (supabase.from('order_intents') as any)
    .select('*, products(name, price, image_urls)')
    .eq('vendor_id', vendorData.id)
    .order('created_at', { ascending: false })

  const orders: any[] = ordersData || []

  const pendingCount  = orders.filter(o => o.status === 'pending').length
  const nowMonth      = new Date().getMonth()
  const nowYear       = new Date().getFullYear()
  const salesThisMonth = orders
    .filter(o => {
      const d = new Date(o.created_at)
      return (o.status === 'confirmed' || o.status === 'fulfilled')
        && d.getMonth() === nowMonth
        && d.getFullYear() === nowYear
    })
    .reduce((acc, o) => acc + (o.quantity * (o.products?.price ?? 0)), 0)

  const STATUS_STYLES: Record<string, string> = {
    pending:   'bg-amber-50 text-amber-700 border-amber-200/50',
    contacted: 'bg-blue-50 text-blue-700 border-blue-200/50',
    confirmed: 'bg-primary-50 text-primary-700 border-primary-200/50',
    fulfilled: 'bg-success-50 text-success-700 border-success-200/50',
    cancelled: 'bg-neutral-100 text-neutral-500 border-neutral-200/50',
  }

  const NEXT_STATUS: Record<string, string> = {
    pending:   'contacted',
    contacted: 'confirmed',
    confirmed: 'fulfilled',
  }

  const STATUS_LABEL: Record<string, string> = {
    pending:   'Pending',
    contacted: 'Contacted',
    confirmed: 'Confirmed',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled',
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/markets/vendor/dashboard"
            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-4 transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-1">Orders & Sales</h1>
          <p className="text-neutral-500">
            Customer requests for <span className="font-semibold text-primary-600">{vendorData.name}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-neutral-200/60 flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Needs Fulfillment</div>
              <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-neutral-200/60 flex items-center gap-4">
            <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Sales This Month</div>
              <div className="text-2xl font-black text-primary-600">${salesThisMonth.toFixed(2)}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-neutral-200/60 flex items-center gap-4">
            <div className="w-11 h-11 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Total Orders</div>
              <div className="text-2xl font-black text-neutral-700">{orders.length}</div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100">
                    <th className="py-4 px-5 text-xs font-bold text-neutral-400 uppercase tracking-wider">Order</th>
                    <th className="py-4 px-5 text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer</th>
                    <th className="py-4 px-5 text-xs font-bold text-neutral-400 uppercase tracking-wider">Item</th>
                    <th className="py-4 px-5 text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-5 text-xs font-bold text-neutral-400 uppercase tracking-wider">Total</th>
                    <th className="py-4 px-5 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((order: any) => {
                    const productPrice = order.products?.price ?? 0
                    const total        = order.quantity * productPrice
                    const nextStatus   = NEXT_STATUS[order.status]
                    const canProgress  = !!nextStatus

                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-neutral-900 text-sm tracking-tight font-mono">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </div>
                          {order.intent_type && (
                            <div className="text-xs text-neutral-400 mt-0.5 capitalize">{order.intent_type}</div>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-semibold text-neutral-900 text-sm">{order.customer_name}</div>
                          {order.customer_email && (
                            <div className="text-xs text-neutral-400 truncate max-w-[160px]">{order.customer_email}</div>
                          )}
                          {order.customer_phone && (
                            <a href={`tel:${order.customer_phone}`} className="text-xs text-primary-600 hover:underline">
                              {order.customer_phone}
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-medium text-neutral-800 text-sm">{order.products?.name ?? 'Unknown'}</div>
                          <div className="text-xs text-neutral-400">Qty: {order.quantity}</div>
                          {order.customer_notes && (
                            <div className="text-xs text-neutral-500 italic mt-0.5 max-w-[180px] truncate" title={order.customer_notes}>
                              &ldquo;{order.customer_notes}&rdquo;
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-1.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${STATUS_STYLES[order.status] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                              {STATUS_LABEL[order.status] ?? order.status}
                            </span>
                            {canProgress && (
                              <OrderStatusForm
                                orderId={order.id}
                                nextStatus={nextStatus}
                                action={updateOrderStatus}
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 font-semibold text-neutral-900 text-sm">
                          ${total.toFixed(2)}
                        </td>
                        <td className="py-4 px-5 text-right text-xs text-neutral-400 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 px-6">
              <EmptyState
                icon={<ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto" />}
                title="No orders yet"
                description="When customers place requests for your products, they'll appear here securely."
              />
            </div>
          )}
        </div>

        {/* Status Guide */}
        {orders.length > 0 && (
          <div className="mt-6 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Order Flow</p>
            <div className="flex flex-wrap gap-2 items-center text-xs text-neutral-500">
              {['Pending', 'Contacted', 'Confirmed', 'Fulfilled'].map((s, i, arr) => (
                <span key={s} className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-700">{s}</span>
                  {i < arr.length - 1 && <span className="text-neutral-300">→</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
