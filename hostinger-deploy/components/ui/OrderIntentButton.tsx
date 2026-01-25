'use client'

import { useState } from 'react'
import Modal from './Modal'
import OrderIntentForm from './OrderIntentForm'

interface OrderIntentButtonProps {
  productId: string
  vendorId: string
  marketDayId: string | null
  intentType: 'pickup' | 'delivery'
  productName: string
  isAvailable: boolean
  stockQuantity: number
  requiresPreorder: boolean
}

export default function OrderIntentButton({
  productId,
  vendorId,
  marketDayId,
  intentType,
  productName,
  isAvailable,
  stockQuantity,
  requiresPreorder,
}: OrderIntentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Don't show button if no market day available
  if (!marketDayId) {
    return null
  }

  // Don't show button if out of stock and not preorder
  if (!isAvailable || (stockQuantity === 0 && !requiresPreorder)) {
    return null
  }

  const buttonText = intentType === 'pickup' ? 'Reserve for Sunday Pickup' : 'Request Delivery'
  const modalTitle = intentType === 'pickup' ? 'Reserve for Market Pickup' : 'Request Delivery'

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isAvailable || (stockQuantity === 0 && !requiresPreorder)}
      >
        {buttonText}
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        size="md"
      >
        <OrderIntentForm
          productId={productId}
          vendorId={vendorId}
          marketDayId={marketDayId}
          intentType={intentType}
          productName={productName}
          onSuccess={() => {
            // Modal will close automatically after success
          }}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  )
}





