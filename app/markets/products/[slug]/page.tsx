import ProductCard from '@/components/ui/ProductCard'
import OrderIntentButton from '@/components/ui/OrderIntentButton'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { getProductBySlug, getVendorProducts, getVendorNextMarketAttendance } from '@/lib/actions/products'
import { getUpcomingMarketDays } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 1800

interface ProductPageProps {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  try {
    const product = await getProductBySlug(resolvedParams.slug) as any
    const vendor = (product?.vendors) || {}

    const description = product.description
      ? product.description.substring(0, 160).trim() + (product.description.length > 160 ? '...' : '')
      : `Discover ${product.name} from ${vendor.name || 'our vendors'} on Asia Insights`
    const image = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null

    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        type: 'website',
        siteName: 'Asia Insights',
        ...(image && { images: [{ url: image, width: 1200, height: 630, alt: product.name }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        ...(image && { images: [image] }),
      },
    }
  } catch {
    return {
      title: resolvedParams.slug,
      description: `View product details on Asia Insights`,
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Handle both Promise and direct object params (Next.js 14.2+ compatibility)
  const resolvedParams = params instanceof Promise ? await params : params
  
  // Fetch real data from Supabase
  let product: any = null
  let relatedProducts: any[] = []
  let marketAttendance: any = null
  let nextMarketDay: any = null

  try {
    product = await getProductBySlug(resolvedParams.slug) as any
    if (!product) {
      notFound()
    }

    const vendor = product.vendors || {}

    // Fetch related products, market attendance, and next market day in parallel
    const [vendorProducts, attendance, marketDays] = await Promise.all([
      vendor.id ? getVendorProducts(vendor.id) : Promise.resolve([]),
      vendor.id ? getVendorNextMarketAttendance(vendor.id).catch(() => null) : Promise.resolve(null),
      getUpcomingMarketDays(1).catch(() => []),
    ])

    relatedProducts = (vendorProducts || [])
      .filter((p: any) => p.id !== product.id && p.is_available)
      .slice(0, 4) // Limit to 4 related products

    marketAttendance = attendance
    nextMarketDay = marketDays && marketDays.length > 0 ? marketDays[0] : null
  } catch (error) {
    console.error('Error fetching product data:', error)
    notFound()
  }

  const vendor = product.vendors || {}

  // Map product data
  const mappedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || 'No description available.',
    price: parseFloat(product.price),
    compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : undefined,
    imageUrls: product.image_urls && Array.isArray(product.image_urls) ? product.image_urls.filter(Boolean) : [],
    vendorName: vendor.name,
    vendorSlug: vendor.slug,
    vendorLogo: vendor.logo_url,
    vendorTagline: vendor.short_tagline || vendor.tagline,
    stockQuantity: product.stock_quantity || 0,
    isAvailable: product.is_available,
    requiresPreorder: product.requires_preorder,
    preorderLeadDays: product.preorder_lead_days || 0,
    category: product.category,
    tags: product.tags && Array.isArray(product.tags) ? product.tags : [],
    deliveryAvailable: vendor.delivery_available,
    pickupAvailable: vendor.pickup_available !== false, // Default to true
  }

  // Map related products
  const mappedRelatedProducts = relatedProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: parseFloat(p.price),
    compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : undefined,
    imageUrl: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : undefined,
    vendorName: mappedProduct.vendorName,
    vendorSlug: mappedProduct.vendorSlug,
    stockQuantity: p.stock_quantity || 0,
    isAvailable: p.is_available,
    requiresPreorder: p.requires_preorder,
    preorderLeadDays: p.preorder_lead_days,
    category: p.category,
  }))

  const discountPercentage = mappedProduct.compareAtPrice && mappedProduct.compareAtPrice > mappedProduct.price
    ? Math.round(((mappedProduct.compareAtPrice - mappedProduct.price) / mappedProduct.compareAtPrice) * 100)
    : null

  // Get primary image or placeholder
  const primaryImage = mappedProduct.imageUrls.length > 0 ? mappedProduct.imageUrls[0] : null
  const thumbnailImages = mappedProduct.imageUrls.slice(1, 5) // Up to 4 thumbnails

  return (
    <main id="main-content" className="min-h-screen bg-white overflow-x-hidden">
      <div className="container-custom py-6 lg:py-8 xl:py-12 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 max-w-full">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-neutral-200 rounded-2xl overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={mappedProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <svg
                    className="w-24 h-24"
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
            </div>

            {/* Thumbnail Gallery */}
            {thumbnailImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {thumbnailImages.map((url: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-neutral-200 rounded-2xl overflow-hidden"
                  >
                    <Image
                      src={url}
                      alt={`${mappedProduct.name} - View ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Vendor Link */}
            {mappedProduct.vendorSlug && (
              <Link
                href={`/sellers/${mappedProduct.vendorSlug}`}
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-4 transition-colors"
              >
                <span>{mappedProduct.vendorName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {mappedProduct.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-neutral-900">
                {mappedProduct.price ? formatCurrency(mappedProduct.price) : 'Contact vendor'}
              </span>
              {mappedProduct.compareAtPrice && mappedProduct.compareAtPrice > mappedProduct.price && (
                <>
                  <span className="text-xl text-neutral-500 line-through">
                    {formatCurrency(mappedProduct.compareAtPrice)}
                  </span>
                  {discountPercentage && (
                    <span className="px-2.5 py-1 text-sm font-bold text-white bg-error-600 rounded-full">
                      -{discountPercentage}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {mappedProduct.requiresPreorder ? (
                <div className="flex items-center gap-2 text-primary-600">
                  <span className="font-medium">Preorder Available</span>
                  {mappedProduct.preorderLeadDays > 0 && (
                    <span className="text-sm">
                      ({mappedProduct.preorderLeadDays} day{mappedProduct.preorderLeadDays !== 1 ? 's' : ''} lead time)
                    </span>
                  )}
                </div>
              ) : mappedProduct.stockQuantity > 0 && mappedProduct.stockQuantity < 10 ? (
                <div className="text-warning-600 font-medium">
                  Only {mappedProduct.stockQuantity} left in stock
                </div>
              ) : mappedProduct.stockQuantity > 0 ? (
                <div className="text-success-600 font-medium">In Stock</div>
              ) : (
                <div className="text-error-600 font-medium">Out of Stock</div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {mappedProduct.description}
              </p>
            </div>

            {/* Delivery Options */}
            <div className="mb-8 p-4 bg-neutral-50 rounded-xl">
              <h3 className="font-semibold text-neutral-900 mb-3">Delivery Options</h3>
              <div className="space-y-2">
                {mappedProduct.pickupAvailable && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                    <svg className="w-5 h-5 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">Market Pickup</div>
                      <div className="text-sm text-neutral-600">
                        {nextMarketDay && marketAttendance?.attendanceStatus === 'attending' ? (
                          <>
                            Pick up at the next market: {new Date(nextMarketDay.market_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            {marketAttendance.stall?.stall_number && ` (Stall ${marketAttendance.stall.stall_number})`}
                          </>
                        ) : (
                          'Pick up at the next market day'
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {mappedProduct.deliveryAvailable && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                    <svg className="w-5 h-5 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">Home Delivery</div>
                      <div className="text-sm text-neutral-600">
                        {marketAttendance?.attendanceStatus === 'delivery-only'
                          ? 'Delivery only - vendor not attending market physically'
                          : 'Delivery available in select areas'}
                      </div>
                    </div>
                  </div>
                )}
                {!mappedProduct.pickupAvailable && !mappedProduct.deliveryAvailable && (
                  <div className="text-sm text-neutral-500">
                    Contact vendor for delivery options
                  </div>
                )}
              </div>
            </div>

            {/* Order Intent CTA */}
            {nextMarketDay && vendor.id && (
              <div className="mb-8 space-y-3">
                {mappedProduct.pickupAvailable && marketAttendance?.attendanceStatus === 'attending' && (
                  <OrderIntentButton
                    productId={mappedProduct.id}
                    vendorId={vendor.id}
                    marketDayId={nextMarketDay.id}
                    intentType="pickup"
                    productName={mappedProduct.name}
                    isAvailable={mappedProduct.isAvailable}
                    stockQuantity={mappedProduct.stockQuantity}
                    requiresPreorder={mappedProduct.requiresPreorder}
                  />
                )}
                {mappedProduct.deliveryAvailable && (
                  <OrderIntentButton
                    productId={mappedProduct.id}
                    vendorId={vendor.id}
                    marketDayId={nextMarketDay.id}
                    intentType="delivery"
                    productName={mappedProduct.name}
                    isAvailable={mappedProduct.isAvailable}
                    stockQuantity={mappedProduct.stockQuantity}
                    requiresPreorder={mappedProduct.requiresPreorder}
                  />
                )}
              </div>
            )}

            {/* Vendor Summary Box */}
            {mappedProduct.vendorSlug && (
              <div className="mb-8 p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                <div className="flex items-start gap-4">
                  {mappedProduct.vendorLogo && (
                    <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-xl overflow-hidden">
                      <Image
                        src={mappedProduct.vendorLogo}
                        alt={mappedProduct.vendorName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/sellers/${mappedProduct.vendorSlug}`}
                      className="text-lg font-bold text-neutral-900 hover:text-primary-600 transition-colors"
                    >
                      {mappedProduct.vendorName}
                    </Link>
                    {mappedProduct.vendorTagline && (
                      <p className="text-sm text-neutral-600 mt-1">
                        {mappedProduct.vendorTagline}
                      </p>
                    )}
                    <Link
                      href={`/sellers/${mappedProduct.vendorSlug}`}
                      className="inline-flex items-center gap-2 mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View vendor profile
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {mappedProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mappedProduct.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {mappedRelatedProducts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              More from {mappedProduct.vendorName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mappedRelatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} {...relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
