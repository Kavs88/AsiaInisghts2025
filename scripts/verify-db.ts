
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('Testing Supabase Connection...')
    try {
        const { data, error, count } = await supabase
            .from('entities')
            .select('*', { count: 'exact', head: true })

        if (error) {
            console.error('❌ Supabase Error:', error.message)
        } else {
            console.log('✅ Supabase Connected Successfully!')
            console.log(`📊 Found ${count} entities in the database.`)
        }

        // Test a specific query
        const { data: entity, error: entityError } = await supabase
            .from('entities')
            .select('slug, name')
            .eq('slug', 'banh-mi-phuong')
            .single()

        if (entityError) {
            console.error('❌ Failed to fetch test entity:', entityError.message)
        } else {
            console.log(`✅ Loaded Entity: ${entity.name} (${entity.slug})`)
        }

    } catch (err) {
        console.error('❌ Network/Client Error:', err)
    }
}

testConnection()
