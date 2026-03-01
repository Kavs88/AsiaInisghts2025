'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import RSVPModal from './RSVPModal'

interface RSVPActionProps {
  eventId: string
  marketDayId?: string
  className?: string
}

interface RSVPData {
  status: 'going' | 'interested' | 'not_going' | null
  notes: string | null
  goingCount: number
  interestedCount: number
}

export default function RSVPAction({ eventId, marketDayId, className = '' }: RSVPActionProps) {
  const [user, setUser] = useState<any>(null)
  const [rsvpData, setRsvpData] = useState<RSVPData>({
    status: null,
    notes: null,
    goingCount: 0,
    interestedCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  // Load RSVP data
  useEffect(() => {
    const loadRSVP = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/events/${eventId}/rsvp?market_day_id=${marketDayId || ''}`)
        if (res.ok) {
          const data = await res.json()
          setRsvpData({
            status: data.status || null,
            notes: data.notes || null,
            goingCount: data.goingCount || 0,
            interestedCount: data.interestedCount || 0,
          })
        }
      } catch (error) {
        console.error('Error loading RSVP:', error)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadRSVP()
    }
  }, [eventId, marketDayId])

  const handleRSVPSuccess = (message = 'RSVP confirmed!') => {
    // Reload RSVP data
    const loadRSVP = async () => {
      const res = await fetch(`/api/events/${eventId}/rsvp?market_day_id=${marketDayId || ''}`)
      if (res.ok) {
        const data = await res.json()
        setRsvpData({
          status: data.status || null,
          notes: data.notes || null,
          goingCount: data.goingCount || 0,
          interestedCount: data.interestedCount || 0,
        })
      }
    }
    loadRSVP()
    // Show inline confirmation — clears after 3s
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleCancelRSVP = async () => {
    if (!user) return

    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          market_day_id: marketDayId,
        }),
      })

      if (res.ok) {
        handleRSVPSuccess('RSVP removed')
      }
    } catch (error) {
      console.error('Error canceling RSVP:', error)
    }
  }

  // Inline success confirmation strip
  const SuccessBanner = successMessage ? (
    <div className="mb-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-sm font-semibold text-green-800 animate-fade-up">
      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      {successMessage}
    </div>
  ) : null

  // Guest State (Not Logged In)
  if (!user) {
    return (
      <div className={`bg-white rounded-2xl border border-neutral-200 p-6 ${className}`}>
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Sign in to RSVP to this event</p>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Sign In to RSVP
          </a>
        </div>
      </div>
    )
  }

  // Loading State
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-neutral-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-10 bg-neutral-200 rounded"></div>
        </div>
      </div>
    )
  }

  // User Going State
  if (rsvpData.status === 'going') {
    return (
      <>
        <div className={`bg-white rounded-2xl border border-neutral-200 p-6 ${className}`}>
          {SuccessBanner}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-semibold text-neutral-900">You're Going</span>
            </div>
            {rsvpData.notes && (
              <p className="text-sm text-neutral-600 mt-2">Notes: {rsvpData.notes}</p>
            )}
          </div>

          <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm font-medium text-primary-900">
              {rsvpData.goingCount} {rsvpData.goingCount === 1 ? 'person' : 'people'} going
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Update RSVP
            </button>
            <button
              onClick={handleCancelRSVP}
              className="px-4 py-3 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <RSVPModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eventId={eventId}
          marketDayId={marketDayId}
          currentStatus="going"
          currentNotes={rsvpData.notes}
          onSuccess={handleRSVPSuccess}
        />
      </>
    )
  }

  // User Interested State
  if (rsvpData.status === 'interested') {
    return (
      <>
        <div className={`bg-white rounded-2xl border border-neutral-200 p-6 ${className}`}>
          {SuccessBanner}
          <div className="mb-4">
            <p className="text-sm text-neutral-600 mb-2">You're interested in this event</p>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm font-medium text-neutral-900">
                {rsvpData.goingCount} {rsvpData.goingCount === 1 ? 'person' : 'people'} going
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Count Me In
            </button>
            <button
              onClick={handleCancelRSVP}
              className="px-4 py-3 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        </div>

        <RSVPModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eventId={eventId}
          marketDayId={marketDayId}
          currentStatus="interested"
          currentNotes={rsvpData.notes}
          onSuccess={handleRSVPSuccess}
        />
      </>
    )
  }

  // User None State (No RSVP)
  return (
    <>
      <div className={`bg-white rounded-2xl border border-neutral-200 p-6 ${className}`}>
        {SuccessBanner}
        <div className="mb-4">
          {rsvpData.goingCount > 0 && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 mb-4">
              <p className="text-sm font-medium text-neutral-900">
                {rsvpData.goingCount} {rsvpData.goingCount === 1 ? 'person' : 'people'} going
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-lg"
        >
          I'm Going
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-3 px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Save for Later
        </button>
      </div>

      <RSVPModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        marketDayId={marketDayId}
        currentStatus={null}
        currentNotes={null}
        onSuccess={handleRSVPSuccess}
      />
    </>
  )
}


