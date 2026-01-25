'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn, formatCurrency } from '@/lib/utils'
import { ArrowRight, ShoppingBag } from 'lucide-react'

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
      'group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-neutral-100/50 overflow-hidden transition-all duration-500 hover:-translate-y-1 relative h-full flex flex-col',
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
        className="relative aspect-square bg-neutral-100 overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {(imageUrl && typeof imageUrl === 'string') ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            quality={80}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}

        {/* Interactive Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

        {/* Badges - Top Left/Right */}
        <div className="absolute top-3 left-3 flex gap-1 z-20">
          {discountPercentage && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white bg-error-600 shadow-md">
              -{discountPercentage}%
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-20">
          {requiresPreorder && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white bg-primary-600 shadow-md">
              Preorder
            </span>
          )}
          {isLowStock && !requiresPreorder && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white bg-amber-500 shadow-md">
              Low Stock
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-4 py-2 bg-neutral-900/80 text-white font-bold rounded-xl shadow-lg">Out of Stock</span>
          </div>
        )}

        {/* Delivery/Pickup Badges - Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
          <div className="flex gap-1.5 overflow-hidden">
            <span className="px-2 py-1 text-[10px] font-bold bg-white/90 text-success-700 border border-success-200/50 rounded-md backdrop-blur-md shadow-sm">
              Delivery
            </span>
            <span className="px-2 py-1 text-[10px] font-bold bg-white/90 text-neutral-600 border border-neutral-200/50 rounded-md backdrop-blur-md shadow-sm">
              Pickup
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 relative z-10 pointer-events-none">

        {/* Vendor Name */}
        {vendorName && vendorSlug && (
          <button
            onClick={handleVendorClick}
            className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-primary-600 transition-colors mb-2 inline-block relative z-30 text-left pointer-events-auto"
          >
            {vendorName}
          </button>
        )}

        {/* Product Name */}
        <h3 className="text-lg font-black text-neutral-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors relative z-10 pointer-events-none">
          {name}
        </h3>

        {/* Price - Prominent */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-black text-neutral-900 tracking-tight">
              {formatCurrency(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm font-bold text-neutral-400 line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            )}
          </div>

          {/* Quick Add Button - Always visible on mobile, hover on desktop */}
          <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden pointer-events-auto">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              Add to Cart
            </button>
          </div>

          {/* Default View (when not hovering) */}
          <div className="group-hover:h-0 group-hover:opacity-0 transition-all duration-300">
            <div className="w-full py-2.5 bg-neutral-50 text-neutral-600 font-bold rounded-xl border border-neutral-100 flex items-center justify-center gap-2 text-sm">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>
    </article>
  )
}

export default memo(ProductCard)

