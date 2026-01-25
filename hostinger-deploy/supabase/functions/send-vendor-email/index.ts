// Supabase Edge Function: Send Vendor Email Notification
// Sends email to vendor when new order intent is created

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

interface RequestBody {
  vendor: {
    id: string
    name: string
    email: string
  }
  orderIntent: {
    id: string
    productName: string
    customerName: string
    customerEmail: string
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
    if (!vendor?.email || !orderIntent) {
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

    // Build email content
    const subject = `New Order Intent: ${orderIntent.productName}`
    const intentTypeLabel = orderIntent.intentType === 'pickup' ? 'Market Pickup' : 'Delivery'
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Order Intent</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 16px 0; font-size: 16px;">Hello <strong>${vendor.name}</strong>,</p>
            <p style="margin: 0 0 16px 0; font-size: 16px;">You have received a new order intent for your product.</p>
          </div>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #111827;">Order Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 140px;">Product:</td>
                <td style="padding: 8px 0; color: #111827;">${orderIntent.productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Quantity:</td>
                <td style="padding: 8px 0; color: #111827;">${orderIntent.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Type:</td>
                <td style="padding: 8px 0; color: #111827;">${intentTypeLabel}</td>
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

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #111827;">Customer Information</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 140px;">Name:</td>
                <td style="padding: 8px 0; color: #111827;">${orderIntent.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0; color: #111827;">
                  <a href="mailto:${orderIntent.customerEmail}" style="color: #0ea5e9; text-decoration: none;">${orderIntent.customerEmail}</a>
                </td>
              </tr>
              ${orderIntent.customerNotes ? `
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #6b7280; vertical-align: top;">Notes:</td>
                <td style="padding: 8px 0; color: #111827;">${orderIntent.customerNotes}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #0369a1;">
              <strong>Next Steps:</strong> Log in to your vendor dashboard to view and manage this order intent.
            </p>
          </div>

          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; margin-top: 30px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              This is an automated notification from Sunday Market.
            </p>
          </div>
        </body>
      </html>
    `

    const textContent = `
New Order Intent

Hello ${vendor.name},

You have received a new order intent for your product.

Order Details:
- Product: ${orderIntent.productName}
- Quantity: ${orderIntent.quantity}
- Type: ${intentTypeLabel}
${orderIntent.marketDate ? `- Market Date: ${marketDateFormatted}` : ''}
${orderIntent.marketLocation ? `- Location: ${orderIntent.marketLocation}` : ''}

Customer Information:
- Name: ${orderIntent.customerName}
- Email: ${orderIntent.customerEmail}
${orderIntent.customerNotes ? `- Notes: ${orderIntent.customerNotes}` : ''}

Next Steps: Log in to your vendor dashboard to view and manage this order intent.

---
This is an automated notification from Sunday Market.
    `.trim()

    // Send email via Resend API (or your email service)
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sunday Market <notifications@sundaymarket.com>', // Update with your domain
          to: vendor.email,
          subject: subject,
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
        to: vendor.email,
        subject: subject,
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





