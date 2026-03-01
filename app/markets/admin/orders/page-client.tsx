import Link from 'next/link'

interface Vendor {
  id: string
  name: string
  slug: string
}

interface Order {
  id: string
  order_number: string | null
  status: string
  total_amount: number
  customer_name: string | null
  customer_email: string | null
  created_at: string
  vendors: Vendor | null
}

interface Props {
  orders: Order[]
  page: number
  totalPages: number
  total: number
  error: string | null
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrdersPageClient({ orders, page, totalPages, total, error }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Order Fulfillment</h1>
            <p className="text-neutral-600">Support order processing and delivery</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-medium">Failed to load orders.</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-sm text-neutral-500">{total} order{total !== 1 ? 's' : ''}</p>
          </div>
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-neutral-900">
                      {order.order_number ?? order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {order.vendors ? (
                        <Link href={`/vendors/${order.vendors.slug}`} className="hover:underline">
                          {order.vendors.name}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      <div>{order.customer_name ?? '—'}</div>
                      {order.customer_email && (
                        <div className="text-xs text-neutral-400">{order.customer_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                      ${(order.total_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_STYLES[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                        {order.status ?? 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/markets/admin/orders/${order.id}`}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}`}
                  className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}`}
                  className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
