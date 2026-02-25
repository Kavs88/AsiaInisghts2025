
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
    console.log('Testing Write Permissions with Anon Key...')

    const testProperty = {
        type: 'villa',
        property_type: 'rental',
        address: 'Test Address ' + Date.now(),
        price: 1000,
        bedrooms: 1,
        bathrooms: 1,
        capacity: 2,
        description: 'Test Description',
        images: [],
        availability: 'available',
        is_active: false // Keep inactive so it doesn't show up if it works
    }

    const { data, error } = await supabase
        .from('properties')
        .insert([testProperty])
        .select()

    if (error) {
        console.error('❌ Insert Failed:', error.message)
        console.error('Details:', error)
    } else {
        console.log('✅ Insert Successful! RLS allows Anon writes (or is disabled).')
        // Clean up
        if (data && data[0]) {
            await supabase.from('properties').delete().eq('id', data[0].id)
        }
    }
}

testInsert()
