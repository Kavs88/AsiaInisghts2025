
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDb() {
    console.log('Checking database state...')

    // Check tables
    const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')

    if (tableError) {
        // If we can't query info schema via client (often restricted), try basic query
        console.log('Could not query information_schema (expected with RLS/roles). Trying direct table access.')
    } else {
        console.log('Tables found:', tables?.map(t => t.table_name).join(', '))
    }

    // Check Entities
    const { count: entityCount, error: entityError } = await supabase
        .from('entities')
        .select('*', { count: 'exact', head: true })

    if (entityError) {
        console.error('Error querying entities:', entityError.message)
    } else {
        console.log('Entities count:', entityCount)
    }

    // Check Founder Tags
    const { count: tagCount, error: tagError } = await supabase
        .from('founder_tags')
        .select('*', { count: 'exact', head: true })

    if (tagError) {
        console.error('Error querying founder_tags:', tagError.message)
    } else {
        console.log('Founder Tags count:', tagCount)
    }
}

checkDb().catch(console.error)
