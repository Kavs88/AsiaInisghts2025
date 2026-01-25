'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminBusinessesPageClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBusinesses = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error: businessesError } = await supabase
          .from('businesses')
          .select('*, users:owner_id(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(100)

        if (businessesError) {
          setError(businessesError.message)
        } else {
          setBusinesses(data || [])
        }
      } catch (err: any) {
        console.error('[AdminBusinesses] Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBusinesses()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading businesses...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="bg-error-50 border border-error-200 rounded-xl p-6">
            <p className="text-error-700 font-medium">Error: {error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Business Directory</h1>
            <p className="text-neutral-600">Manage all businesses</p>
          </div>
          <Link
            href="/markets/admin/businesses/create"
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            + Add Business
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <p className="text-neutral-600">No businesses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div key={business.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">{business.name}</h3>
                      <p className="text-sm text-neutral-600">{business.category}</p>
                    </div>
                    {business.is_verified && (
                      <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs font-semibold">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-neutral-600">📍 {business.address}</p>
                    <p className="text-sm text-neutral-600">📞 {business.contact_phone}</p>
                    {business.contact_email && (
                      <p className="text-sm text-neutral-600">✉️ {business.contact_email}</p>
                    )}
                  </div>

                  {business.users && (
                    <p className="text-sm text-neutral-600 mb-4">
                      Owner: {business.users.full_name || business.users.email}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/markets/admin/businesses/${business.id}/edit`}
                      className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-center text-sm font-semibold"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}




