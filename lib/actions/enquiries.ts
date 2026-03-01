'use server'

import { createClient } from '@/lib/supabase/server'

export interface EnquiryFormData {
    propertyId: string
    propertyAddress: string
    name: string
    email: string
    phone?: string
    message: string
    moveInDate?: string
}

export async function submitEnquiry(data: EnquiryFormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await (supabase
        .from('property_enquiries') as any)
        .insert({
            property_id: data.propertyId,
            enquirer_id: user?.id || null,
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            message: data.message,
            move_in_date: data.moveInDate || null,
            status: 'new',
        })

    if (error) {
        console.error('Enquiry submission failed:', error)
        throw new Error('Failed to submit enquiry')
    }

    return { success: true }
}

export async function getMyEnquiries() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await (supabase
        .from('property_enquiries') as any)
        .select(`
            id,
            message,
            status,
            move_in_date,
            created_at,
            properties (
                id,
                address,
                type,
                images
            )
        `)
        .eq('enquirer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching enquiries:', error)
        return []
    }

    return data || []
}
