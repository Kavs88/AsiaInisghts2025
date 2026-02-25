'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn, formatCurrency } from '@/lib/utils'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { SaveButton } from '@/components/ui/SoftActionButtons'

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
  initialIsSaved?: boolean
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
  initialIsSaved,
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
      'group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-neutral-100/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 relative h-full flex flex-col',
      !isAvailable && isOutOfStock && 'opacity-60',
      className
    )}>
      <Link
        href={`/products/${slug}`}
        className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`View ${name} product details`}
      />

      {/* Image Container - 4:3 Standard for Products */}
      <div
        className="relative aspect-[4/3] bg-neutral-100 overflow-hidden"
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
            <ShoppingBag className="w-12 h-12" strokeWidth={1.5} />
          </div>
        )}

        {/* Interactive Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Badges - Top Left - Minimalist */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20 pointer-events-none">
          {discountPercentage && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold text-white bg-error-500/90 backdrop-blur-sm shadow-sm">
              -{discountPercentage}%
            </span>
          )}
          {requiresPreorder && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold text-white bg-primary-600/90 backdrop-blur-sm shadow-sm">
              Preorder
            </span>
          )}
          {isLowStock && !requiresPreorder && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold text-white bg-amber-500/90 backdrop-blur-sm shadow-sm">
              Low Stock
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
          <SaveButton
            itemType="product"
            itemId={id}
            initialIsSaved={initialIsSaved}
            minimal
            className="bg-white/80 hover:bg-white text-neutral-600 hover:text-primary-600 border-none shadow-sm backdrop-blur-sm h-8 w-8"
          />
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
            <span className="px-4 py-2 bg-neutral-900 text-white text-sm font-bold rounded-lg shadow-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Card Content - p-6 Uniform */}
      <div className="p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
        {vendorName && vendorSlug ? (
          <p className="text-xs font-medium text-neutral-500 mb-1.5 truncate">
            From {vendorName}
          </p>
        ) : null}
        <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors relative z-10 pointer-events-none">
          {name}
        </h3>

        {/* Price - Prominent */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-black text-neutral-900 tracking-tight">
              {formatCurrency(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm font-bold text-neutral-400 line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            )}
          </div>

          {/* Quick Add / View Details - Fixed Height Container to prevent layout shift */}
          <div className="relative h-12 mt-4 pointer-events-auto">
            {/* View Details Default */}
            <div className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-300">
              <div className="w-full h-full bg-neutral-50 text-neutral-500 font-bold rounded-xl border border-neutral-100 flex items-center justify-center gap-2 text-xs uppercase tracking-wide">
                View Details <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
            </div>

            {/* Quick Add Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleQuickAdd}
                className="w-full h-full bg-neutral-900 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                Order from {vendorName || 'Member'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </article>
  )
}

export default memo(ProductCard)

