import { getProducts } from '@/lib/supabase/queries'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'

export const revalidate = 1800

export const metadata = {
  title: 'Products | AI Markets',
  description: 'Browse all products from our artisan sellers',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string | string[]; tag?: string | string[] }
}) {
  // Normalize searchParams — guard against array values
  const category = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : (searchParams.category ?? 'All')

  const activeTags = searchParams.tag
    ? (Array.isArray(searchParams.tag) ? searchParams.tag : [searchParams.tag])
    : []

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

  // Server-side filtering — identical semantics to previous client filter
  const filteredProducts = mappedProducts.filter((product) => {
    // Category filter
    if (category !== 'All' && product.category !== category) {
      return false
    }

    // Tags filter (product must have at least one selected tag)
    if (activeTags.length > 0) {
      const productTags = product.tags || []
      const hasSelectedTag = activeTags.some(tag => productTags.includes(tag))
      if (!hasSelectedTag) {
        return false
      }
    }

    return true
  })

  // URL helpers — preserve active filters across category/tag navigation
  function getCategoryUrl(cat: string) {
    const params = new URLSearchParams()
    if (cat !== 'All') params.set('category', cat)
    activeTags.forEach(t => params.append('tag', t))
    const qs = params.toString()
    return `/markets/products${qs ? `?${qs}` : ''}`
  }

  function getTagToggleUrl(tag: string) {
    const newTags = activeTags.includes(tag)
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag]
    const params = new URLSearchParams()
    if (category !== 'All') params.set('category', category)
    newTags.forEach(t => params.append('tag', t))
    const qs = params.toString()
    return `/markets/products${qs ? `?${qs}` : ''}`
  }

  const clearTagsUrl = category !== 'All'
    ? `/markets/products?category=${encodeURIComponent(category)}`
    : '/markets/products'

  const clearFiltersUrl = '/markets/products'

  return (
    <main id="main-content" className="min-h-screen">
      {/* Page Header */}
      <section className="bg-neutral-900 text-white py-20 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 leading-tight">All Products</h1>
            <p className="text-lg lg:text-xl text-neutral-300 max-w-3xl font-medium">
              Discover handcrafted products from local artisans and makers
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b border-neutral-200 sticky top-[64px] lg:top-[80px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Category Filters */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={getCategoryUrl(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-2xl border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${category === cat
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-neutral-300 hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = activeTags.includes(tag)
                  return (
                    <Link
                      key={tag}
                      href={getTagToggleUrl(tag)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-2xl border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-neutral-300 hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                    >
                      {tag}
                    </Link>
                  )
                })}
              </div>
              {activeTags.length > 0 && (
                <Link
                  href={clearTagsUrl}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear tags
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-neutral-600">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {category !== 'All' && ` in ${category}`}
              {activeTags.length > 0 && ` with tags: ${activeTags.join(', ')}`}
            </p>
            {(category !== 'All' || activeTags.length > 0) && (
              <Link
                href={clearFiltersUrl}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </Link>
            )}
          </div>
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">No products available</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                Our artisans are currently restocking. Check back soon for new handcrafted items!
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-neutral-600 mb-4">
                No products found
              </p>
              <p className="text-neutral-500 mb-6">
                Try adjusting your filters
              </p>
              <Link
                href={clearFiltersUrl}
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Clear All Filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
