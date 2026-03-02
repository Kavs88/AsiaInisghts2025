'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Props {
  vendorUserId: string | null | undefined
}

export default function VendorOwnershipIsland({ vendorUserId }: Props) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (!vendorUserId) return
    const supabase = createClient()
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setIsOwner(session?.user?.id === vendorUserId)
      })
      .catch(() => {})
  }, [vendorUserId])

  if (!isOwner) return null

  return (
    <Link
      href="/markets/vendor/profile/edit"
      className="flex items-center justify-center gap-0 sm:gap-2 p-0 sm:px-4 sm:py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-2xl border border-neutral-200 transition-colors h-11 min-w-[44px] flex-1 sm:h-auto sm:w-auto sm:min-w-[auto] sm:flex-none whitespace-nowrap"
      aria-label="Edit profile"
    >
      <svg className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span className="hidden sm:inline">Edit Profile</span>
    </Link>
  )
}
