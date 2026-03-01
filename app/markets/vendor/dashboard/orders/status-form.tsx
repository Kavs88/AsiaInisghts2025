'use client'

import { useState, useTransition } from 'react'

interface Props {
  orderId: string
  nextStatus: string
  action: (orderId: string, status: any) => Promise<{ error?: string; success?: boolean }>
}

const NEXT_LABEL: Record<string, string> = {
  contacted: 'Mark Contacted',
  confirmed: 'Mark Confirmed',
  fulfilled:  'Mark Fulfilled',
}

export default function OrderStatusForm({ orderId, nextStatus, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await action(orderId, nextStatus as any)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs font-bold text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        {isPending ? 'Updating...' : (NEXT_LABEL[nextStatus] ?? `→ ${nextStatus}`)}
      </button>
      {error && (
        <span className="text-[11px] font-medium text-red-600 leading-tight">{error}</span>
      )}
    </div>
  )
}
