// Supabase Edge Function: Send Vendor Zalo Notification
// Integrates with Zalo Official Account API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface RequestBody {
  vendor: {
    id: string
    name: string
    zaloId: string
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
    if (!vendor?.zaloId || !orderIntent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get Zalo API credentials
    const ZALO_ACCESS_TOKEN = Deno.env.get('ZALO_ACCESS_TOKEN')
    const ZALO_OA_ID = Deno.env.get('ZALO_OA_ID')

    if (!ZALO_ACCESS_TOKEN || !ZALO_OA_ID) {
      console.log('Zalo notification (no API keys configured):', {
        zaloId: vendor.zaloId,
        product: orderIntent.productName,
        customer: orderIntent.customerName,
      })

      return new Response(
        JSON.stringify({ 
          error: 'Zalo API not configured',
          message: 'ZALO_ACCESS_TOKEN and ZALO_OA_ID must be set in Supabase secrets'
        }),
        { status: 501, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Format market date
    const marketDateFormatted = orderIntent.marketDate
      ? new Date(orderIntent.marketDate).toLocaleDateString('vi-VN', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'chợ tiếp theo'

    // Build Vietnamese message content
    const intentTypeLabel = orderIntent.intentType === 'pickup' ? 'Lấy tại chợ' : 'Giao hàng'
    const message = `🛒 Bạn có đơn hàng mới: ${orderIntent.productName}

📦 Số lượng: ${orderIntent.quantity}
📍 Loại: ${intentTypeLabel}
${orderIntent.marketDate ? `📅 Ngày chợ: ${marketDateFormatted}` : ''}
${orderIntent.marketLocation ? `🏪 Địa điểm: ${orderIntent.marketLocation}` : ''}

👤 Khách hàng: ${orderIntent.customerName}
${orderIntent.customerNotes ? `📝 Ghi chú: ${orderIntent.customerNotes}` : ''}

Vui lòng đăng nhập vào dashboard để xem chi tiết.`

    // Send message via Zalo Official Account API
    const zaloUrl = 'https://openapi.zalo.me/v2.0/oa/message'
    
    const zaloResponse = await fetch(zaloUrl, {
      method: 'POST',
      headers: {
        'access_token': ZALO_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: {
          user_id: vendor.zaloId,
        },
        message: {
          text: message,
        },
      }),
    })

    if (!zaloResponse.ok) {
      const errorText = await zaloResponse.text()
      console.error('Zalo API error response:', errorText)
      throw new Error(`Zalo API error: ${errorText}`)
    }

    const result = await zaloResponse.json()
    
    // Check for Zalo API error in response
    if (result.error !== 0) {
      throw new Error(`Zalo API returned error: ${result.message || 'Unknown error'}`)
    }

    console.log('Zalo message sent successfully:', {
      zaloId: vendor.zaloId,
      messageId: result.data?.message_id,
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.data?.message_id,
        provider: 'zalo'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error sending Zalo:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send Zalo',
        details: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

