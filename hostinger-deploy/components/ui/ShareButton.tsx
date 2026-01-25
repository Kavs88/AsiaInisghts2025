'use client'

import { useState } from 'react'

interface ShareButtonProps {
  name: string
  type?: 'vendor' | 'business'
}

export default function ShareButton({ name, type = 'vendor' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof window === 'undefined') return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | AI Markets`,
          text: `Check out this ${type} on AI Markets`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        // Clipboard API not available
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-0 sm:gap-2 p-0 sm:px-5 sm:py-3 bg-white hover:bg-neutral-50 text-neutral-700 text-sm sm:text-base font-semibold rounded-xl border border-neutral-200 transition-colors shadow-sm hover:shadow-md h-11 min-w-[44px] flex-1 sm:h-auto sm:w-auto sm:min-w-[auto] sm:flex-none whitespace-nowrap"
      aria-label={`Share ${type} profile`}
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m5.316 0C14.114 11.062 14 1.518 14 12c0 .482.114.938.316 1.342m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0-2.684a3 3 0 11-5.367-2.684 3 3 0 015.367 2.684zm-5.316 2.684a3 3 0 10-5.367-2.684 3 3 0 005.367 2.684z" />
      </svg>
      <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
    </button>
  )
}

