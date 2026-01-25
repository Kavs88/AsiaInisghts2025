import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getVendorProducts, getCustomerOrderIntents } from '@/lib/supabase/queries'

export const metadata = {
  title: 'Vendor Dashboard - AI Markets',
  description: 'Manage your products and orders',
}

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  if (!supabase) {
    redirect('/markets/vendor/apply')
  }

  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
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
      .eq('user_id', session.user.id)
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

    // Fetch real data
    const [products, orders] = await Promise.all([
      getVendorProducts(vendorId),
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

  // Show admin message if admin without vendor record
  if (isAdminWithoutVendor) {
    return (
      <main id="main-content" className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Vendor Dashboard</h1>
            <p className="text-neutral-600">
              Admin access - <span className="font-semibold text-primary-600">Manage Vendors</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-neutral-100 text-center">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">No Vendor Profile</h2>
              <p className="text-neutral-600 mb-6">
                You don't have a vendor profile. As an admin, you can manage all vendors from the admin panel.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/markets/admin"
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Go to Admin Panel
                </a>
                <a
                  href="/markets/vendor/apply"
                  className="px-6 py-3 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Create Vendor Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        {/* Dashboard Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Vendor Dashboard</h1>
            <p className="text-neutral-600">
              Welcome back, <span className="font-semibold text-primary-600">{vendorData.name}</span>
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
            <div className="text-sm text-neutral-600 mb-1">Total Products</div>
            <div className="text-3xl font-bold text-neutral-900">{stats.totalProducts}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
            <div className="text-sm text-neutral-600 mb-1">Active Products</div>
            <div className="text-3xl font-bold text-success-600">{stats.activeProducts}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
            <div className="text-sm text-neutral-600 mb-1">Pending Orders</div>
            <div className="text-3xl font-bold text-warning-600">{stats.pendingOrders}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
            <div className="text-sm text-neutral-600 mb-1">Total Sales</div>
            <div className="text-3xl font-bold text-primary-600">
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
                <h2 className="text-xl font-bold text-neutral-900">Recent Orders</h2>
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
                            ? 'bg-warning-50 text-warning-700'
                            : 'bg-success-50 text-success-700'
                            }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    <p className="text-neutral-500">No recent orders found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6 border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <a
                  href="/markets/vendor/profile/edit"
                  className="w-full px-4 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-all text-center shadow-sm"
                >
                  Edit Profile & Images
                </a>
                <a
                  href="/markets/vendor/dashboard/products/new"
                  className="w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all text-center shadow-md shadow-primary-100"
                >
                  Add New Product
                </a>
                <a
                  href="/markets/vendor/dashboard/products"
                  className="w-full px-4 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-all text-center shadow-sm"
                >
                  Manage Products
                </a>
                <a
                  href="/markets/vendor/dashboard/orders"
                  className="w-full px-4 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-all text-center shadow-sm"
                >
                  View All Orders
                </a>
              </div>
            </div>

            {/* My Market Schedule */}
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">My Market Schedule</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-primary-50/50 border border-primary-100 rounded-xl">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-neutral-900">Next Market Day</div>
                    <div className="text-sm text-neutral-600 font-medium">Check market schedule for details</div>
                  </div>
                </div>
                <a
                  href="/markets/market-days"
                  className="block w-full text-center px-4 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                >
                  View All Market Days →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="mt-8 bg-white rounded-2xl shadow-soft p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Portfolio & Inventory</h2>
            <a href="/markets/vendor/dashboard/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Manage All →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-4 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Product</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {productList.length > 0 ? (
                  productList.map((product: any) => (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-neutral-900">{product.name}</div>
                      </td>
                      <td className="py-4 px-4 text-neutral-600 font-medium">${product.price}</td>
                      <td className="py-4 px-4 text-neutral-600 font-medium">{product.stock_quantity}</td>
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
                          href={`/markets/admin/products/${product.id}/edit`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-bold"
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 italic">
                      No products found. Start by adding your first product!
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

