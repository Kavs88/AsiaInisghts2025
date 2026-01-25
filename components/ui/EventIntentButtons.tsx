'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EventIntentButtonsProps {
  eventId: string
  className?: string
}

export default function EventIntentButtons({ eventId, className = '' }: EventIntentButtonsProps) {
  const [intents, setIntents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  // Load user's intents for this event
  useEffect(() => {
    if (!user) {
      setIntents([])
      return
    }

    const loadIntents = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/intent`)
        if (res.ok) {
          const data = await res.json()
          setIntents(data.intents || [])
        }
      } catch (error) {
        console.error('Error loading intents:', error)
      }
    }

    loadIntents()
  }, [user, eventId])

  const handleIntent = async (intentType: 'saved' | 'planning_to_attend') => {
    if (!user) {
      // Could redirect to login or show message
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent_type: intentType }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.action === 'added') {
          setIntents([...intents, intentType])
        } else {
          setIntents(intents.filter(i => i !== intentType))
        }
      }
    } catch (error) {
      console.error('Error updating intent:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null // Don't show buttons if not logged in
  }

  const isSaved = intents.includes('saved')
  const isPlanningToAttend = intents.includes('planning_to_attend')

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={() => handleIntent('saved')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
          isSaved
            ? 'bg-primary-50 border-primary-300 text-primary-700'
            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
        } disabled:opacity-50`}
        aria-label={isSaved ? 'Remove from saved' : 'Save event'}
      >
        <svg
          className={`w-4 h-4 ${isSaved ? 'fill-primary-600' : ''}`}
          fill={isSaved ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{isSaved ? 'Saved' : 'Save event'}</span>
      </button>

      <button
        onClick={() => handleIntent('planning_to_attend')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
          isPlanningToAttend
            ? 'bg-success-50 border-success-300 text-success-700'
            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
        } disabled:opacity-50`}
        aria-label={isPlanningToAttend ? 'Remove from planned' : 'Plan to attend'}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{isPlanningToAttend ? 'Planning to attend' : 'Plan to attend'}</span>
      </button>
    </div>
  )
}

