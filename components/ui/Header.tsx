'use client'

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/contexts/AuthContext'
import { useCart } from '@/components/contexts/CartContext'
import { hasAdminAccess } from '@/lib/auth/authority-client'
import dynamic from 'next/dynamic'

// Lazy load heavy components for better initial page load
const CartDrawer = dynamic(() => import('./CartDrawer'), {
  ssr: false,
  loading: () => null,
})

const SubmitOrderModal = dynamic(() => import('./SubmitOrderModal'), {
  ssr: false,
  loading: () => null,
})


interface HeaderProps {
  className?: string
}

function Header({ className }: HeaderProps) {
  // Track which menu is open by its label/ID
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

  // Ref to track the currently active button element for positioning
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [accountMenuPosition, setAccountMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  const accountButtonRef = useRef<HTMLButtonElement>(null)

  const { user, vendor, loading, signOut } = useAuth()
  const { getCartItemCount } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const cartItemCount = getCartItemCount()

  // Track initial load
  useEffect(() => {
    if (!loading && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true)
    }
  }, [loading, hasInitiallyLoaded])

  // Safety timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!hasInitiallyLoaded) {
        console.warn('[Header] Auth loading timeout, forcing initial load state')
        setHasInitiallyLoaded(true)
      }
    }, 10000)
    return () => clearTimeout(timeoutId)
  }, [hasInitiallyLoaded])

  // Close menus on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsAccountMenuOpen(false)
    setActiveMenu(null)
  }, [pathname])

  // Update Menu position when opened (throttled)
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (activeMenu && activeTriggerRef.current) {
      let rafId: number | null = null
      let lastUpdate = 0
      const throttleMs = 16

      const updatePosition = () => {
        const now = Date.now()
        if (now - lastUpdate < throttleMs) {
          if (rafId === null) {
            rafId = requestAnimationFrame(() => updatePosition())
          }
          return
        }
        lastUpdate = now

        if (!activeTriggerRef.current || typeof window === 'undefined') return

        try {
          const rect = activeTriggerRef.current.getBoundingClientRect()
          if (rect && window.innerWidth) {
            setMenuPosition({
              top: rect.bottom + 8,
              left: rect.left,
            })
          }
        } catch (error) {
          console.error('Error calculating menu position:', error)
          setMenuPosition({ top: 80, left: 20 })
        }
      }

      const timeoutId = setTimeout(updatePosition, 10)
      const throttledUpdate = () => {
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            updatePosition()
            rafId = null
          })
        }
      }

      window.addEventListener('scroll', throttledUpdate, { passive: true })
      window.addEventListener('resize', throttledUpdate, { passive: true })

      return () => {
        clearTimeout(timeoutId)
        if (rafId !== null) cancelAnimationFrame(rafId)
        window.removeEventListener('scroll', throttledUpdate)
        window.removeEventListener('resize', throttledUpdate)
      }
    } else {
      setMenuPosition(null)
    }
  }, [activeMenu])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!activeMenu) return

    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside menu AND outside the trigger button
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
        activeTriggerRef.current && !activeTriggerRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenu])

  // Check admin status
  useEffect(() => {
    if (user && !loading) {
      let cancelled = false
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.warn('[Header] Admin check timed out')
          setUserIsAdmin(false)
        }
      }, 5000)

      hasAdminAccess()
        .then((result) => {
          if (!cancelled) {
            clearTimeout(timeoutId)
            setUserIsAdmin(result)
          }
        })
        .catch((error) => {
          if (!cancelled) {
            clearTimeout(timeoutId)
            console.error('[Header] Admin check error:', error)
            setUserIsAdmin(false)
          }
        })

      return () => {
        cancelled = true
        clearTimeout(timeoutId)
      }
    } else {
      setUserIsAdmin(false)
    }
  }, [user, loading])

  // Scroll handler
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10)
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Account menu position
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isAccountMenuOpen && accountButtonRef.current) {
      let rafId: number | null = null
      let lastUpdate = 0
      const throttleMs = 16

      const updatePosition = () => {
        const now = Date.now()
        if (now - lastUpdate < throttleMs) {
          if (rafId === null) {
            rafId = requestAnimationFrame(() => updatePosition())
          }
          return
        }
        lastUpdate = now

        if (!accountButtonRef.current || typeof window === 'undefined') return

        try {
          const rect = accountButtonRef.current.getBoundingClientRect()
          if (rect && window.innerWidth) {
            setAccountMenuPosition({
              top: rect.bottom + 8,
              right: window.innerWidth - rect.right,
            })
          }
        } catch (error) {
          console.error('Error calculating account menu position:', error)
          setAccountMenuPosition({ top: 80, right: 20 })
        }
      }

      const timeoutId = setTimeout(updatePosition, 10)
      const throttledUpdate = () => {
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            updatePosition()
            rafId = null
          })
        }
      }

      window.addEventListener('scroll', throttledUpdate, { passive: true })
      window.addEventListener('resize', throttledUpdate, { passive: true })

      return () => {
        clearTimeout(timeoutId)
        if (rafId !== null) cancelAnimationFrame(rafId)
        window.removeEventListener('scroll', throttledUpdate)
        window.removeEventListener('resize', throttledUpdate)
      }
    } else if (!isAccountMenuOpen) {
      setAccountMenuPosition(null)
    }
  }, [isAccountMenuOpen])

  // Close account menu when clicking outside
  useEffect(() => {
    if (!isAccountMenuOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.account-menu-container') && !target.closest('[class*="z-dropdown"]')) {
        setIsAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAccountMenuOpen])

  const handleMenuToggle = useCallback((menuLabel: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (activeMenu === menuLabel) {
      setActiveMenu(null)
      activeTriggerRef.current = null
    } else {
      setActiveMenu(menuLabel)
      activeTriggerRef.current = event.currentTarget
    }
  }, [activeMenu])

  const navItems = useMemo(() => [
    {
      label: 'Events',
      href: '/markets/discovery',
      subItems: [
        { label: 'Discovery Hub', href: '/markets/discovery' },
        { label: 'My Saved Events', href: '/markets/my-events' },
        { label: 'Hosting & Applicants', href: '/contact' },
      ]
    },
    {
      label: 'Businesses',
      href: '/businesses',
      subItems: [
        { label: 'Discovery Hub', href: '/businesses' },
        { label: 'Food & Drink', href: '/businesses?category=food' },
        { label: 'Retail & Shops', href: '/businesses?category=retail' },
        { label: 'Professional Services', href: '/businesses?category=service' },
      ]
    },
    {
      label: 'Markets',
      href: '/markets/market-days',
      subItems: [
        { label: 'Upcoming Markets', href: '/markets/market-days' },
        { label: 'Market Sellers', href: '/markets/sellers' },
        { label: 'Artisan Products', href: '/markets/products' },
      ]
    },
    {
      label: 'Stays',
      href: '/properties',
      subItems: [
        { label: 'All Stays', href: '/properties' },
        { label: 'Premium Villas', href: '/properties?type=villa' },
        { label: 'Apartments', href: '/properties?type=apartment' },
        { label: 'Event Venues', href: '/properties?property_type=event_space' },
      ]
    },
    {
      label: 'Concierge',
      href: '/concierge',
      subItems: [
        { label: 'Relocation Services', href: '/concierge' },
        { label: 'Meet the Team', href: '/meet-the-team' },
        { label: 'Local Guides', href: '/concierge/guides', comingSoon: true },
        { label: 'Expat Support', href: '/concierge/expat-support', comingSoon: true },
      ]
    },
    {
      label: 'About',
      href: '/meet-the-team',
      subItems: [
        { label: 'Meet the Team', href: '/meet-the-team' },
        { label: 'Contact Us', href: '/contact' },
      ]
    },
  ], [])

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const handleAccountMenuToggle = useCallback(() => {
    setIsAccountMenuOpen(prev => !prev)
  }, [])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      setIsAccountMenuOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [signOut])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 left-0 right-0 z-header w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60',
          isScrolled && 'shadow-md bg-white/95 backdrop-blur-md',
          className
        )}
        role="banner"
        style={{ willChange: 'transform' }}
      >
        <div className="container-custom">
          <div className={cn(
            'flex items-center justify-between',
            'h-16 lg:h-20',
            'gap-2 lg:gap-3'
          )}>
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 min-w-0">
              <Link
                href="/"
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg flex-shrink-0"
                aria-label="Asia Insights Home"
              >
                <Image
                  src="/images/asia-insights-logo.svg"
                  alt="Asia Insights"
                  width={140}
                  height={40}
                  className="h-8 lg:h-9 xl:h-10 w-auto object-contain"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
                {navItems.map((item) => {
                  // Items with sub-items render as dropdown
                  if (item.subItems && item.subItems.length > 0) {
                    const isOpen = activeMenu === item.label

                    return (
                      <div key={item.href} className="relative">
                        <button
                          onClick={(e) => handleMenuToggle(item.label, e)}
                          className={cn(
                            "px-2.5 xl:px-3 py-2 text-sm xl:text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap flex items-center gap-1",
                            isOpen
                              ? "text-primary-600 bg-primary-50"
                              : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                          )}
                          aria-expanded={isOpen}
                          aria-haspopup="true"
                        >
                          {item.label}
                          <svg
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isOpen && typeof window !== 'undefined' && menuPosition && (
                          <div
                            ref={menuRef}
                            className="fixed bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200/50 py-3 z-dropdown min-w-[220px] overflow-hidden"
                            style={{
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                            }}
                          >
                            <div className="px-4 pb-2 mb-2 border-b border-neutral-100/50">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                {item.label}
                              </span>
                            </div>
                            {item.subItems.map((subItem) => (
                              subItem.comingSoon ? (
                                <div
                                  key={subItem.href}
                                  className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-neutral-400 cursor-default"
                                >
                                  {subItem.label}
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded ml-2">
                                    Soon
                                  </span>
                                </div>
                              ) : (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className="block px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  {subItem.label}
                                </Link>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                  // Regular nav items without sub-items
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-2.5 xl:px-3 py-2 text-sm xl:text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Section: Actions - Cart, Account, Market Date, CTA */}
            {/* Grouped action cluster with consistent spacing (gap-2) for premium, compact feel */}
            {/* Note: Admin Dashboard is only accessible via Account dropdown menu */}
            {/* GUARDRAIL: Touch target accessibility (WCAG 2.5.5). All header buttons: w-11 h-11 (44px minimum). DO NOT: Reduce button sizes below 44px or remove padding. Test: Verify all buttons are tappable on mobile (320px-375px). */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Cart Icon - Primary interaction, larger size for clarity and confidence */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Shopping cart"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] xl:text-xs font-semibold text-white bg-primary-600 rounded-full">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* Account Menu - Primary interaction, larger size for clarity and confidence */}
              {loading && !hasInitiallyLoaded ? (
                <div className="p-2.5 w-11 h-11 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : user ? (
                <div className="relative account-menu-container">
                  <button
                    ref={accountButtonRef}
                    onClick={handleAccountMenuToggle}
                    className="p-2.5 w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Account menu"
                    aria-expanded={isAccountMenuOpen}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  {isAccountMenuOpen && typeof window !== 'undefined' && accountMenuPosition && (
                    <div
                      className="fixed w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/60 py-2 z-dropdown"
                      style={{
                        top: `${accountMenuPosition.top}px`,
                        right: `${accountMenuPosition.right}px`,
                      }}
                    >
                      {/* User Info - Premium Link to Account Hub */}
                      <Link
                        href="/account"
                        className="block px-4 py-4 bg-neutral-50/50 hover:bg-neutral-100 transition-colors border-b border-neutral-100 group"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                            {user.email?.[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 group-hover:text-primary-700 transition-colors truncate max-w-[150px]">
                              {vendor ? vendor.name : 'My Account'}
                            </div>
                            <div className="text-xs text-neutral-500 font-medium group-hover:text-primary-600/70">
                              Identity & Settings
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Quick Access Menu */}
                      <div className="py-2">
                        {/* Vendor Dashboard - For vendors and admins */}
                        {(vendor || userIsAdmin) && (
                          <Link
                            href="/markets/vendor/dashboard"
                            className="block px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              <span>Vendor Dashboard</span>
                            </div>
                          </Link>
                        )}

                        {/* Edit Profile - For vendors */}
                        {vendor && (
                          <Link
                            href="/markets/vendor/profile/edit"
                            className="block px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit Profile</span>
                            </div>
                          </Link>
                        )}
                      </div>

                      {/* My Orders - Available for all logged-in users */}
                      <Link
                        href="/markets/orders"
                        className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>My Orders</span>
                        </div>
                      </Link>

                      {/* My Events - Available for all logged-in users */}
                      <Link
                        href="/markets/my-events"
                        className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>My Events</span>
                        </div>
                      </Link>

                      {/* Admin Dashboard - Only for admin users */}
                      {userIsAdmin && (
                        <>
                          <div className="border-t border-neutral-100 my-1" />
                          <div className="px-4 py-2">
                            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Administration</div>
                          </div>
                          <Link
                            href="/markets/admin"
                            className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span>Dashboard</span>
                            </div>
                          </Link>
                        </>
                      )}

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="p-2.5 w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label="Sign in"
                  title="Sign In"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              )}

              {/* Market Date Picker - Desktop - Hidden on Discovery page to reduce noise */}
              {pathname !== '/markets/discovery' && (
                <Link
                  href="/markets/market-days"
                  className={cn(
                    'hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all duration-200 group h-9'
                  )}
                >
                  <svg className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex flex-col min-w-[35px]">
                    <span className="text-[9px] text-primary-600 font-medium leading-tight">
                      Next
                    </span>
                    <span className="text-[10px] font-bold text-neutral-900 group-hover:text-primary-700 leading-tight">
                      Dec 17
                    </span>
                  </div>
                </Link>
              )}

              {/* List Your Stall CTA - Desktop - Hidden on Discovery page */}
              {pathname !== '/markets/discovery' && (
                <Link
                  href="/markets/vendor/apply"
                  className="hidden xl:inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap h-9"
                >
                  List your stall
                </Link>
              )}


              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2.5 w-11 h-11 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                onClick={handleMobileMenuToggle}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav
              className={cn(
                'lg:hidden py-4 border-t border-neutral-200',
                'transform transition-all duration-200 ease-out',
                'opacity-100 translate-y-0'
              )}
              aria-label="Mobile navigation"
            >
              {navItems.map((item) => {
                // Markets has sub-items - render with expandable sub-menu
                if (item.subItems && item.subItems.length > 0) {
                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-8 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )
                }
                // Regular nav items
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <Link
                href="/markets/vendor/apply"
                className="block px-4 py-3 mt-2 text-base font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                List your stall
              </Link>
              {user ? (
                <>
                  {vendor ? (
                    <>
                      <Link
                        href={`/markets/sellers/${vendor.slug}`}
                        className="block px-4 py-3 mt-2 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center gap-3"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Seller Profile
                      </Link>
                      <Link
                        href="/markets/vendor/profile/edit"
                        className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center gap-3"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </Link>
                    </>
                  ) : null}

                  {/* My Orders - Available for all logged-in users */}
                  <Link
                    href="/markets/orders"
                    className="block px-4 py-3 mt-2 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Orders
                  </Link>

                  <button
                    onClick={async () => {
                      await handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 mt-2 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center gap-3"
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
                  className="block px-4 py-3 mt-2 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          )}
        </div>

      </header>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsSubmitModalOpen(true)
        }}
      />

      {/* Submit Order Modal */}
      <SubmitOrderModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </>
  )
}

// Memoize Header to prevent unnecessary re-renders
export default memo(Header)

