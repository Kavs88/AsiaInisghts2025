import Link from 'next/link'
import Image from 'next/image'

interface Vendor {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price: number | null
  stock_quantity: number | null
  is_available: boolean
  image_urls: string[] | null
  created_at: string
  vendors: Vendor | null
}

interface Props {
  products: Product[]
  page: number
  totalPages: number
  total: number
  error: string | null
}

export default function AdminProductsPageClient({ products, page, totalPages, total, error }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Product Curation</h1>
            <p className="text-neutral-600">Review and celebrate artisan offerings</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-medium">Failed to load products.</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-sm text-neutral-500">{total} product{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_urls?.[0] ? (
                            <Image
                              src={product.image_urls[0]}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-neutral-900">{product.name}</div>
                            <div className="text-xs text-neutral-400">/{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {product.vendors ? (
                          <Link href={`/vendors/${product.vendors.slug}`} className="hover:underline">
                            {product.vendors.name}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-semibold text-neutral-900">${product.price.toFixed(2)}</span>
                        {product.compare_at_price && (
                          <div className="text-xs text-neutral-400 line-through">${product.compare_at_price.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.stock_quantity != null ? (
                          <span className={product.stock_quantity > 0 ? 'text-green-700' : 'text-red-700'}>
                            {product.stock_quantity}
                          </span>
                        ) : <span className="text-neutral-400">N/A</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                          {product.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/markets/admin/products/${product.id}/edit`}
                          className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
