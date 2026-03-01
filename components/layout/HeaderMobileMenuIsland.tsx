'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/contexts/AuthContext'

interface NavItem {
  label: string
  href: string
  subItems?: { label: string; href: string; comingSoon?: boolean }[]
}

interface HeaderMobileMenuIslandProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
}

export default function HeaderMobileMenuIsland({ isOpen, onClose, navItems }: HeaderMobileMenuIslandProps) {
  const { user, vendor, signOut } = useAuth()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [signOut, onClose])

  if (!isOpen) return null

  return (
    <nav
      className="lg:hidden py-4 border-t border-neutral-200 transform transition-all duration-200 ease-out opacity-100 translate-y-0"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        if (item.subItems && item.subItems.length > 0) {
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors min-h-[44px] flex items-center"
                onClick={onClose}
              >
                {item.label}
              </Link>
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className="block px-8 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors min-h-[44px] flex items-center"
                  onClick={onClose}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          )
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors min-h-[44px] flex items-center"
            onClick={onClose}
          >
            {item.label}
          </Link>
        )
      })}

      {user ? (
        <>
          {vendor ? (
            <>
              <Link
                href={`/markets/sellers/${vendor.slug}`}
                className="block px-4 py-3 mt-2 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors min-h-[44px] flex items-center gap-3"
                onClick={onClose}
              >
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Seller Profile
              </Link>
              <Link
                href="/markets/vendor/profile/edit"
                className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors min-h-[44px] flex items-center gap-3"
                onClick={onClose}
              >
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Link>
            </>
          ) : null}

          <Link
            href="/markets/orders"
            className="block px-4 py-3 mt-2 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors min-h-[44px] flex items-center gap-3"
            onClick={onClose}
          >
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Orders
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-3 mt-2 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors min-h-[44px] flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </>
      ) : (
        <Link
          href="/auth/login"
          className="block px-4 py-3 mt-2 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors min-h-[44px] flex items-center"
          onClick={onClose}
        >
          Sign In
        </Link>
      )}
    </nav>
  )
}
