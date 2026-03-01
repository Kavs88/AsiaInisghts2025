'use client'

import Link from 'next/link'

interface Props {
  product: any
}

export default function AdminProductEditPageClient({ product }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Edit Product</h1>
            <p className="text-neutral-600">Edit product: {product.name}</p>
          </div>
          <Link
            href="/markets/admin/products"
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




