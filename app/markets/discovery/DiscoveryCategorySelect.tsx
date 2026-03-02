'use client'

import { useRouter } from 'next/navigation'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'Market', label: 'Markets' },
  { value: 'Workshop', label: 'Workshops' },
  { value: 'Meetup', label: 'Meetups' },
  { value: 'Sports', label: 'Sports' },
]

interface Props {
  currentCategory: string
  currentFilter: string
}

export default function DiscoveryCategorySelect({ currentCategory, currentFilter }: Props) {
  const router = useRouter()

  return (
    <select
      value={currentCategory}
      onChange={(e) => {
        const params = new URLSearchParams()
        if (currentFilter && currentFilter !== 'all') params.set('filter', currentFilter)
        if (e.target.value) params.set('category', e.target.value)
        // page resets to 1 on category change (omitting page param = page 1)
        const qs = params.toString()
        router.push(`/markets/discovery${qs ? `?${qs}` : ''}`)
      }}
      className="px-4 py-3 text-sm border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      {categories.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  )
}
