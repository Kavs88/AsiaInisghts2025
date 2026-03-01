import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUpcomingMarketDays } from '@/lib/supabase/queries'
import { getVendorAllProducts } from '@/lib/actions/vendor-products'
import EmptyState from '@/components/ui/EmptyState'
import { PackageOpen, ShoppingCart } from 'lucide-react'
import HapticLink from '@/components/ui/HapticLink'
import { getBusinessesForCurrentUser } from '@/lib/actions/vendor-businesses'
import BusinessList from '@/components/vendor/BusinessList'

export const metadata = {
  title: 'Business Hub',
  description: 'Manage your products and orders',
}

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  if (!supabase) {
    redirect('/markets/vendor/apply')
  }

  // getUser() verifies JWT server-side — not a stale cookie read
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login?redirect=/markets/vendor/dashboard')
  }

  // Check user authority - allow vendors and admins
  const { getUserAuthorityServer } = await import('@/lib/auth/authority')
  const authority = await getUserAuthorityServer()

  // Allow access if user is vendor or admin
  if (authority.effectiveRole !== 'vendor' && !authority.isAdmin) {
    redirect('/markets/vendor/apply')
  }

  // Get vendor record (for vendors) or allow admins without vendor records
  let vendorData: any = null

  if (authority.hasVendorRecord) {
    // User has vendor record - use it
    const { data } = await (supabase
      .from('vendors') as any)
      .select('*')
      .eq('user_id', user.id)
      .single()
    vendorData = data
  } else if (authority.isAdmin) {
    // Admin without vendor record - allow access but show empty state
    // Admins can access vendor dashboard to manage any vendor
    // For now, create a minimal vendor data object for admins
    vendorData = {
      id: 'admin',
      name: 'Admin Dashboard',
      slug: 'admin',
      is_active: true,
    }
  }

  // Only redirect non-admins without vendor records
  if (!vendorData && !authority.isAdmin) {
    redirect('/markets/vendor/apply')
  }

  // For admins without vendor records, show empty state
  const isAdminWithoutVendor = authority.isAdmin && !authority.hasVendorRecord

  // Fetch real data only if we have a valid vendor
  let productList: any[] = []
  let recentOrders: any[] = []
  let stats = {
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalSales: 0,
  }

  if (!isAdminWithoutVendor && vendorData) {
    const vendorId = vendorData.id

    // Fetch real data — use getVendorAllProducts so inactive products are counted
    const [products, orders] = await Promise.all([
      getVendorAllProducts(vendorId),
      supabase
        .from('order_intents')
        .select('*, products(*)')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    productList = products || []
    recentOrders = (orders.data || []).map((order: any) => ({
      id: order.id,
      orderNumber: `ORDER-${order.id.slice(0, 8).toUpperCase()}`,
      customerName: order.customer_name,
      total: (order.quantity * (order.products?.price || 0)).toFixed(2),
      status: order.status,
      createdAt: order.created_at,
    }))

    stats = {
      totalProducts: productList.length,
      activeProducts: productList.filter((p: any) => p.is_available).length,
      pendingOrders: (orders.data || []).filter((o: any) => o.status === 'pending').length,
      totalSales: (orders.data || [])
        .filter((o: any) => o.status === 'confirmed' || o.status === 'fulfilled')
        .reduce((acc: number, o: any) => acc + (o.quantity * (o.products?.price || 0)), 0),
    }
  }

  // Fetch businesses scoped to user's agencies (runs for all roles)
  const [businesses, upcomingMarketDays] = await Promise.all([
    getBusinessesForCurrentUser(),
    getUpcomingMarketDays(1).catch(() => []),
  ])
  const nextMarketDay = upcomingMarketDays?.[0] ?? null

  // Show admin message if admin without vendor record
  if (isAdminWithoutVendor) {
    return (
      <main id="main-content" className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="mb-8">
            {/* LANGUAGE GUARDRAIL: "Business Hub" not "Dashboard" */}
            <h1 className="text-3xl font-black text-neutral-900 mb-2">Your Business Hub</h1>
            <p className="text-neutral-600">
              Admin access - <span className="font-semibold text-primary-600">Manage Vendors</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-neutral-100 text-center">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-xl font-black text-neutral-900 mb-2">No Vendor Profile</h2>
              <p className="text-neutral-600 mb-6">
                You don't have a vendor profile. As an admin, you can manage all vendors from the admin panel.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/markets/admin"
                  className="px-6 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-colors"
                >
                  Go to Admin Panel
                </Link>
                <Link
                  href="/markets/vendor/apply"
                  className="px-6 py-3 bg-white border border-neutral-200/60 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-50 transition-colors"
                >
                  Create Vendor Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Businesses */}
          <div className="mt-8">
            <BusinessList businesses={businesses} authority={authority} />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      <div className="container-custom py-10">
        {/* Dashboard Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-2">Your Business Hub</h1>
            <p className="text-neutral-600">
              Welcome back, <span className="font-semibold text-primary-600">{vendorData.name}</span>
            </p>
          </div>
        </div>

        {/* Needs Attention Queue - Priority Engine */}
        {(() => {
          const attentionItems = []

          // P1: Revenue-blocking actions
          if (stats.pendingOrders > 0) {
            attentionItems.push({
              id: 'orders',
              priority: 'P1',
              title: `You have ${stats.pendingOrders} pending order${stats.pendingOrders > 1 ? 's' : ''}`,
              description: 'Process within 24h to maintain elite status',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
              ctaText: 'Review Orders',
              ctaLink: '/markets/vendor/dashboard/orders',
            })
          }

          // P2: Business-blocking actions
          if (stats.totalProducts === 0) {
            attentionItems.push({
              id: 'products',
              priority: 'P2',
              title: 'Your shop is empty',
              description: 'Action required to go live and start selling',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
              ctaText: 'Add Product',
              ctaLink: '/markets/vendor/dashboard/products/new',
            })
          }

          if (attentionItems.length === 0) return null

          return (
            <div className="mb-8 bg-amber-50 rounded-2xl p-6 sm:p-8 border border-amber-200/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <h2 className="text-lg font-black text-amber-900 mb-5 flex items-center gap-2 relative z-10">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Needs Attention
              </h2>

              {/* Mobile Horizontal Snap Carousel / Desktop Stack */}
              <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory hide-scrollbar gap-4 relative z-10 w-[calc(100%+3rem)] md:w-auto">
                {attentionItems.map((item) => (
                  <div key={item.id} className="flex-none w-[85%] md:w-auto snap-center flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-amber-100 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-100 flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-black text-neutral-900 text-base sm:text-lg leading-tight mb-0.5">{item.title}</div>
                        <div className="text-sm font-medium text-neutral-500">{item.description}</div>
                      </div>
                    </div>
                    <HapticLink href={item.ctaLink} className="flex-shrink-0 w-full sm:w-auto text-center px-6 py-3 bg-amber-600 text-white text-sm font-bold rounded-2xl hover:bg-amber-700 transition-all shadow-sm shadow-amber-600/20 active:scale-95">
                      {item.ctaText}
                    </HapticLink>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200/60">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <div className="text-sm font-semibold text-neutral-500 mb-1">Total Products</div>
            <div className="text-3xl font-black text-neutral-900">{stats.totalProducts}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200/60">
            <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="text-sm font-semibold text-neutral-500 mb-1">Active Products</div>
            <div className="text-3xl font-black text-success-600">{stats.activeProducts}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200/60">
            {/* VENDOR VOICE: Ownership, service, and purpose — never urgency or control */}
            <div className="w-10 h-10 bg-secondary-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <div className="text-sm font-semibold text-neutral-500 mb-1">Orders to Fulfill</div>
            <div className="text-3xl font-black text-secondary-600">{stats.pendingOrders}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200/60">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="text-sm font-semibold text-neutral-500 mb-1">Total Sales</div>
            <div className="text-3xl font-black text-primary-600">
              ${stats.totalSales.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-neutral-900">Recent Orders</h2>
                <a href="/markets/vendor/dashboard/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All →
                </a>
              </div>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-neutral-900 mb-1">{order.orderNumber}</div>
                        <div className="text-sm text-neutral-600">{order.customerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neutral-900 mb-1">${order.total}</div>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${order.status === 'pending'
                            ? 'bg-primary-50 text-primary-700'
                            : 'bg-success-50 text-success-700'
                            }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={<ShoppingCart className="w-8 h-8 text-neutral-400" />}
                    title="No recent orders"
                    description="Your storefront is live. Orders will securely appear here as soon as they are placed."
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6 border border-neutral-100">
              <h2 className="text-xl font-black text-neutral-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <a
                  href="/markets/vendor/profile/edit"
                  className="w-full px-4 py-3 bg-white border border-neutral-200/60 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-50 transition-all text-center shadow-sm"
                >
                  Edit Profile & Images
                </a>
                <a
                  href="/markets/vendor/dashboard/products/new"
                  className="w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all text-center shadow-md shadow-primary-100"
                >
                  Add New Product
                </a>
                <a
                  href="/markets/vendor/dashboard/products"
                  className="w-full px-4 py-3 bg-white border border-neutral-200/60 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-50 transition-all text-center shadow-sm"
                >
                  Manage Products
                </a>
                <a
                  href="/markets/vendor/dashboard/orders"
                  className="w-full px-4 py-3 bg-white border border-neutral-200/60 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-50 transition-all text-center shadow-sm"
                >
                  View All Orders
                </a>
              </div>
            </div>

            {/* Next Market Day — live */}
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100">
              <h2 className="text-xl font-black text-neutral-900 mb-4">Next Market Day</h2>
              {nextMarketDay ? (() => {
                const d = new Date(nextMarketDay.market_date + 'T00:00:00')
                const dayName  = d.toLocaleDateString('en-US', { weekday: 'long' })
                const dateStr  = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                      <div className="w-14 h-14 bg-primary-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-md shadow-primary-200">
                        <span className="text-xs font-bold text-primary-100 uppercase leading-none">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black text-white leading-tight">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-neutral-900">{dayName}</div>
                        <div className="text-sm text-neutral-600">{dateStr}</div>
                        {nextMarketDay.location_name && (
                          <div className="text-xs text-primary-600 font-semibold mt-0.5 truncate">{nextMarketDay.location_name}</div>
                        )}
                      </div>
                    </div>
                    <a
                      href="/markets/market-days"
                      className="block w-full text-center px-4 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    >
                      View Full Schedule →
                    </a>
                  </div>
                )
              })() : (
                <div className="space-y-3">
                  <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm text-neutral-500 text-center">
                    No upcoming market days scheduled.
                  </div>
                  <a
                    href="/markets/market-days"
                    className="block w-full text-center px-4 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                  >
                    View Schedule →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Businesses */}
        <div className="mt-8">
          <BusinessList businesses={businesses} authority={authority} />
        </div>

        {/* Products List */}
        <div className="mt-8 bg-white rounded-2xl shadow-soft p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-neutral-900">Portfolio & Inventory</h2>
            <a href="/markets/vendor/dashboard/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Manage All →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Stock</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {productList.length > 0 ? (
                  productList.map((product: any) => (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-neutral-900">{product.name}</div>
                      </td>
                      <td className="py-4 px-4 text-neutral-600 font-medium">{product.price != null ? `$${Number(product.price).toFixed(2)}` : '—'}</td>
                      <td className="py-4 px-4 text-neutral-600 font-medium">{product.stock_quantity ?? '—'}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${product.is_available
                          ? 'bg-success-50 text-success-700'
                          : 'bg-neutral-100 text-neutral-700'
                          }`}>
                          {product.is_available ? 'Active' : 'Private'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <a
                          href={`/markets/vendor/dashboard/products/${product.id}/edit`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-bold"
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8">
                      <EmptyState
                        icon={<PackageOpen className="w-8 h-8 text-neutral-400" />}
                        title="Your shop is empty"
                        description="Add products or services to start selling."
                        action={{
                          label: "Add Product",
                          href: "/markets/vendor/dashboard/products/new"
                        }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

