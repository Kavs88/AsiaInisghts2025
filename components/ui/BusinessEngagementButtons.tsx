'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleEngagement, getEngagementStatus, getEngagementCounts } from '@/lib/actions/engagements'
import Toast, { ToastType } from './Toast'

interface BusinessEngagementButtonsProps {
  businessId: string
  initialStatus?: { isRecommended: boolean; isRegular: boolean }
  initialCounts?: { recommend: number; regular: number }
  className?: string
}

export default function BusinessEngagementButtons({
  businessId,
  initialStatus,
  initialCounts,
  className,
}: BusinessEngagementButtonsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [status, setStatus] = useState(
    initialStatus ?? { isRecommended: false, isRegular: false }
  )
  const [counts, setCounts] = useState(
    initialCounts ?? { recommend: 0, regular: 0 }
  )
  const [loaded, setLoaded] = useState(!!initialStatus && !!initialCounts)
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  // Fetch status + counts client-side when not provided by server
  useEffect(() => {
    if (loaded) return
    Promise.all([
      getEngagementStatus(businessId),
      getEngagementCounts(businessId),
    ]).then(([s, c]) => {
      setStatus(s)
      setCounts(c)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [businessId, loaded])

  function showToast(message: string, type: ToastType = 'success') {
    setToast({ message, type, visible: true })
  }

  function handleToggle(type: 'recommend' | 'regular') {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

      // Optimistic update
      const wasActive = type === 'recommend' ? status.isRecommended : status.isRegular
      const delta = wasActive ? -1 : 1

      setStatus(prev => ({
        ...prev,
        isRecommended: type === 'recommend' ? !prev.isRecommended : prev.isRecommended,
        isRegular: type === 'regular' ? !prev.isRegular : prev.isRegular,
      }))
      setCounts(prev => ({
        ...prev,
        [type]: Math.max(0, prev[type] + delta),
      }))

      if (!wasActive && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50)
      }

      startTransition(async () => {
        try {
          await toggleEngagement(businessId, type)
          if (!wasActive) {
            showToast(
              type === 'recommend' ? '✅ Recommendation added!' : '⭐ Marked as a Regular!',
              'success'
            )
          }
        } catch (err: any) {
          // Revert on error
          setStatus(prev => ({
            ...prev,
            isRecommended: type === 'recommend' ? !prev.isRecommended : prev.isRecommended,
            isRegular: type === 'regular' ? !prev.isRegular : prev.isRegular,
          }))
          setCounts(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] - delta),
          }))
          if (err?.message === 'Unauthorized') {
            router.push(`/auth/login?next=${encodeURIComponent(currentPath)}`)
          }
        }
      })
    }
  }

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        {/* Recommend Button */}
        <button
          onClick={handleToggle('recommend')}
          disabled={isPending || !loaded}
          aria-label={status.isRecommended ? 'Remove recommendation' : 'Recommend this business'}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-60',
            status.isRecommended
              ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-amber-200 hover:text-amber-600 hover:bg-amber-50/50'
          )}
        >
          <Star
            className={cn(
              'w-4 h-4 transition-all duration-200',
              status.isRecommended ? 'fill-amber-500 text-amber-500 scale-110' : 'text-neutral-400'
            )}
          />
          <span>Recommend</span>
          {counts.recommend > 0 && (
            <span className={cn(
              'text-xs font-black tabular-nums',
              status.isRecommended ? 'text-amber-600' : 'text-neutral-400'
            )}>
              {counts.recommend}
            </span>
          )}
        </button>

        {/* Regular Button */}
        <button
          onClick={handleToggle('regular')}
          disabled={isPending || !loaded}
          aria-label={status.isRegular ? "Remove 'I'm a Regular'" : "Mark as a Regular"}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-60',
            status.isRegular
              ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-[0_0_12px_rgba(13,148,136,0.15)]'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50/50'
          )}
        >
          <Coffee
            className={cn(
              'w-4 h-4 transition-all duration-200',
              status.isRegular ? 'text-primary-600 scale-110' : 'text-neutral-400'
            )}
          />
          <span>I&apos;m a Regular</span>
          {counts.regular > 0 && (
            <span className={cn(
              'text-xs font-black tabular-nums',
              status.isRegular ? 'text-primary-600' : 'text-neutral-400'
            )}>
              {counts.regular}
            </span>
          )}
        </button>
      </div>

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
