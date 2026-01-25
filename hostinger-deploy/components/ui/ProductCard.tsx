'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn, formatCurrency } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  imageUrl?: string | null
  vendorName?: string
  vendorSlug?: string
  stockQuantity?: number
  isAvailable?: boolean
  requiresPreorder?: boolean
  preorderLeadDays?: number
  category?: string
  tags?: string[]
  className?: string
}

function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  vendorName,
  vendorSlug,
  stockQuantity = 0,
  isAvailable = true,
  requiresPreorder = false,
  preorderLeadDays,
  category,
  tags,
  className,
}: ProductCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  // Memoize expensive calculations
  const isLowStock = useMemo(() => stockQuantity > 0 && stockQuantity < 10, [stockQuantity])
  const isOutOfStock = useMemo(() => stockQuantity === 0 && !requiresPreorder, [stockQuantity, requiresPreorder])
  const discountPercentage = useMemo(() => {
    if (!compareAtPrice || compareAtPrice <= price) return null
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
  }, [compareAtPrice, price])

  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // TODO: Add to cart logic
  }, [name])

  const handleVendorClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (vendorSlug) {
      router.push(`/sellers/${vendorSlug}`)
    }
  }, [vendorSlug, router])

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  return (
    <article className={cn(
      'group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-lg transition-all duration-300 relative',
      !isAvailable && isOutOfStock && 'opacity-60',
      className
    )}>
      <Link
        href={`/products/${slug}`}
        className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`View ${name} product details`}
      />

      {/* Image Container */}
      <div
        className="relative aspect-square bg-neutral-200 overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {(imageUrl && typeof imageUrl === 'string') ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            quality={80}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-error-600">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Preorder Badge */}
        {requiresPreorder && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-primary-600">
              Preorder
            </span>
          </div>
        )}

        {/* Low Stock Badge */}
        {isLowStock && !requiresPreorder && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-warning-600">
              Low Stock
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}

        {/* Quick Add Hover Overlay */}
        {!isOutOfStock && isHovered && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity duration-200 z-20 pointer-events-auto">
            <button
              onClick={handleQuickAdd}
              className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all duration-200 shadow-xl transform hover:scale-105 pointer-events-auto"
            >
              Quick Add to Cart
            </button>
          </div>
        )}

        {/* Delivery/Pickup Badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold bg-white/95 text-success-700 border border-success-200 rounded-lg backdrop-blur-sm shadow-sm">
            Delivery
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-white/95 text-neutral-700 border border-neutral-200 rounded-lg backdrop-blur-sm shadow-sm">
            Pickup
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 relative z-10 pointer-events-none">
        {/* Vendor Name */}
        {vendorName && vendorSlug && (
          <button
            onClick={handleVendorClick}
            className="text-xs text-neutral-500 hover:text-primary-600 transition-colors mb-1 inline-block relative z-30 text-left pointer-events-auto"
          >
            {vendorName}
          </button>
        )}

        {/* Product Name */}
        <h3 className="text-base font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors relative z-10 pointer-events-none">
          {name}
        </h3>

        {/* Category */}
        {category && (
          <p className="text-xs text-neutral-500 mb-2">{category}</p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-neutral-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price - Prominent */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {formatCurrency(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-base text-neutral-500 line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Info */}
        <div className="flex items-center justify-between text-xs">
          {!requiresPreorder && stockQuantity > 0 && stockQuantity < 10 && (
            <span className="text-warning-600 font-semibold">
              Only {stockQuantity} left
            </span>
          )}
          {requiresPreorder && preorderLeadDays && (
            <span className="text-neutral-500">
              {preorderLeadDays} day lead time
            </span>
          )}
          {!requiresPreorder && stockQuantity >= 10 && (
            <span className="text-success-600 font-medium">In Stock</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default memo(ProductCard)

