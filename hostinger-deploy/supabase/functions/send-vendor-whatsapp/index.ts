// Supabase Edge Function: Send Vendor WhatsApp Notification
// Supports WhatsApp Business Cloud API (Meta)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface RequestBody {
  vendor: {
    id: string
    name: string
    phone: string
  }
  orderIntent: {
    id: string
    productName: string
    customerName: string
    quantity: number
    intentType: 'pickup' | 'delivery'
    marketDate?: string
    marketLocation?: string
    customerNotes?: string | null
  }
}

serve(async (req) => {
  try {
    const { vendor, orderIntent }: RequestBody = await req.json()

    // Validate required fields
    if (!vendor?.phone || !orderIntent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Format phone number (ensure it's in international format)
    let phoneNumber = vendor.phone.trim()
    if (!phoneNumber.startsWith('+')) {
      // If no country code, assume it needs one (you may want to add country code detection)
      phoneNumber = `+${phoneNumber.replace(/^0+/, '')}`
    }

    // Format market date
    const marketDateFormatted = orderIntent.marketDate
      ? new Date(orderIntent.marketDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'the next market'

    // Build message content
    const intentTypeLabel = orderIntent.intentType === 'pickup' ? 'Market Pickup' : 'Delivery'
    const message = `🛒 New Order Intent: ${orderIntent.productName}

📦 Quantity: ${orderIntent.quantity}
📍 Type: ${intentTypeLabel}
${orderIntent.marketDate ? `📅 Market Date: ${marketDateFormatted}` : ''}
${orderIntent.marketLocation ? `🏪 Location: ${orderIntent.marketLocation}` : ''}

👤 Customer: ${orderIntent.customerName}
${orderIntent.customerNotes ? `📝 Notes: ${orderIntent.customerNotes}` : ''}

View details in your vendor dashboard.`

    // Use WhatsApp Business Cloud API (Meta)
    const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID')

    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_ID) {
      // Use WhatsApp Business Cloud API
      const metaUrl = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`
      
      const metaResponse = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber.replace(/^\+/, ''), // Meta API doesn't use + prefix
          type: 'text',
          text: { body: message },
        }),
      })

      if (!metaResponse.ok) {
        const errorText = await metaResponse.text()
        throw new Error(`WhatsApp Business API error: ${errorText}`)
      }

      const result = await metaResponse.json()
      console.log('WhatsApp sent via Meta:', result.messages[0]?.id)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.messages[0]?.id, 
          provider: 'meta' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // No API credentials configured - log and return error to trigger email fallback
    console.log('WhatsApp notification (no API keys configured):', {
      phone: phoneNumber,
      product: orderIntent.productName,
      customer: orderIntent.customerName,
      message: message,
    })

    return new Response(
      JSON.stringify({ 
        error: 'WhatsApp API not configured',
        message: 'WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_ID must be set in Supabase secrets'
      }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error sending WhatsApp:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send WhatsApp',
        details: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

