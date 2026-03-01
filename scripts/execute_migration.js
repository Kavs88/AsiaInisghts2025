import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '029_decouple_business_ownership.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('--- EXECUTING MIGRATION ---')

    // Use the RPC call if available, otherwise we might need to split the SQL
    // and run it. However, Supabase service role can run SQL snippets via RPC
    // or we can just use the 'exec_sql' RPC if they have it.
    // Since I don't know the exact RPCs, I'll try to run the critical UPDATEs
    // and then the ALTERS.

    // For RLS and ALTERs, we might need a different approach if RPC is not available.
    // I will try to run the UPDATEs first as they are data fixes.

    console.log('Running Data Fixes...')
    const { error: err1 } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (err1) {
        console.log('RPC exec_sql failed, attempting direct data updates via API...')

        // Fallback: Just do the data fixes via the API if the schema change fails
        const { error: err2 } = await supabase.from('entities').update({ owner_id: null }).ilike('slug', '%madam-lan%')
        if (err2) console.error('Entities update failed:', err2)
        else console.log('Entities update success.')

        const { error: err3 } = await supabase.from('businesses').update({ owner_id: null }).ilike('slug', '%madam-lan%')
        if (err3) console.error('Businesses update failed:', err3)
        else console.log('Businesses update success.')

        console.log('\nNOTE: Schema changes and RLS policies might require manual execution in the Supabase Dashboard if the CLI is not configured.')
    } else {
        console.log('Migration executed successfully via RPC.')
    }
}

run()
