
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProperties() {
    console.log('Checking Properties Table...')

    // Count total properties
    const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

    if (error) {
        console.error('Error counting properties:', error)
        return
    }

    console.log(`Total Properties: ${count}`)

    // Check specifically for type='villa'
    const { count: villaCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'villa')

    console.log(`Villa Properties: ${villaCount}`)

    // List distinct types
    const { data: types } = await supabase
        .from('properties')
        .select('type')

    // @ts-ignore
    const distinctTypes = [...new Set(types?.map(t => t.type))]
    console.log('Existing Types:', distinctTypes)
}

checkProperties()
