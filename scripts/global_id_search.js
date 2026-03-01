import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

const samId = '3eaf883d-f14c-4545-9639-feae5412fc22'

async function search() {
    console.log('--- SEARCHING FOR ALL REFERENCES TO SAM ID ---')

    // Get all tables
    const { data: tables, error: tableError } = await supabase.rpc('exec_sql', {
        sql_query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    })

    if (tableError) {
        console.log('Falling back to manual search of key tables...')
        const keyTables = ['entities', 'businesses', 'vendors', 'properties', 'events', 'order_intents', 'reviews', 'profiles', 'users']
        for (const table of keyTables) {
            const { data, error } = await supabase.from(table).select('*')
            if (error) continue

            const matches = data.filter(row => JSON.stringify(row).includes(samId))
            if (matches.length > 0) {
                console.log(`Table: ${table} - Matches: ${matches.length}`)
                matches.forEach(m => console.log(`  - Name/Title/Slug: ${m.name || m.title || m.slug || m.id}`))
            }
        }
    } else {
        // If RPC worked, we could loop through all tables and columns,
        // but the manual list is probably safer for now.
    }
}

search()
