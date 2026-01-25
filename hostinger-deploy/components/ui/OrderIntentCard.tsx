'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updateOrderIntentStatus } from '@/lib/supabase/queries'
import Toast, { ToastType } from './Toast'

interface OrderIntentCardProps {
  intent: {
    id: string
    product_id: string
    market_day_id: string
    intent_type: 'pickup' | 'delivery'
    quantity: number
    customer_name: string
    customer_email: string
    customer_notes?: string | null
    status: 'pending' | 'confirmed' | 'declined' | 'fulfilled' | 'cancelled'
    created_at: string
    updated_at?: string
    products?: {
      id: string
      name: string
      slug: string
      image_urls?: string[]
    }
    market_days?: {
      id: string
      market_date: string
      location_name: string
    }
  }
  vendorId: string
  onStatusUpdate?: () => void
}

export default function OrderIntentCard({ intent, vendorId, onStatusUpdate }: OrderIntentCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  })

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    declined: 'bg-red-100 text-red-800 border-red-200',
    fulfilled: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  }

  const handleStatusUpdate = async (newStatus: 'confirmed' | 'declined' | 'fulfilled') => {
    setIsUpdating(true)
    setToast({ message: '', type: 'info', visible: false })

    try {
      await updateOrderIntentStatus(intent.id, newStatus)
      setToast({
        message: `Order intent ${newStatus} successfully`,
        type: 'success',
        visible: true,
      })

      // Refresh the order intents list
      if (onStatusUpdate) {
        setTimeout(() => {
          onStatusUpdate()
        }, 500)
      }
    } catch (error: any) {
      console.error('Error updating order intent status:', error)
      setToast({
        message: error.message || 'Failed to update status. Please try again.',
        type: 'error',
        visible: true,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const product = intent.products
  const canConfirm = intent.status === 'pending'
  const canDecline = intent.status === 'pending' || intent.status === 'confirmed'
  const canFulfill = intent.status === 'confirmed'

  return (
    <>
      <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        {product?.image_urls && product.image_urls.length > 0 && (
          <div className="relative w-16 h-16 flex-shrink-0 bg-neutral-200 rounded-lg overflow-hidden">
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-900">{product?.name || 'Product'}</h4>
              <p className="text-sm text-neutral-600">
                Quantity: {intent.quantity} • {intent.intent_type === 'pickup' ? 'Pickup' : 'Delivery'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[intent.status] || 'bg-neutral-100 text-neutral-800 border-neutral-200'}`}
            >
              {intent.status.charAt(0).toUpperCase() + intent.status.slice(1)}
            </span>
          </div>
          <div className="text-sm text-neutral-600 space-y-1 mb-3">
            <p>
              <span className="font-medium">Customer:</span> {intent.customer_name}
            </p>
            <p>
              <span className="font-medium">Email:</span>{' '}
              <a
                href={`mailto:${intent.customer_email}`}
                className="text-primary-600 hover:underline"
              >
                {intent.customer_email}
              </a>
            </p>
            {intent.customer_notes && (
              <p>
                <span className="font-medium">Notes:</span> {intent.customer_notes}
              </p>
            )}
            <p className="text-xs text-neutral-500 mt-2">
              Submitted: {new Date(intent.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {intent.updated_at && intent.updated_at !== intent.created_at && (
                <> • Updated: {new Date(intent.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          {(canConfirm || canDecline || canFulfill) && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-200">
              {canConfirm && (
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isUpdating ? 'Updating...' : 'Confirm'}
                </button>
              )}
              {canDecline && (
                <button
                  onClick={() => handleStatusUpdate('declined')}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {isUpdating ? 'Updating...' : 'Decline'}
                </button>
              )}
              {canFulfill && (
                <button
                  onClick={() => handleStatusUpdate('fulfilled')}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {isUpdating ? 'Updating...' : 'Mark as Fulfilled'}
                </button>
              )}
            </div>
          )}

          {/* Status message for terminal states */}
          {(intent.status === 'declined' || intent.status === 'fulfilled' || intent.status === 'cancelled') && (
            <p className="text-xs text-neutral-500 mt-2 italic">
              {intent.status === 'declined' && 'This order intent has been declined.'}
              {intent.status === 'fulfilled' && 'This order intent has been fulfilled.'}
              {intent.status === 'cancelled' && 'This order intent has been cancelled.'}
            </p>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </>
  )
}





