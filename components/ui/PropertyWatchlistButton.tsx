'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleWatchlist, getWatchlistStatus, getWatchlistCount } from '@/lib/actions/engagements'
import Toast, { ToastType } from './Toast'

interface PropertyWatchlistButtonProps {
  propertyId: string
  initialWatching?: boolean
  initialCount?: number
  className?: string
  minimal?: boolean
}

export default function PropertyWatchlistButton({
  propertyId,
  initialWatching,
  initialCount,
  className,
  minimal = false,
}: PropertyWatchlistButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [watching, setWatching] = useState(initialWatching ?? false)
  const [count, setCount] = useState(initialCount ?? 0)
  const [loaded, setLoaded] = useState(initialWatching !== undefined && initialCount !== undefined)
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  useEffect(() => {
    if (loaded) return
    Promise.all([
      getWatchlistStatus(propertyId),
      getWatchlistCount(propertyId),
    ]).then(([s, c]) => {
      setWatching(s)
      setCount(c)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [propertyId, loaded])

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
    const newWatching = !watching
    const delta = newWatching ? 1 : -1

    // Optimistic update
    setWatching(newWatching)
    setCount(prev => Math.max(0, prev + delta))

    if (newWatching && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }

    startTransition(async () => {
      try {
        await toggleWatchlist(propertyId)
        if (newWatching) {
          setToast({ message: '👀 Added to your watchlist!', type: 'success', visible: true })
        }
      } catch (err: any) {
        // Revert
        setWatching(!newWatching)
        setCount(prev => Math.max(0, prev - delta))
        if (err?.message === 'Unauthorized') {
          router.push(`/auth/login?next=${encodeURIComponent(currentPath)}`)
        }
      }
    })
  }

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={isPending || !loaded}
        aria-label={watching ? 'Remove from watchlist' : 'Keep an eye on this property'}
        className={cn(
          'flex items-center gap-2 font-bold transition-all duration-200 active:scale-95 disabled:opacity-60',
          minimal
            ? 'p-2 rounded-full hover:bg-neutral-100'
            : 'px-4 py-2.5 rounded-2xl border text-sm',
          watching
            ? 'bg-neutral-900 border-neutral-900 text-white shadow-[0_0_12px_rgba(0,0,0,0.15)]'
            : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900',
          className
        )}
      >
        {watching ? (
          <Eye className={cn('transition-all duration-200 scale-110', minimal ? 'w-5 h-5' : 'w-4 h-4')} />
        ) : (
          <EyeOff className={cn('text-neutral-400 transition-all duration-200', minimal ? 'w-5 h-5' : 'w-4 h-4')} />
        )}
        {!minimal && (
          <span>{watching ? 'Watching' : 'Keep an Eye On It'}</span>
        )}
        {!minimal && count > 0 && (
          <span className={cn(
            'text-xs font-black tabular-nums',
            watching ? 'text-white/80' : 'text-neutral-400'
          )}>
            {count}
          </span>
        )}
      </button>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        duration={3000}
      />
    </>
  )
}
