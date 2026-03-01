'use client'

import dynamic from 'next/dynamic'

interface HeroSearchBarProps {
  helperText?: string
}

// Lazy-load SearchBar so it doesn't inflate the initial JS bundle.
// The search input is not required for LCP or FID — it's interactive-only.
const SearchBar = dynamic(() => import('./SearchBar'), {
  ssr: false,
  loading: () => (
    <div className="w-full pl-12 pr-12 py-4 text-base lg:text-lg border-2 border-white/50 bg-white rounded-xl shadow-lg text-neutral-400">
      Search products, vendors, markets...
    </div>
  ),
})

export default function HeroSearchBar({ helperText }: HeroSearchBarProps) {
  return <SearchBar variant="hero" placeholder={helperText} />
}
