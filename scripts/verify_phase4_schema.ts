// @ts-nocheck - Verification script, not part of build
import { createClient } from '@supabase/supabase-js'
// @ts-ignore
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySchema() {
    console.log('Verifying Phase 4 Schema Compatibility...')

    // 1. Check if 'events' table exists and has 'host_id' AND 'venue_id'
    const { data: events, error } = await supabase
        .from('events')
        .select('id, host_id, host_type, vendor_id, venue_id, venue_type')
        .limit(1)

    if (error) {
        console.error('❌ Error querying events table:', error.message)
        console.log('   (This likely means the table structure is outdated or RLS blocks access)')
        return false
    }

    // Check if we got data (even if null, column existence is key, but SELECT * doesn't throw on missing column in PostgREST unless requested?)
    // Actually, requesting 'host_id' explicitely WILL error if column doesn't exist.
    console.log('✅ Events table has compatible columns (host_id, vendor_id, venue_id)')

    if (events && events.length > 0) {
        console.log('✅ Events data found:', events.length, 'row(s)')
        console.log('   Sample:', events[0])
    } else {
        console.log('⚠️ Events table is empty. Seeding might be needed.')
    }

    return true
}

verifySchema().then((passed) => {
    if (passed) {
        console.log('\nSUCCESS: Schema appears correct.')
        process.exit(0)
    } else {
        console.log('\nFAILURE: Schema verification failed.')
        process.exit(1)
    }
})
