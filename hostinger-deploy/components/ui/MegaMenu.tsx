'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  href: string
  count?: number
}

interface FeaturedVendor {
  id: string
  name: string
  tagline: string
  imageUrl: string
  href: string
  isVerified: boolean
}

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
  categories?: Category[]
  featuredVendors?: FeaturedVendor[]
  upcomingMarketDate?: string
  upcomingMarketLocation?: string
}

export default function MegaMenu({
  isOpen,
  onClose,
  categories = [],
  featuredVendors = [],
  upcomingMarketDate,
  upcomingMarketLocation,
}: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)

    // Focus first focusable element
    const firstLink = menuRef.current?.querySelector('a, button')
    if (firstLink instanceof HTMLElement) {
      firstLink.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Memoize default categories to prevent recreation on every render
  const defaultCategories: Category[] = useMemo(() => [
    { id: '1', name: 'Food & Beverages', href: '/products?category=food', count: 24 },
    { id: '2', name: 'Arts & Crafts', href: '/products?category=arts', count: 18 },
    { id: '3', name: 'Clothing & Accessories', href: '/products?category=clothing', count: 15 },
    { id: '4', name: 'Home & Living', href: '/products?category=home', count: 12 },
    { id: '5', name: 'Wellness & Beauty', href: '/products?category=wellness', count: 9 },
  ], [])

  const displayCategories = useMemo(() =>
    categories.length > 0 ? categories : defaultCategories,
    [categories, defaultCategories]
  )

  return (
    <div
      ref={menuRef}
      className="absolute left-0 right-0 top-full mt-2 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50"
      role="menu"
      aria-label="Market menu"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Categories Section */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
            Shop by Category
          </h3>
          <ul className="space-y-2" role="list">
            {displayCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={category.href}
                  className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  role="menuitem"
                  onClick={onClose}
                >
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600">
                    {category.name}
                  </span>
                  {category.count !== undefined && (
                    <span className="text-xs text-neutral-500">{category.count}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Featured Businesses Section */}
        {featuredVendors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
              Featured Businesses
            </h3>
            <ul className="space-y-3" role="list">
              {featuredVendors.slice(0, 4).map((vendor) => (
                <li key={vendor.id}>
                  <Link
                    href={vendor.href}
                    className="flex items-center gap-3 group p-3 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    role="menuitem"
                    onClick={onClose}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden">
                      <img
                        src={vendor.imageUrl}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 group-hover:text-primary-600 truncate">
                          {vendor.name}
                        </span>
                        {vendor.isVerified && (
                          <svg
                            className="flex-shrink-0 w-4 h-4 text-primary-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-label="Verified"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 truncate">{vendor.tagline}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/markets/sellers"
              className="block mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 text-center"
              onClick={onClose}
            >
              View all businesses →
            </Link>
          </div>
        )}

        {/* Events Section */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
            Events & Discovery
          </h3>
          <ul className="space-y-2" role="list">
            <li>
              <Link
                href="/markets/discovery"
                className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                role="menuitem"
                onClick={onClose}
              >
                <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600">
                  Discover Events
                </span>
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
            </li>
            <li>
              <Link
                href="/markets/market-days"
                className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                role="menuitem"
                onClick={onClose}
              >
                <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600">
                  Market Days
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/markets/my-events"
                className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                role="menuitem"
                onClick={onClose}
              >
                <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600">
                  My Events
                </span>
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}


