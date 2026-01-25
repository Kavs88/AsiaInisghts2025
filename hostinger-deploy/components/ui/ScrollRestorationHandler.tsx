'use client'

import { useEffect } from 'react'

/**
 * Prevents automatic scroll restoration on page load
 * This fixes the issue where pages load in the middle and then scroll to top
 */
export default function ScrollRestorationHandler() {
  useEffect(() => {
    // Disable automatic scroll restoration to prevent scroll jump on page load
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  return null
}


