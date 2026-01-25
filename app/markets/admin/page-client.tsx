'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'
import { hasAdminAccess } from '@/lib/auth/authority-client'
import Link from 'next/link'

export default function AdminDashboardClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [stats, setStats] = useState({
    vendors: 0,
    products: 0,
    orders: 0,
    users: 0,
  })
  const [statsError, setStatsError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Fetch stats with proper error handling
      // Using select('*') instead of count to work around RLS issues
      const statsPromises = [
        supabase.from('vendors').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]

      const results = await Promise.allSettled(statsPromises)

      const statsData = {
        vendors: 0,
        products: 0,
        orders: 0,
        users: 0,
      }

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const response = result.value
          // Check for both error and count
          if (response.error) {
            console.warn(`[AdminDashboard] Error fetching stats ${index}:`, response.error.message)
            // If RLS error, try alternative method
            if (response.error.message.includes('row-level security') || response.error.code === 'PGRST301') {
              console.warn(`[AdminDashboard] RLS blocking count query ${index}, will show 0`)
            }
          } else if (response.count !== null && response.count !== undefined) {
            const count = response.count || 0
            if (index === 0) statsData.vendors = count
            else if (index === 1) statsData.products = count
            else if (index === 2) statsData.orders = count
            else if (index === 3) statsData.users = count
          }
        } else {
          console.warn(`[AdminDashboard] Stats promise ${index} rejected:`, result.reason)
        }
      })

      setStats(statsData)
      setStatsError(null)
    } catch (error: any) {
      console.error('[AdminDashboard] Error fetching stats:', error)
      setStatsError('Failed to load statistics. Make sure admin RLS policies are set up.')
    }
  }, [])

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const adminStatus = await hasAdminAccess()
        setIsAdminUser(adminStatus)
        setIsChecking(false)

        if (!adminStatus) {
          return
        }

        // Fetch stats after admin check passes
        await fetchStats()
      } catch (error: any) {
        console.error('[AdminDashboard] Error:', error)
        setIsAdminUser(false)
        setIsChecking(false)
      }
    }

    checkAdmin()
  }, [user, authLoading, router, fetchStats])

  if (authLoading || isChecking) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Checking admin access...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  if (!isAdminUser) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-error-900 mb-2">Access Denied</h2>
            <p className="text-error-800 mb-4">You do not have admin privileges.</p>
            <div className="space-y-2 text-sm text-error-700">
              <p>Please check:</p>
              <ul className="list-disc list-inside ml-4">
                <li>You are signed in</li>
                <li>Your account has admin role in the database</li>
                <li>You have refreshed your session (sign out and sign back in)</li>
              </ul>
              <p className="mt-4">
                <Link href="/markets/admin/debug" className="underline mr-4">Visit debug page</Link>
                <Link href="/" className="underline">Go to homepage</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Platform Overview</h1>
          <p className="text-neutral-600">Your community at a glance</p>
        </div>

        {/* Statistics Cards */}
        {statsError && (
          <div className="mb-6 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            {/* STEWARDSHIP GUARDRAIL: Never expose technical implementation details to users */}
            <p className="text-sm text-neutral-600 mb-2">We’re unable to load community stats right now. Your space is safe — please refresh to try again.</p>
            <p className="text-xs text-neutral-400">
              If this persists, our support team is standing by to help.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-neutral-600">Total Vendors</h3>
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{stats.vendors.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-neutral-600">Total Products</h3>
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{stats.products.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-neutral-600">Total Orders</h3>
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{stats.orders.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-neutral-600">Total Users</h3>
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{stats.users.toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Link
              href="/markets/admin/vendors"
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                    Vendor Stewardship
                  </h3>
                  <p className="text-sm text-neutral-600">Welcome and support vendor relationships</p>
                </div>
              </div>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                Go to Vendors
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            <Link
              href="/markets/admin/vendors/create"
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                    Create New Vendor
                  </h3>
                  <p className="text-sm text-neutral-600">Set up a new vendor account</p>
                </div>
              </div>
            </Link>
            <Link
              href="/markets/admin/vendor-change-requests"
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center group-hover:bg-warning-200 transition-colors">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-warning-600 transition-colors">
                    Change Requests
                  </h3>
                  <p className="text-sm text-neutral-600">Review vendor profile change requests</p>
                </div>
              </div>
              <div className="flex items-center text-warning-600 text-sm font-medium">
                Review Requests
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="space-y-3">
            <Link
              href="/markets/admin/products"
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                    Product Curation
                  </h3>
                  <p className="text-sm text-neutral-600">Review and celebrate artisan offerings</p>
                </div>
              </div>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                Go to Products
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/markets/admin/orders"
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                    Order Fulfillment
                  </h3>
                  <p className="text-sm text-neutral-600">Support order processing and delivery</p>
                </div>
              </div>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                Go to Orders
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="space-y-3">
            <Link
              href="/markets/admin/properties"
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-secondary-600 transition-colors">
                    Property Directory
                  </h3>
                  <p className="text-sm text-neutral-600">Curate venue and property listings</p>
                </div>
              </div>
              <div className="flex items-center text-secondary-600 text-sm font-medium">
                Go to Properties
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/markets/admin/events"
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                  <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-accent-600 transition-colors">
                    Community Calendar
                  </h3>
                  <p className="text-sm text-neutral-600">Shape gatherings and welcome new events</p>
                </div>
              </div>
              <div className="flex items-center text-accent-600 text-sm font-medium">
                Go to Events
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/markets/admin/businesses"
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center group-hover:bg-success-200 transition-colors">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-success-600 transition-colors">
                    Business Directory
                  </h3>
                  <p className="text-sm text-neutral-600">Curate and celebrate local businesses</p>
                </div>
              </div>
              <div className="flex items-center text-success-600 text-sm font-medium">
                Go to Businesses
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
