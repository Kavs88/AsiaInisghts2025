
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) { process.exit(1) }
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBusinesses() {
    console.log('🔍 Checking Businesses Table...')

    // 1. Check Businesses Table
    const { count: businessCount, error: busError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })

    console.log(`Table 'businesses' count: ${businessCount}`)
    if (busError) console.error('Error:', busError)

    // 2. Check Entities Table (Business Type)
    const { count: entityCount, error: entError } = await supabase
        .from('entities')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', 'business')

    console.log(`Table 'entities' (type=business) count: ${entityCount}`)
}

checkBusinesses()
