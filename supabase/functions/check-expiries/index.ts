// Supabase Edge Function: Check Document Expiries
// Runs daily to find documents expiring in 30, 15, or 7 days and sends notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 1. Find documents expiring in 30, 15, or 7 days that haven't had a reminder sent
        const { data: expiringDocs, error: fetchError } = await supabase
            .from('vendor_documents')
            .select('*, vendors(name, contact_email)')
            .not('expiry_date', 'is', null)
            .eq('renewal_reminder_sent', false)

        if (fetchError) throw fetchError

        const results = []

        for (const doc of expiringDocs) {
            const expiryDate = new Date(doc.expiry_date)
            const now = new Date()
            const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24))

            if (diffDays <= 30 && diffDays > 0) {
                // 2. Trigger Notification (Generic call to existing email function)
                // In a real app, you'd call your send-vendor-email function or use a messaging service
                console.log(`Sending reminder to ${doc.vendors.name} for ${doc.name} (Expires in ${diffDays} days)`)

                // Mark as reminder sent (or track levels of reminders)
                await supabase
                    .from('vendor_documents')
                    .update({ renewal_reminder_sent: true })
                    .eq('id', doc.id)

                results.push({ id: doc.id, vendor: doc.vendors.name, status: 'notified' })
            }
        }

        return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error('Error checking expiries:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
