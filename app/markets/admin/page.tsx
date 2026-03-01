import { redirect } from 'next/navigation'
import { getUserAuthorityServer } from '@/lib/auth/authority'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './page-client'

export type DashboardStats = {
  vendors: number
  businesses: number
  orders: number
  users: number
}

/**
 * Admin Dashboard — Server Component
 * Fetches all stats server-side before the client renders anything.
 * Platform admins see global counts; agency admins see agency-scoped counts.
 */
export default async function AdminDashboard() {
  const authority = await getUserAuthorityServer()

  const isAgencyAdmin = authority.agencies.some(
    (a) => a.role === 'owner' || a.role === 'manager'
  )

  // Require at minimum agency admin access
  if (!authority.isAdmin && !isAgencyAdmin) {
    redirect('/auth/login?error=unauthorized')
  }

  const supabase = await createClient()
  const agencyIds = authority.agencies.map((a) => a.id)

  let stats: DashboardStats = { vendors: 0, businesses: 0, orders: 0, users: 0 }

  if (authority.isAdmin) {
    // Platform admin: global counts across everything
    const [vendors, businesses, orders, users] = await Promise.all([
      supabase.from('vendors').select('id', { count: 'exact', head: true }),
      (supabase as any).from('entities').select('id', { count: 'exact', head: true }).eq('type', 'business'),
      supabase.from('order_intents').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
    ])
    stats = {
      vendors: vendors.count ?? 0,
      businesses: businesses.count ?? 0,
      orders: orders.count ?? 0,
      users: users.count ?? 0,
    }
  } else if (agencyIds.length > 0) {
    // Agency admin: counts scoped strictly to their agencies
    const [vendors, businesses] = await Promise.all([
      supabase.from('vendors').select('id', { count: 'exact', head: true }).in('agency_id', agencyIds),
      (supabase as any).from('entities').select('id', { count: 'exact', head: true }).eq('type', 'business').in('agency_id', agencyIds),
    ])
    stats = {
      vendors: vendors.count ?? 0,
      businesses: businesses.count ?? 0,
      orders: 0,
      users: 0,
    }
  }

  return <AdminDashboardClient stats={stats} authority={authority} />
}
