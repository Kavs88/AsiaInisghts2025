'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RSVPModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  marketDayId?: string
  currentStatus?: 'going' | 'interested' | 'not_going' | null
  currentNotes?: string | null
  onSuccess: () => void
}

export default function RSVPModal({
  isOpen,
  onClose,
  eventId,
  marketDayId,
  currentStatus,
  currentNotes,
  onSuccess,
}: RSVPModalProps) {
  const [status, setStatus] = useState<'going' | 'interested'>(
    currentStatus === 'going' ? 'going' : 
    currentStatus === 'interested' ? 'interested' : 
    'going'
  )
  const [notes, setNotes] = useState(currentNotes || '')
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const [attendeeCount, setAttendeeCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!agreedToPolicy) {
      setError('Please agree to the cancellation policy')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Please sign in to RSVP')
        setLoading(false)
        return
      }

      const response = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          market_day_id: marketDayId,
          status,
          notes: notes.trim() || null,
          agreed_to_policy: agreedToPolicy,
          attendee_count: attendeeCount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update RSVP')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">RSVP to Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Selection - Only show if no current status or updating */}
          {!currentStatus && (
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Your RSVP Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('going')}
                  className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                    status === 'going'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  I'm Going
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('interested')}
                  className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                    status === 'interested'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  Interested
                </button>
              </div>
            </div>
          )}
          
          {/* Show current status if updating */}
          {currentStatus && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <p className="text-sm font-medium text-primary-900">
                Current Status: <span className="font-semibold capitalize">{currentStatus}</span>
              </p>
            </div>
          )}

          {/* Attendee Count (only for "going") */}
          {status === 'going' && (
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Number of Attendees
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAttendeeCount(Math.max(1, attendeeCount - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                  disabled={attendeeCount <= 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-lg font-semibold text-neutral-900 min-w-[3rem] text-center">
                  {attendeeCount}
                </span>
                <button
                  type="button"
                  onClick={() => setAttendeeCount(attendeeCount + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-neutral-900 mb-2">
              Notes (Optional)
            </label>
            <p className="text-xs text-neutral-500 mb-2">
              Dietary requirements, accessibility needs, or other information
            </p>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Vegan, Wheelchair access needed, etc."
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Policy Agreement */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                required
              />
              <span className="text-sm text-neutral-700">
                <span className="font-semibold">Cancellation Policy:</span> I understand that space is limited. 
                I will update my RSVP if I cannot attend.
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !agreedToPolicy}
              className="flex-1 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Confirm RSVP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

