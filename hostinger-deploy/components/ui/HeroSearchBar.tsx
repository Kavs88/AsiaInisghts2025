'use client'

import SearchBar from './SearchBar'

export default function HeroSearchBar() {
  // Render SearchBar directly - Next.js will handle SSR/hydration automatically
  // No placeholder needed to avoid flash - SearchBar will hydrate seamlessly
  return <SearchBar variant="hero" />
}

