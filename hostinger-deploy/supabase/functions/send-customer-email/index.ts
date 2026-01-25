// Supabase Edge Function: Send Customer Email Notification
// Sends email to customer when order intent status changes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

interface RequestBody {
  customer: {
    name: string
    email: string
  }
  orderIntent: {
    id: string
    productName: string
    vendorName: string
    quantity: number
    intentType: 'pickup' | 'delivery'
    marketDate?: string
    marketLocation?: string
    oldStatus: string
    newStatus: string
  }
}

serve(async (req) => {
  try {
    const { customer, orderIntent }: RequestBody = await req.json()

    // Validate required fields
    if (!customer?.email || !orderIntent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
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

    // Status messages
    const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
      confirmed: {
        subject: `Order Confirmed: ${orderIntent.productName}`,
        message: 'Your order has been confirmed by the vendor!',
        color: '#16a34a', // green
      },
      declined: {
        subject: `Order Update: ${orderIntent.productName}`,
        message: 'Unfortunately, your order request could not be fulfilled at this time.',
        color: '#dc2626', // red
      },
      fulfilled: {
        subject: `Order Fulfilled: ${orderIntent.productName}`,
        message: 'Great news! Your order has been fulfilled.',
        color: '#16a34a', // green
      },
    }

    const statusInfo = statusMessages[orderIntent.newStatus] || {
      subject: `Order Status Update: ${orderIntent.productName}`,
      message: `Your order status has been updated to ${orderIntent.newStatus}.`,
      color: '#8c52ff', // purple
    }

    const intentTypeLabel = orderIntent.intentType === 'pickup' ? 'Market Pickup' : 'Delivery'
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8c52ff 0%, #7a3df0 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${statusInfo.subject}</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 16px 0; font-size: 16px;">Hello <strong>${customer.name}</strong>,</p>
            <p style="margin: 0 0 16px 0; font-size: 16px;">${statusInfo.message}</p>
          </div>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #111827;">Order Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 140px;">Product:</td>
                <td style="padding: 8px 0; color: #111827;">${orderIntent.productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Vendor:</td>
                <td style="padding: 8px 0; color: #111827;">${orderIntent.vendorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Quantity:</td>
                <td style="padding: 8px 0; color: #111827;">${orderIntent.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Type:</td>
                <td style="padding: 8px 0; color: #111827;">${intentTypeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Status:</td>
                <td style="padding: 8px 0; color: ${statusInfo.color}; font-weight: 600;">${orderIntent.newStatus.charAt(0).toUpperCase() + orderIntent.newStatus.slice(1)}</td>
              </tr>
              ${orderIntent.marketDate ? `
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Market Date:</td>
                <td style="padding: 8px 0; color: #111827;">${marketDateFormatted}</td>
              </tr>
              ` : ''}
              ${orderIntent.marketLocation ? `
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Location:</td>
                <td style="padding: 8px 0; color: #111827;">${orderIntent.marketLocation}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${orderIntent.newStatus === 'confirmed' ? `
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #15803d;">
              <strong>Next Steps:</strong> ${orderIntent.intentType === 'pickup' ? `Please visit the market on ${marketDateFormatted} to pick up your order.` : 'The vendor will contact you about delivery arrangements.'}
            </p>
          </div>
          ` : ''}

          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; margin-top: 30px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              This is an automated notification from AI Markets.
            </p>
          </div>
        </body>
      </html>
    `

    const textContent = `
${statusInfo.subject}

Hello ${customer.name},

${statusInfo.message}

Order Details:
- Product: ${orderIntent.productName}
- Vendor: ${orderIntent.vendorName}
- Quantity: ${orderIntent.quantity}
- Type: ${intentTypeLabel}
- Status: ${orderIntent.newStatus.charAt(0).toUpperCase() + orderIntent.newStatus.slice(1)}
${orderIntent.marketDate ? `- Market Date: ${marketDateFormatted}` : ''}
${orderIntent.marketLocation ? `- Location: ${orderIntent.marketLocation}` : ''}

${orderIntent.newStatus === 'confirmed' ? `Next Steps: ${orderIntent.intentType === 'pickup' ? `Please visit the market on ${marketDateFormatted} to pick up your order.` : 'The vendor will contact you about delivery arrangements.'}` : ''}

---
This is an automated notification from AI Markets.
    `.trim()

    // Send email via Resend API
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AI Markets <notifications@aimarkets.com>', // Update with your domain
          to: customer.email,
          subject: statusInfo.subject,
          html: htmlContent,
          text: textContent,
        }),
      })

      if (!resendResponse.ok) {
        const error = await resendResponse.text()
        throw new Error(`Resend API error: ${error}`)
      }

      const result = await resendResponse.json()
      return new Response(
        JSON.stringify({ success: true, messageId: result.id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      // Fallback: Log email (for development/testing)
      console.log('Email notification (RESEND_API_KEY not set):', {
        to: customer.email,
        subject: statusInfo.subject,
        text: textContent,
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (RESEND_API_KEY not configured)' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})





