import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVendorAllProducts } from '@/lib/actions/vendor-products'
import EmptyState from '@/components/ui/EmptyState'
import { PackageOpen, Plus, Tag } from 'lucide-react'

export const metadata = {
    title: 'Products | Business Hub',
    description: 'Manage your products and inventory',
}

export default async function VendorProductsPage() {
    const supabase = await createClient()
    if (!supabase) redirect('/markets/vendor/apply')

    // getUser() verifies JWT server-side — not a stale cookie read
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/auth/login?redirect=/markets/vendor/dashboard/products')
    }

    // Check authority
    const { getUserAuthorityServer } = await import('@/lib/auth/authority')
    const authority = await getUserAuthorityServer()

    if (authority.effectiveRole !== 'vendor' && !authority.isAdmin) {
        redirect('/markets/vendor/apply')
    }

    // Get vendor data
    let vendorData: any = null

    if (authority.hasVendorRecord) {
        const { data } = await (supabase.from('vendors') as any)
            .select('id, name')
            .eq('user_id', user.id)
            .single()
        vendorData = data
    } else if (authority.isAdmin) {
        return (
            <div className="container-custom py-10">
                <EmptyState
                    title="Admin View Restricted"
                    description="Admins must impersonate a vendor to manage their specific products."
                    action={{ label: "Go to Admin Panel", href: "/markets/admin" }}
                />
            </div>
        )
    }

    if (!vendorData) redirect('/markets/vendor/apply')

    // Fetch ALL vendor products (including hidden — vendor needs full visibility)
    const products = await getVendorAllProducts(vendorData.id)

    return (
        <main className="container-custom py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-2">Portfolio & Inventory</h1>
                    <p className="text-neutral-600">
                        Manage your offerings for <span className="font-semibold text-primary-600">{vendorData.name}</span>
                    </p>
                </div>
                <Link
                    href="/markets/vendor/dashboard/products/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden">
                {products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Product Name</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Price</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Stock</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {products.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex-shrink-0 flex items-center justify-center border border-neutral-200 overflow-hidden">
                                                    {p.image_urls && p.image_urls.length > 0 ? (
                                                        <img src={p.image_urls[0]} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <PackageOpen className="w-6 h-6 text-neutral-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-neutral-900">{p.name}</div>
                                                    {p.category && (
                                                        <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                                            <Tag className="w-3 h-3" /> {p.category}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${p.is_available
                                                    ? 'bg-success-50 text-success-700'
                                                    : 'bg-neutral-100 text-neutral-600'
                                                }`}>
                                                {p.is_available ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-medium text-neutral-900">
                                            {p.price != null ? `$${Number(p.price).toFixed(2)}` : '—'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={p.stock_quantity > 0 ? "font-medium text-neutral-900" : "font-semibold text-error-600"}>
                                                {p.stock_quantity > 0 ? p.stock_quantity : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                href={`/markets/vendor/dashboard/products/${p.id}/edit`}
                                                className="inline-flex px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 px-6">
                        <EmptyState
                            icon={<PackageOpen className="w-12 h-12 text-neutral-300 mx-auto" />}
                            title="No products yet"
                            description="Add your first product to start building your portfolio."
                            action={{
                                label: "Add your first product",
                                href: "/markets/vendor/dashboard/products/new"
                            }}
                        />
                    </div>
                )}
            </div>
        </main>
    )
}
