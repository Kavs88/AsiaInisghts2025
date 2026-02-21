import { getProducts } from '@/lib/supabase/queries'
import ProductsPageClient from './page-client'

export const metadata = {
  title: 'Products | AI Markets',
  description: 'Browse all products from our artisan sellers',
}

export default async function ProductsPage() {
  // Fetch real data from Supabase with limit for performance
  let products: any[] = []

  try {
    // Limit products to 100 for initial load (add pagination later)
    const allProducts = await getProducts(100)
    products = allProducts || []
  } catch (error) {
    console.error('Error fetching products:', error)
    // Fallback to empty array
  }

  // Map database fields to component props
  const mappedProducts = products.map((p: any) => {
    const vendor = p.vendors || {}
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: parseFloat(p.price),
      compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : undefined,
      imageUrl: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : undefined,
      vendorName: vendor.name,
      vendorSlug: vendor.slug,
      stockQuantity: p.stock_quantity || 0,
      isAvailable: p.is_available,
      requiresPreorder: p.requires_preorder,
      preorderLeadDays: p.preorder_lead_days,
      category: p.category,
      tags: p.tags || [],
    }
  })

  // Extract unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  // Extract all unique tags from products
  const allTags = Array.from(new Set(products.flatMap(p => p.tags || []).filter(Boolean)))

  return (
    <main id="main-content" className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-4 lg:mb-6 leading-tight">All Products</h1>
            <p className="text-lg lg:text-xl xl:text-2xl text-white/95 max-w-3xl font-medium">
              Discover handcrafted products from local artisans and makers
            </p>
          </div>
        </div>
      </section>

      <ProductsPageClient
        products={mappedProducts}
        categories={categories}
        allTags={allTags}
      />
    </main>
  )
}

