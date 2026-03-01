'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Section {
  id: string
  label: string
}

export default function MakerAnchorNav({ sections }: { sections: Section[] }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string>('')

  // Scroll shadow detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Active section detection via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        { rootMargin: '-20% 0px -60% 0px' }
      )

      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sections])

  if (sections.length < 2) return null

  return (
    <nav
      className={cn(
        'sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur border-b border-neutral-200/60 transition-shadow duration-300',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 overflow-x-auto no-scrollbar h-14 items-center">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                'text-sm font-semibold whitespace-nowrap transition-colors h-full flex items-center border-b-2 -mb-px',
                activeId === id
                  ? 'text-neutral-900 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900 border-transparent'
              )}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
