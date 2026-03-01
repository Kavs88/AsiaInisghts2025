'use client'

import Link from 'next/link'
import type { UserAuthority } from '@/lib/auth/authority'
import type { DashboardStats } from './page'

interface AdminDashboardClientProps {
  stats: DashboardStats
  authority: UserAuthority
}

function isAgencyManager(authority: UserAuthority): boolean {
  return authority.agencies.some((a) => a.role === 'owner' || a.role === 'manager')
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-neutral-600">{label}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-neutral-900">{value.toLocaleString()}</p>
    </div>
  )
}

interface ActionCardProps {
  href: string
  iconBg: string
  icon: React.ReactNode
  iconColor: string
  title: string
  description: string
  linkLabel: string
  linkColor: string
}

function ActionCard({ href, iconBg, icon, title, description, linkLabel, linkColor }: ActionCardProps) {
  return (
    <Link href={href} className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all group block">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center transition-colors`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-lg font-bold text-neutral-900 group-hover:${linkColor} transition-colors`}>{title}</h3>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
      <div className={`flex items-center ${linkColor} text-sm font-medium`}>
        {linkLabel}
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

export default function AdminDashboardClient({ stats, authority }: AdminDashboardClientProps) {
  const isPlatformAdmin = authority.isAdmin
  const hasAgencyAdmin = isAgencyManager(authority)

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-neutral-900 mb-2">Platform Overview</h1>
          <p className="text-neutral-600">
            {isPlatformAdmin ? 'Your community at a glance' : 'Your agency at a glance'}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Vendors — platform admin + agency admin */}
          {(isPlatformAdmin || hasAgencyAdmin) && (
            <StatCard
              label={isPlatformAdmin ? 'Total Vendors' : 'Agency Vendors'}
              value={stats.vendors}
              icon={
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
          )}

          {/* Businesses — platform admin + agency admin */}
          {(isPlatformAdmin || hasAgencyAdmin) && (
            <StatCard
              label={isPlatformAdmin ? 'Total Businesses' : 'Agency Businesses'}
              value={stats.businesses}
              icon={
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
          )}

          {/* Orders — platform admin only */}
          {isPlatformAdmin && (
            <StatCard
              label="Total Orders"
              value={stats.orders}
              icon={
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
          )}

          {/* Users — platform admin only */}
          {isPlatformAdmin && (
            <StatCard
              label="Total Users"
              value={stats.users}
              icon={
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Column 1: Vendor management — platform admin + agency admin */}
          {(isPlatformAdmin || hasAgencyAdmin) && (
            <div className="space-y-3">
              <ActionCard
                href="/markets/admin/vendors"
                iconBg="bg-primary-100 group-hover:bg-primary-200"
                icon={
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                iconColor="text-primary-600"
                title="Vendor Stewardship"
                description="Welcome and support vendor relationships"
                linkLabel="Go to Vendors"
                linkColor="text-primary-600"
              />

              {isPlatformAdmin && (
                <ActionCard
                  href="/markets/admin/vendors/create"
                  iconBg="bg-primary-50 group-hover:bg-primary-100"
                  icon={
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                  iconColor="text-primary-600"
                  title="Create New Vendor"
                  description="Set up a new vendor account"
                  linkLabel="Create Vendor"
                  linkColor="text-primary-600"
                />
              )}

              <ActionCard
                href="/markets/admin/vendor-change-requests"
                iconBg="bg-warning-100 group-hover:bg-warning-200"
                icon={
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                iconColor="text-warning-600"
                title="Change Requests"
                description="Review vendor profile change requests"
                linkLabel="Review Requests"
                linkColor="text-warning-600"
              />
            </div>
          )}

          {/* Column 2: Products + Orders */}
          <div className="space-y-3">
            {/* Products — platform admin only */}
            {isPlatformAdmin && (
              <ActionCard
                href="/markets/admin/products"
                iconBg="bg-primary-100 group-hover:bg-primary-200"
                icon={
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
                iconColor="text-primary-600"
                title="Product Curation"
                description="Review and celebrate artisan offerings"
                linkLabel="Go to Products"
                linkColor="text-primary-600"
              />
            )}

            {/* Orders — platform admin + agency admin */}
            {(isPlatformAdmin || hasAgencyAdmin) && (
              <ActionCard
                href="/markets/admin/orders"
                iconBg="bg-primary-100 group-hover:bg-primary-200"
                icon={
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
                iconColor="text-primary-600"
                title="Order Fulfillment"
                description="Support order processing and delivery"
                linkLabel="Go to Orders"
                linkColor="text-primary-600"
              />
            )}
          </div>

          {/* Column 3: Properties + Events + Businesses — platform admin + agency admin */}
          {(isPlatformAdmin || hasAgencyAdmin) && (
            <div className="space-y-3">
              <ActionCard
                href="/markets/admin/properties"
                iconBg="bg-secondary-100 group-hover:bg-secondary-200"
                icon={
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                iconColor="text-secondary-600"
                title="Property Directory"
                description="Curate venue and property listings"
                linkLabel="Go to Properties"
                linkColor="text-secondary-600"
              />

              {/* Events — platform admin only */}
              {isPlatformAdmin && (
                <ActionCard
                  href="/markets/admin/events"
                  iconBg="bg-accent-100 group-hover:bg-accent-200"
                  icon={
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  iconColor="text-accent-600"
                  title="Community Calendar"
                  description="Shape gatherings and welcome new events"
                  linkLabel="Go to Events"
                  linkColor="text-accent-600"
                />
              )}

              <ActionCard
                href="/markets/admin/businesses"
                iconBg="bg-success-100 group-hover:bg-success-200"
                icon={
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                iconColor="text-success-600"
                title="Business Directory"
                description="Curate and celebrate local businesses"
                linkLabel="Go to Businesses"
                linkColor="text-success-600"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
