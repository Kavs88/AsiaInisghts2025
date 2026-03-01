'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import HeaderAuthIsland from '@/components/layout/HeaderAuthIsland'
import HeaderMobileMenuIsland from '@/components/layout/HeaderMobileMenuIsland'

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

interface NavItem {
  label: string
  href: string
  subItems?: { label: string; href: string; comingSoon?: boolean }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Events',
    href: '/markets/discovery',
    subItems: [
      { label: 'Discovery Hub', href: '/markets/discovery' },
      { label: 'My Saved Events', href: '/markets/my-events' },
      { label: 'Hosting & Applicants', href: '/contact' },
      { label: 'Event Spaces', href: '/properties?property_type=event_space' },
    ]
  },
  {
    label: 'Businesses',
    href: '/businesses',
    subItems: [
      { label: 'Discovery Hub', href: '/businesses' },
      { label: 'Services Stack', href: '/businesses?category=setup' },
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
    ]
  },
  {
    label: 'Concierge',
    href: '/concierge',
  },
  {
    label: 'Stories',
    href: '/stories',
  },
  {
    label: 'About',
    href: '/meet-the-team',
    subItems: [
      { label: 'Meet the Team', href: '/meet-the-team' },
      { label: 'Contact Us', href: '/contact' },
    ]
  }
]

function Header({ className }: HeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  const activeTriggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()

  // Close menus on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setActiveMenu(null)
  }, [pathname])

  // Update desktop dropdown position when opened (throttled)
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

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    if (!activeMenu) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
        activeTriggerRef.current && !activeTriggerRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenu])

  // Scroll handler — drives shadow/bg enhancement
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10)
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleMenuToggle = useCallback((menuLabel: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (activeMenu === menuLabel) {
      setActiveMenu(null)
      activeTriggerRef.current = null
    } else {
      setActiveMenu(menuLabel)
      activeTriggerRef.current = event.currentTarget
    }
  }, [activeMenu])

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 left-0 right-0 z-header w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm transition-[background-color,box-shadow,backdrop-filter] duration-300 supports-[backdrop-filter]:bg-white/60',
          isScrolled && 'shadow-md bg-white/95 backdrop-blur-md',
          className
        )}
        role="banner"
      >
        <div className="container-custom">
          <div className={cn(
            'flex items-center justify-between',
            'h-16 lg:h-20',
            'gap-2 lg:gap-3'
          )}>
            {/* Left Section: Logo + Desktop Navigation */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 min-w-0">
              <Link
                href="/"
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-2xl flex-shrink-0"
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
                {NAV_ITEMS.map((item: NavItem) => {
                  if (item.subItems && item.subItems.length > 0) {
                    const isOpen = activeMenu === item.label

                    return (
                      <div key={item.href} className="relative">
                        <button
                          onClick={(e) => handleMenuToggle(item.label, e)}
                          className={cn(
                            "px-2.5 xl:px-3 py-2 text-sm xl:text-base font-medium rounded-2xl transition-[background-color,color] duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap flex items-center gap-1",
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
                            className="fixed bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/60 py-3 z-dropdown min-w-[220px] overflow-hidden"
                            style={{
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                            }}
                          >
                            <div className="px-4 pb-2 mb-2 border-b border-neutral-100">
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
                                  className="block px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:text-primary-600 hover:bg-primary-50/50 transition-[background-color,color] duration-200"
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
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-2.5 xl:px-3 py-2 text-sm xl:text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-[background-color,color] duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Section: Auth Island + Mobile Toggle */}
            {/* GUARDRAIL: Touch target accessibility (WCAG 2.5.5). All header buttons: w-11 h-11 (44px minimum). */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <HeaderAuthIsland onOpenCart={() => setIsCartOpen(true)} />

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2.5 w-11 h-11 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
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

          {/* Mobile Menu Panel */}
          <HeaderMobileMenuIsland
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            navItems={NAV_ITEMS}
          />
        </div>
      </header>

      {/* Cart Drawer — rendered as header sibling to avoid backdrop-filter stacking context */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsSubmitModalOpen(true)
        }}
      />

      {/* Submit Order Modal — rendered as header sibling to avoid backdrop-filter stacking context */}
      <SubmitOrderModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </>
  )
}

export default memo(Header)
