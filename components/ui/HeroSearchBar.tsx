'use client'

import SearchBar from './SearchBar'

interface HeroSearchBarProps {
  helperText?: string
}

export default function HeroSearchBar({ helperText }: HeroSearchBarProps) {
  // Render SearchBar directly - Next.js will handle SSR/hydration automatically
  // No placeholder needed to avoid flash - SearchBar will hydrate seamlessly
  return <SearchBar variant="hero" placeholder={helperText} />
}

