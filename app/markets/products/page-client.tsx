'use client'

import { useState, useMemo } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  imageUrl?: string
  vendorName?: string
  vendorSlug?: string
  stockQuantity?: number
  isAvailable?: boolean
  requiresPreorder?: boolean
  preorderLeadDays?: number
  category?: string
  tags?: string[]
}

interface ProductsPageClientProps {
  products: Product[]
  categories: string[]
  allTags: string[]
}

export default function ProductsPageClient({ products, categories, allTags }: ProductsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Filter products based on category and tags
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false
      }

      // Tags filter (product must have at least one selected tag)
      if (selectedTags.length > 0) {
        const productTags = product.tags || []
        const hasSelectedTag = selectedTags.some(tag => productTags.includes(tag))
        if (!hasSelectedTag) {
          return false
        }
      }

      return true
    })
  }, [products, selectedCategory, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <>
      {/* Filters */}
      <section className="py-6 bg-white border-b border-neutral-200 sticky top-[64px] lg:top-[80px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Category Filters */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${selectedCategory === category
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-neutral-300 hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-neutral-300 hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear tags
                </button>
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
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
            </p>
            {(selectedCategory !== 'All' || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedTags([])
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16">
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
            <div className="text-center py-16">
              <p className="text-xl text-neutral-600 mb-4">
                No products found
              </p>
              <p className="text-neutral-500 mb-6">
                Try adjusting your filters
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedTags([])
                }}
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}


