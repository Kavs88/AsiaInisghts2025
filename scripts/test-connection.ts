
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
    console.log(`Testing connection to: ${supabaseUrl}`)

    const start = Date.now()
    const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true })

    const duration = Date.now() - start

    if (error) {
        console.error('❌ CONNECTION FAILED')
        console.error('Error:', error.message)
        console.error('Hint: The database might be paused, or keys are invalid.')
    } else {
        console.log('✅ CONNECTION SUCCESSFUL')
        console.log(`Response time: ${duration}ms`)
        console.log('Database is active and accepting requests via API Key.')
    }
}

testConnection()
