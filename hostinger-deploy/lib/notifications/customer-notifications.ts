/**
 * Customer Notification System
 * Sends notifications to customers when order intent status changes
 * Supports: Email (via Resend), WhatsApp (stub), Zalo (stub)
 */

interface OrderIntent {
  id: string
  customer_name: string
  customer_email: string
  status: 'pending' | 'confirmed' | 'declined' | 'fulfilled' | 'cancelled'
  products?: {
    name: string
  }
  vendors?: {
    name: string
  }
  market_days?: {
    market_date: string
    location_name: string
  }
  intent_type?: 'pickup' | 'delivery'
  quantity?: number
}

/**
 * Notify customer of order intent status change
 * Non-blocking: failures don't affect order status updates
 */
export async function notifyCustomerStatusChange(
  orderIntent: OrderIntent,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  // Only notify on meaningful status changes
  if (oldStatus === newStatus) {
    return true
  }

  // Don't notify for initial pending status (only on changes)
  if (oldStatus === 'pending' && newStatus === 'pending') {
    return true
  }

  try {
    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL not configured')
      return false
    }

    // Use anon key for client-side calls (Edge Functions handle auth internally)
    const authKey = typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!authKey) {
      console.error('Supabase auth key not configured')
      return false
    }

    // Send email notification via Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/send-customer-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authKey}`,
      },
      body: JSON.stringify({
        customer: {
          name: orderIntent.customer_name,
          email: orderIntent.customer_email,
        },
        orderIntent: {
          id: orderIntent.id,
          productName: orderIntent.products?.name || 'Product',
          vendorName: orderIntent.vendors?.name || 'Vendor',
          quantity: orderIntent.quantity || 1,
          intentType: orderIntent.intent_type || 'pickup',
          marketDate: orderIntent.market_days?.market_date,
          marketLocation: orderIntent.market_days?.location_name,
          oldStatus,
          newStatus,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Customer email API returned ${response.status}: ${errorText}`)
    }

    return true
  } catch (error) {
    console.error('Failed to send customer notification:', error)
    // Don't fail the status update if notification fails
    return false
  }
}

/**
 * Send WhatsApp notification to customer (STUB)
 * TODO: Integrate with WhatsApp Business API (Meta)
 */
export async function sendCustomerWhatsApp(
  orderIntent: OrderIntent,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  try {
    // TODO: Implement WhatsApp Business API integration
    console.log(`[STUB] Would send WhatsApp to ${orderIntent.customer_email} for order ${orderIntent.id}`)
    return false // Stub returns false
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error)
    return false
  }
}

/**
 * Send Zalo notification to customer (STUB)
 * TODO: Integrate with Zalo Official Account API
 */
export async function sendCustomerZalo(
  orderIntent: OrderIntent,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  try {
    // TODO: Implement Zalo API integration
    console.log(`[STUB] Would send Zalo message for order ${orderIntent.id}`)
    return false // Stub returns false
  } catch (error) {
    console.error('Failed to send Zalo notification:', error)
    return false
  }
}

