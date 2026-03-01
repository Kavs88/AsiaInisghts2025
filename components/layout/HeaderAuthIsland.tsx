'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'
import { useCart } from '@/components/contexts/CartContext'
import { hasAdminAccess } from '@/lib/auth/authority-client'

interface HeaderAuthIslandProps {
  onOpenCart: () => void
}

export default function HeaderAuthIsland({ onOpenCart }: HeaderAuthIslandProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [accountMenuPosition, setAccountMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [nextMarketLabel, setNextMarketLabel] = useState<string | null>(null)

  const accountButtonRef = useRef<HTMLButtonElement>(null)

  const { user, vendor, loading, signOut } = useAuth()
  const { getCartItemCount } = useCart()
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
        console.warn('[HeaderAuthIsland] Auth loading timeout, forcing initial load state')
        setHasInitiallyLoaded(true)
      }
    }, 10000)
    return () => clearTimeout(timeoutId)
  }, [hasInitiallyLoaded])

  // Close account menu on navigation
  useEffect(() => {
    setIsAccountMenuOpen(false)
  }, [pathname])

  // Account menu position updater
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

  // Check admin status
  useEffect(() => {
    if (user && !loading) {
      let cancelled = false
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.warn('[HeaderAuthIsland] Admin check timed out')
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
            console.error('[HeaderAuthIsland] Admin check error:', error)
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

  // Fetch next market date once on mount
  useEffect(() => {
    fetch('/api/next-market')
      .then(r => r.json())
      .then(({ market }) => {
        if (market?.market_date) {
          const d = new Date(market.market_date + 'T00:00:00')
          setNextMarketLabel(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
        }
      })
      .catch(() => { })
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
      {/* Cart Icon */}
      <button
        onClick={onOpenCart}
        className="relative p-2.5 w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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

      {/* Account Menu */}
      {loading && !hasInitiallyLoaded ? (
        <div className="p-2.5 w-11 h-11 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : user ? (
        <div className="relative account-menu-container">
          <button
            ref={accountButtonRef}
            onClick={handleAccountMenuToggle}
            className="p-2.5 w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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

          {/* Mobile Backdrop */}
          {isAccountMenuOpen && typeof window !== 'undefined' && accountMenuPosition && (
            <div
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
              onClick={() => setIsAccountMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          {isAccountMenuOpen && typeof window !== 'undefined' && accountMenuPosition && (
            <div
              className="fixed inset-x-0 bottom-0 mt-0 w-full rounded-t-3xl pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom flex flex-col max-h-[85vh] overflow-y-auto z-50 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-neutral-100 md:absolute md:top-auto md:bottom-auto md:w-64 md:rounded-2xl md:bg-white/95 md:backdrop-blur-xl md:shadow-xl md:border md:border-neutral-200/60 md:py-2 md:z-dropdown md:pb-2 md:animate-in md:slide-in-from-top-2"
              style={window.innerWidth >= 768 ? {
                top: `${accountMenuPosition.top}px`,
                right: `${accountMenuPosition.right}px`,
                left: 'auto',
                bottom: 'auto'
              } : {}}
            >
              {/* Mobile Pull Indicator */}
              <div className="md:hidden w-full flex justify-center py-3">
                <div className="w-10 h-1 bg-neutral-200 rounded-full" />
              </div>

              {/* User Info */}
              <Link
                href="/account"
                className="block px-4 py-4 md:py-4 bg-neutral-50/50 hover:bg-neutral-100 transition-colors border-b border-neutral-100 group min-h-[48px]"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 group-hover:text-primary-700 transition-colors truncate max-w-[150px]">
                      {vendor ? vendor.name : (user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Account')}
                    </div>
                    <div className="text-xs text-neutral-500 font-medium group-hover:text-primary-600/70">
                      {vendor ? 'Business' : 'Member'}
                    </div>
                  </div>
                </div>
              </Link>

              {/* My Discovery Section */}
              <div className="py-2 border-b border-neutral-100/60">
                <div className="px-4 py-2 md:py-1 mb-1">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">My Discovery</div>
                </div>

                <Link
                  href="/account/community"
                  className="flex items-center px-4 py-3 min-h-[48px] text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 md:w-4 md:h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>Saved Items</span>
                  </div>
                </Link>

                <Link
                  href="/markets/my-events"
                  className="flex items-center px-4 py-3 min-h-[48px] text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 md:w-4 md:h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Saved Events</span>
                  </div>
                </Link>

                <Link
                  href="/markets/orders"
                  className="flex items-center px-4 py-3 min-h-[48px] text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 md:w-4 md:h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>My Orders</span>
                  </div>
                </Link>
              </div>

              {/* Account & Settings Section */}
              <div className="py-2 border-b border-neutral-100/60">
                <div className="px-4 py-2 md:py-1 mb-1">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Account & Settings</div>
                </div>

                {(vendor || userIsAdmin) && (
                  <Link
                    href="/markets/vendor/dashboard"
                    className="flex items-center px-4 py-3.5 min-h-[48px] text-sm font-medium text-neutral-900 transition-all bg-neutral-900 active:bg-neutral-800 md:bg-gradient-to-r md:from-slate-800 md:to-slate-900 md:hover:from-slate-700 md:hover:to-slate-800 text-white md:border-transparent md:border-l-0 mb-1 rounded-xl mx-2 md:mx-0 md:rounded-none group"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 md:w-4 md:h-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="font-bold tracking-wide">Business Hub</span>
                    </div>
                  </Link>
                )}

                {vendor && (
                  <Link
                    href="/markets/vendor/profile/edit"
                    className="flex items-center px-4 py-3 min-h-[48px] text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 md:w-4 md:h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Public Profile</span>
                    </div>
                  </Link>
                )}

                <Link
                  href="/account"
                  className="flex items-center px-4 py-3 min-h-[48px] text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 md:w-4 md:h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Account Details</span>
                  </div>
                </Link>

                {userIsAdmin && (
                  <Link
                    href="/markets/admin"
                    className="flex items-center px-4 py-3 min-h-[48px] text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-700 transition-colors mt-2 border-t border-neutral-100"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3 mt-1 text-red-600">
                      <svg className="w-5 h-5 md:w-4 md:h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-semibold">Platform Admin</span>
                    </div>
                  </Link>
                )}
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 min-h-[48px] text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 md:w-4 md:h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="p-2.5 w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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

      {/* Next Market Date - Desktop only, hidden on Discovery page */}
      {pathname !== '/markets/discovery' && nextMarketLabel && (
        <Link
          href="/markets/market-days"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-2xl transition-all duration-200 group h-9"
        >
          <svg className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="flex flex-col">
            <span className="text-[9px] text-primary-600 font-medium leading-tight">Next</span>
            <span className="text-[10px] font-bold text-neutral-900 group-hover:text-primary-700 leading-tight whitespace-nowrap">
              {nextMarketLabel}
            </span>
          </span>
        </Link>
      )}
    </>
  )
}
