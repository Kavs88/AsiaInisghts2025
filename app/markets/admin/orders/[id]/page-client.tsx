import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  image_urls: string[] | null
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  products: Product | null
}

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
  customer_phone: string | null
  created_at: string
  vendors: Vendor | null
  order_items: OrderItem[]
}

interface Props {
  order: Order
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'text-green-700',
  pending:   'text-amber-700',
  cancelled: 'text-red-700',
}

export default function AdminOrderDetailsPageClient({ order }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Order Details</h1>
            <p className="text-neutral-600">{order.order_number ?? order.id.slice(0, 8)}</p>
          </div>
          <Link
            href="/markets/admin/orders"
            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Items</h2>
              {order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                      {item.products?.image_urls?.[0] ? (
                        <Image
                          src={item.products.image_urls[0]}
                          alt={item.products.name}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-neutral-200 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-neutral-900">
                          {item.products?.name ?? 'Unknown Product'}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {item.quantity} × ${(item.price ?? 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="font-semibold text-neutral-900">
                        ${((item.price ?? 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">No items found.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Status</dt>
                  <dd className={`font-semibold ${STATUS_STYLES[order.status] ?? 'text-neutral-700'}`}>
                    {order.status ?? 'pending'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Vendor</dt>
                  <dd>
                    {order.vendors ? (
                      <Link href={`/vendors/${order.vendors.slug}`} className="text-primary-600 hover:underline">
                        {order.vendors.name}
                      </Link>
                    ) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Total</dt>
                  <dd className="font-bold text-neutral-900">${(order.total_amount ?? 0).toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Date</dt>
                  <dd className="text-neutral-700">{new Date(order.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Customer</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-neutral-500">Name</dt>
                  <dd className="text-neutral-900">{order.customer_name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Email</dt>
                  <dd className="text-neutral-900">{order.customer_email ?? '—'}</dd>
                </div>
                {order.customer_phone && (
                  <div>
                    <dt className="text-neutral-500">Phone</dt>
                    <dd className="text-neutral-900">{order.customer_phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
