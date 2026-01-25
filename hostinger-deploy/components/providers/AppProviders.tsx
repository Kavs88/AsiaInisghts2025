'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/components/contexts/AuthContext'
import { CartProvider } from '@/components/contexts/CartContext'
import RecoveryTokenHandler from '@/components/auth/RecoveryTokenHandler'
import ScrollRestorationHandler from '@/components/ui/ScrollRestorationHandler'

/**
 * Client-side providers wrapper
 * This ensures all context providers are properly initialized on the client
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <RecoveryTokenHandler />
        <ScrollRestorationHandler />
        {children}
      </CartProvider>
    </AuthProvider>
  )
}

