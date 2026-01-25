'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth/admin'

export default function AdminLink() {
  const [showAdmin, setShowAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const admin = await isAdmin()
        setShowAdmin(admin)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setShowAdmin(false)
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [])

  if (loading || !showAdmin) {
    return null
  }

  return (
    <Link
      href="/markets/admin"
      className="px-2 xl:px-2.5 py-2 text-sm xl:text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap"
    >
      Admin
    </Link>
  )
}





