'use client'

import Link from 'next/link'
import { Building2, Plus } from 'lucide-react'
import type { BusinessSummary } from '@/lib/actions/vendor-businesses'
import type { UserAuthority } from '@/lib/auth/authority'
import BusinessCard from '@/components/ui/BusinessCard'
import EmptyState from '@/components/ui/EmptyState'

interface BusinessListProps {
  businesses: BusinessSummary[]
  authority: Pick<UserAuthority, 'isAdmin' | 'agencies'>
}

function isAgencyManager(authority: Pick<UserAuthority, 'isAdmin' | 'agencies'>): boolean {
  if (authority.isAdmin) return true
  return authority.agencies.some((a) => a.role === 'owner' || a.role === 'manager')
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-neutral-100" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-neutral-100 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
        <div className="h-3 bg-neutral-100 rounded w-2/3" />
      </div>
    </div>
  )
}

export default function BusinessList({ businesses, authority }: BusinessListProps) {
  const canManage = isAgencyManager(authority)

  if (businesses.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="w-7 h-7" />}
        title="No businesses yet"
        description={
          canManage
            ? 'Add your first business listing to get started.'
            : 'No businesses are associated with your agency yet.'
        }
        action={
          canManage
            ? { label: 'Add business', href: '/markets/admin/businesses/create' }
            : undefined
        }
      />
    )
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-neutral-900">Businesses</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {businesses.length} listing{businesses.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canManage && (
          <Link
            href="/markets/admin/businesses/create"
            className="inline-flex items-center gap-2 h-10 px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add business
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {businesses.map((b) => (
          <div key={b.id} className="relative group/card">
            <BusinessCard
              business={{
                id: b.id,
                name: b.name,
                slug: b.slug,
                category: b.category ?? 'Business',
                logo_url: b.logo_url,
                is_verified: b.is_verified,
              }}
            />
            {/* Edit overlay for managers */}
            {canManage && (
              <div className="absolute top-4 left-4 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <Link
                  href={`/markets/admin/businesses/${b.id}/edit`}
                  className="inline-flex items-center h-7 px-3 bg-white/95 backdrop-blur-sm text-xs font-bold text-neutral-700 rounded-lg shadow-md hover:bg-primary-600 hover:text-white transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
              </div>
            )}
            {/* Inactive indicator */}
            {!b.is_active && (
              <div className="absolute top-3 right-3 z-30">
                <span className="inline-flex items-center h-5 px-2 bg-neutral-900/80 text-white text-[10px] font-bold rounded-md uppercase tracking-wide">
                  Inactive
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function BusinessListSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-5 w-28 bg-neutral-100 rounded animate-pulse" />
          <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    </div>
  )
}
