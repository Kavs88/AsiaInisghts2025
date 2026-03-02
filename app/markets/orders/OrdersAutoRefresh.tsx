'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrdersAutoRefresh({ email }: { email: string }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [email, router])

  return null
}
