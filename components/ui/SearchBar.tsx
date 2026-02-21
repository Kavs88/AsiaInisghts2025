'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { searchProducts, getVendors, searchBusinesses } from '@/lib/supabase/queries'

interface SearchResult {
  id: string
  type: 'product' | 'vendor' | 'business'
  title: string
  subtitle?: string
  imageUrl?: string
  href: string
}


interface SearchBarProps {
  variant?: 'default' | 'fullscreen' | 'hero' | 'minimal'
  onClose?: () => void
  className?: string
  placeholder?: string
}

export default function SearchBar({
  variant = 'default',
  onClose,
  className,
  placeholder,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Default placeholders based on variant
  const defaultPlaceholder = variant === 'hero'
    ? "Search for markets, products, or businesses..."
    : "Search..."

  const displayPlaceholder = placeholder || defaultPlaceholder
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 400 })
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Memoize search function to prevent recreation
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      // Search products and vendors in parallel
      // Only run on client side to avoid server/client boundary issues
      if (typeof window === 'undefined') {
        setIsSearching(false)
        return
      }

      const [productResults, vendorResults, businessResults] = await Promise.all([
        searchProducts(searchQuery, 5).catch((err) => {
          console.error('Product search error:', err)
          return []
        }),
        getVendors({ searchQuery, limit: 3 }).catch((err) => {
          console.error('Vendor search error:', err)
          return []
        }),
        searchBusinesses(searchQuery, 3).catch((err) => {
          console.error('Business search error:', err)
          return []
        }),
      ])

      // Map products to SearchResult format
      const mappedProducts: SearchResult[] = (productResults || []).map((product: any) => ({
        id: product.id,
        type: 'product' as const,
        title: product.name,
        subtitle: product.vendors ? `by ${product.vendors.name}` : undefined,
        imageUrl: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : undefined,
        href: product.vendors?.slug ? `/products/${product.slug}` : `/products/${product.slug}`,
      }))

      // Map vendors to SearchResult format
      const mappedVendors: SearchResult[] = (vendorResults || []).map((vendor: any) => ({
        id: vendor.id,
        type: 'vendor' as const,
        title: vendor.name,
        subtitle: vendor.short_tagline || vendor.tagline || undefined,
        imageUrl: vendor.logo_url || vendor.hero_image_url || undefined,
        href: `/vendors/${vendor.slug}`,
      }))

      // Map businesses to SearchResult format
      const mappedBusinesses: SearchResult[] = (businessResults || []).map((business: any) => ({
        id: business.id,
        type: 'business' as const,
        title: business.name,
        subtitle: business.category || undefined,
        imageUrl: business.logo_url || undefined,
        href: `/businesses/${business.slug}`,
      }))

      // Combine and limit to 10 results total
      const combinedResults = [...mappedProducts, ...mappedVendors, ...mappedBusinesses].slice(0, 10)

      setResults(combinedResults)
      setIsOpen(combinedResults.length > 0)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setIsOpen(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300) // Optimized debounce time

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  // Open dropdown when results are available
  useEffect(() => {
    if (results.length > 0) {
      setIsOpen(true)
    }
  }, [results])

  useEffect(() => {
    if (variant === 'fullscreen' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [variant])

  // Update dropdown position on scroll/resize (for fixed positioning)
  useEffect(() => {
    if (!isOpen || !inputRef.current || (variant !== 'default' && variant !== 'hero')) return

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + 8, // Fixed positioning uses viewport coordinates
          left: rect.left,
          width: rect.width,
        })
      }
    }

    updatePosition() // Initial position
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, variant])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          try {
            router.push(results[selectedIndex].href)
            handleClose()
          } catch (error) {
            console.error('Error navigating:', error)
            // Fallback to window.location if router.push fails
            window.location.href = results[selectedIndex].href
          }
        }
        break
      case 'Escape':
        e.preventDefault()
        handleClose()
        break
    }
  }

  const handleClose = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
    onClose?.()
  }

  const handleResultClick = (href: string) => {
    try {
      router.push(href)
      handleClose()
    } catch (error) {
      console.error('Error navigating:', error)
      // Fallback to window.location if router.push fails
      window.location.href = href
    }
  }

  if (variant === 'fullscreen') {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-white"
        role="dialog"
        aria-label="Search"
        aria-modal="true"
      >
        <div className="container-custom pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={displayPlaceholder}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                aria-label="Search input"
                aria-expanded={isOpen}
                aria-controls="search-results"
              />
              {query && (
                <button
                  onClick={handleClose}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-neutral-600"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              aria-label="Close search"
            >
              Cancel
            </button>
          </div>

          {isOpen && results.length > 0 && (
            <div
              id="search-results"
              ref={resultsRef}
              className="space-y-2"
              role="listbox"
            >
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 text-left rounded-xl transition-colors',
                    selectedIndex === index
                      ? 'bg-primary-50 border-2 border-primary-200'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-2 border-transparent'
                  )}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  {result.imageUrl && (
                    <div className="flex-shrink-0 w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden">
                      <img
                        src={result.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-neutral-600 truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500 capitalize">
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query && !isOpen && results.length === 0 && query.length >= 2 && (
            <div className="text-center py-12 text-neutral-500">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    )
  }

  // Hero variant - large, visually dominant search for hero sections
  if (variant === 'hero') {
    return (
      <div className={cn('relative w-full min-w-0 z-10', className)}>
        <div className="relative">
          {/* Search icon - larger for hero variant, positioned to not overlap text */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
            <svg
              className="w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) {
                setIsOpen(true)
              }
            }}
            placeholder="Search products, vendors, markets..."
            className="w-full pl-12 pr-12 py-4 text-base lg:text-lg border-2 border-white/50 bg-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-neutral-900 placeholder:text-neutral-400 hover:shadow-xl shadow-lg transition-all duration-200"
            aria-label="Search"
            aria-expanded={isOpen}
            aria-controls="search-results-dropdown"
          />
          {query && (
            <button
              onClick={handleClose}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          {/* Fix 4: Loading indicator inside input */}
          {isSearching && !query && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-4 h-4 text-neutral-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          )}
          {isSearching && query && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-4 h-4 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && results.length > 0 && (
          <div
            id="search-results-dropdown"
            ref={resultsRef}
            className="fixed bg-white border border-neutral-200 rounded-xl shadow-lg max-h-[500px] overflow-y-auto z-[10000]"
            role="listbox"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width || 400}px`,
            }}
          >
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.href)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-50 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-neutral-100 last:border-b-0',
                  selectedIndex === index && 'bg-primary-50/50'
                )}
                role="option"
                aria-selected={selectedIndex === index}
              >
                {result.imageUrl && (
                  <div className="flex-shrink-0 w-14 h-14 bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
                    <img
                      src={result.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-neutral-900 truncate mb-1">
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div className="text-sm text-neutral-600 truncate">
                      {result.subtitle}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full capitalize flex-shrink-0">
                  {result.type}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Fix 3: Empty state for hero variant */}
        {!isSearching && query.length >= 2 && results.length === 0 && (
          <div
            className="fixed bg-white border border-neutral-200 rounded-xl shadow-lg z-[10000] px-4 py-3 text-sm text-neutral-500"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width || 400}px`,
            }}
          >
            No results for &quot;{query}&quot;
          </div>
        )}
      </div>
    )
  }

  // Default variant (desktop header search)
  // Premium styling: subtle border (1px), soft background (neutral-50), restrained radius (rounded-lg)
  // Reduced height (py-2) and smaller icon (w-4) to align with nav items and feel secondary
  return (
    <div className={cn('relative w-full min-w-0', className)}>
      <div className="relative">
        {/* Search icon - smaller and more subtle for premium feel */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder="Search products, vendors, markets..."
          className="w-full pl-10 pr-8 py-2 text-sm xl:text-base border border-neutral-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none bg-neutral-50 hover:bg-white hover:border-neutral-300 transition-all duration-150"
          aria-label="Search"
          aria-expanded={isOpen}
          aria-controls="search-results-dropdown"
        />
        {query && (
          <button
            onClick={handleClose}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {/* Fix 4: Spinner for default variant */}
        {isSearching && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
            <svg className="w-4 h-4 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          id="search-results-dropdown"
          ref={resultsRef}
          className="fixed bg-white border border-neutral-200 rounded-xl shadow-lg max-h-[500px] overflow-y-auto z-[10000]"
          role="listbox"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width || 400}px`,
          }}
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result.href)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-50 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-neutral-100 last:border-b-0',
                selectedIndex === index && 'bg-primary-50/50'
              )}
              role="option"
              aria-selected={selectedIndex === index}
            >
              {result.imageUrl && (
                <div className="flex-shrink-0 w-14 h-14 bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
                  <img
                    src={result.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-neutral-900 truncate mb-1">
                  {result.title}
                </div>
                {result.subtitle && (
                  <div className="text-sm text-neutral-600 truncate">
                    {result.subtitle}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full capitalize flex-shrink-0">
                {result.type}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Fix 3: Empty state for default variant */}
      {!isSearching && query.length >= 2 && results.length === 0 && (
        <div
          className="fixed bg-white border border-neutral-200 rounded-xl shadow-lg z-[10000] px-4 py-3 text-sm text-neutral-500"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width || 400}px`,
          }}
        >
          No results for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
