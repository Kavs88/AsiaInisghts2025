'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PropertyEnquiryButton from '@/components/ui/PropertyEnquiryButton'

interface Props {
  propertyId: string
  propertyAddress: string
  propertyType: 'rental' | 'event_space'
  className?: string
}

export default function PropertyEnquiryIsland({ propertyId, propertyAddress, propertyType, className }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser()
      .then(({ data: { user } }) => {
        if (user) {
          setCurrentUser({ id: user.id, email: user.email, user_metadata: user.user_metadata })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <PropertyEnquiryButton
      propertyId={propertyId}
      propertyAddress={propertyAddress}
      propertyType={propertyType}
      currentUser={currentUser}
      className={className}
    />
  )
}
