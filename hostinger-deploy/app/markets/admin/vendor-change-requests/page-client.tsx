'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getPendingVendorChangeRequests, 
  approveVendorChangeRequest, 
  rejectVendorChangeRequest 
} from '@/app/actions/vendor-change-requests'

interface VendorChangeRequest {
  id: string
  vendor_id: string
  requested_by_user_id: string
  requested_changes: Record<string, any>
  status: string
  admin_notes: string | null
  reviewed_by_user_id: string | null
  reviewed_at: string | null
  created_at: string
  vendors: {
    id: string
    name: string
    slug: string
    user_id: string
  }
  requested_by: {
    id: string
    email: string
    full_name: string | null
  }
}

export default function VendorChangeRequestsClient() {
  const router = useRouter()
  const [requests, setRequests] = useState<VendorChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})
  const [showRejectForm, setShowRejectForm] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getPendingVendorChangeRequests()
      if (result.success && result.data) {
        setRequests(result.data as VendorChangeRequest[])
      } else {
        setError(result.error || 'Failed to load requests')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this change request? The changes will be applied immediately.')) {
      return
    }

    setProcessingId(requestId)
    try {
      const result = await approveVendorChangeRequest(requestId)
      if (result.success) {
        // Reload requests
        await loadRequests()
      } else {
        alert(result.error || 'Failed to approve request')
      }
    } catch (err: any) {
      alert(err.message || 'An unexpected error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    const note = rejectNote[requestId]?.trim()
    if (!note) {
      alert('Please provide a reason for rejection')
      return
    }

    if (!confirm('Are you sure you want to reject this change request?')) {
      return
    }

    setProcessingId(requestId)
    try {
      const result = await rejectVendorChangeRequest(requestId, note)
      if (result.success) {
        // Clear reject form
        setRejectNote(prev => {
          const updated = { ...prev }
          delete updated[requestId]
          return updated
        })
        setShowRejectForm(prev => {
          const updated = { ...prev }
          delete updated[requestId]
          return updated
        })
        // Reload requests
        await loadRequests()
      } else {
        alert(result.error || 'Failed to reject request')
      }
    } catch (err: any) {
      alert(err.message || 'An unexpected error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const formatChangeValue = (value: any): string => {
    if (value === null || value === undefined) return '(empty)'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-error-900 mb-2">Error</h2>
        <p className="text-error-800 mb-4">{error}</p>
        <button
          onClick={loadRequests}
          className="px-4 py-2 bg-error-600 text-white rounded-xl hover:bg-error-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">No Pending Requests</h3>
        <p className="text-neutral-600">All vendor change requests have been processed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          {/* Request Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-1">
                {request.vendors.name}
              </h3>
              <p className="text-sm text-neutral-600">
                Requested by {request.requested_by.full_name || request.requested_by.email}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Submitted {new Date(request.created_at).toLocaleString()}
              </p>
            </div>
            <Link
              href={`/admin/vendors/${request.vendor_id}/edit`}
              className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors"
            >
              View Vendor
            </Link>
          </div>

          {/* Requested Changes */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Requested Changes:</h4>
            <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
              {Object.entries(request.requested_changes).map(([key, value]) => (
                <div key={key} className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-700 capitalize mb-1">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-neutral-600 bg-white rounded-lg px-3 py-2 border border-neutral-200">
                      {formatChangeValue(value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
            <button
              onClick={() => handleApprove(request.id)}
              disabled={processingId === request.id}
              className="px-6 py-2 bg-success-600 text-white font-medium rounded-xl hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processingId === request.id ? 'Processing...' : 'Approve'}
            </button>
            
            {!showRejectForm[request.id] ? (
              <button
                onClick={() => setShowRejectForm(prev => ({ ...prev, [request.id]: true }))}
                disabled={processingId === request.id}
                className="px-6 py-2 bg-error-600 text-white font-medium rounded-xl hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reject
              </button>
            ) : (
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Reason for rejection (required)"
                  value={rejectNote[request.id] || ''}
                  onChange={(e) => setRejectNote(prev => ({ ...prev, [request.id]: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-error-500 focus:border-error-500 outline-none"
                />
                <button
                  onClick={() => handleReject(request.id)}
                  disabled={processingId === request.id || !rejectNote[request.id]?.trim()}
                  className="px-6 py-2 bg-error-600 text-white font-medium rounded-xl hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingId === request.id ? 'Processing...' : 'Confirm Reject'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(prev => {
                      const updated = { ...prev }
                      delete updated[request.id]
                      return updated
                    })
                    setRejectNote(prev => {
                      const updated = { ...prev }
                      delete updated[request.id]
                      return updated
                    })
                  }}
                  className="px-4 py-2 text-neutral-700 font-medium border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

