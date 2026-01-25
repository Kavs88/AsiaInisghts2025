/**
 * Vendor Notification System
 * Handles sending notifications to vendors when new order intents are created
 */

interface OrderIntent {
  id: string
  product_id: string
  market_day_id: string
  intent_type: 'pickup' | 'delivery'
  quantity: number
  customer_name: string
  customer_email: string
  customer_notes?: string | null
  products?: {
    name: string
  }
  market_days?: {
    market_date: string
    location_name: string
  }
}

interface Vendor {
  id: string
  name: string
  notification_channel: 'email' | 'whatsapp' | 'zalo' | null
  notification_target: string | null
  contact_email: string | null
}

/**
 * Main notification function - routes to appropriate channel
 */
export async function notifyVendor(vendor: Vendor, orderIntent: OrderIntent): Promise<boolean> {
  const channel = vendor.notification_channel || 'email'
  const target = vendor.notification_target || vendor.contact_email

  if (!target) {
    console.error(`No notification target for vendor ${vendor.id}`)
    return false
  }

  let success = false

  try {
    switch (channel) {
      case 'email':
        success = await sendEmail(vendor, orderIntent, target)
        break
      case 'whatsapp':
        success = await sendWhatsApp(vendor, orderIntent, target)
        break
      case 'zalo':
        success = await sendZalo(vendor, orderIntent, target)
        break
      default:
        // Fallback to email
        success = await sendEmail(vendor, orderIntent, target)
    }

    // If primary channel fails, fallback to email
    if (!success && channel !== 'email') {
      console.warn(`Primary notification channel (${channel}) failed, falling back to email`)
      const emailTarget = vendor.contact_email || target
      if (emailTarget) {
        success = await sendEmail(vendor, orderIntent, emailTarget)
      }
    }
  } catch (error) {
    console.error(`Error sending notification to vendor ${vendor.id}:`, error)
    // Try email fallback on any error
    if (channel !== 'email') {
      try {
        const emailTarget = vendor.contact_email || target
        if (emailTarget) {
          await sendEmail(vendor, orderIntent, emailTarget)
        }
      } catch (fallbackError) {
        console.error(`Email fallback also failed for vendor ${vendor.id}:`, fallbackError)
      }
    }
  }

  return success
}

/**
 * Send email notification via Supabase Edge Function
 */
async function sendEmail(vendor: Vendor, orderIntent: OrderIntent, email: string): Promise<boolean> {
  try {
    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL not configured')
      return false
    }

    // Use anon key for client-side calls (Edge Functions handle auth internally)
    // In production, this should ideally be called from a server action
    const authKey = typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!authKey) {
      console.error('Supabase auth key not configured')
      return false
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-vendor-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authKey}`,
      },
      body: JSON.stringify({
        vendor: {
          id: vendor.id,
          name: vendor.name,
          email: email,
        },
        orderIntent: {
          id: orderIntent.id,
          productName: orderIntent.products?.name || 'Product',
          customerName: orderIntent.customer_name,
          customerEmail: orderIntent.customer_email,
          quantity: orderIntent.quantity,
          intentType: orderIntent.intent_type,
          marketDate: orderIntent.market_days?.market_date,
          marketLocation: orderIntent.market_days?.location_name,
          customerNotes: orderIntent.customer_notes,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Email API returned ${response.status}: ${errorText}`)
    }

    return true
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return false
  }
}

/**
 * Send WhatsApp notification via Supabase Edge Function
 * TODO: Integrate with WhatsApp Business API
 */
async function sendWhatsApp(vendor: Vendor, orderIntent: OrderIntent, phoneNumber: string): Promise<boolean> {
  try {
    // TODO: Implement WhatsApp Business API integration
    // For now, this is a stub that will always fail and trigger email fallback
    console.log(`[STUB] Would send WhatsApp to ${phoneNumber} for vendor ${vendor.id}`)
    
    // Uncomment when WhatsApp integration is ready:
    /*
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-vendor-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        vendor: {
          id: vendor.id,
          name: vendor.name,
          phone: phoneNumber,
        },
        orderIntent: {
          id: orderIntent.id,
          productName: orderIntent.products?.name || 'Product',
          customerName: orderIntent.customer_name,
          quantity: orderIntent.quantity,
          intentType: orderIntent.intent_type,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API returned ${response.status}`)
    }

    return true
    */
    
    return false // Stub returns false to trigger fallback
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error)
    return false
  }
}

/**
 * Send Zalo notification via Supabase Edge Function
 * TODO: Integrate with Zalo API
 */
async function sendZalo(vendor: Vendor, orderIntent: OrderIntent, zaloId: string): Promise<boolean> {
  try {
    // TODO: Implement Zalo API integration
    // For now, this is a stub that will always fail and trigger email fallback
    console.log(`[STUB] Would send Zalo message to ${zaloId} for vendor ${vendor.id}`)
    
    // Uncomment when Zalo integration is ready:
    /*
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-vendor-zalo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        vendor: {
          id: vendor.id,
          name: vendor.name,
          zaloId: zaloId,
        },
        orderIntent: {
          id: orderIntent.id,
          productName: orderIntent.products?.name || 'Product',
          customerName: orderIntent.customer_name,
          quantity: orderIntent.quantity,
          intentType: orderIntent.intent_type,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Zalo API returned ${response.status}`)
    }

    return true
    */
    
    return false // Stub returns false to trigger fallback
  } catch (error) {
    console.error('Failed to send Zalo notification:', error)
    return false
  }
}

