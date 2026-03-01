import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
    console.log('--- SEARCHING FOR MADAM LAN ---')

    const { data: ent } = await supabase.from('entities').select('id, name, owner_id, created_by, slug').ilike('name', '%Madam Lan%')
    console.log('Entities:', ent)

    const { data: bus } = await supabase.from('businesses').select('id, name, owner_id, created_by, slug').ilike('name', '%Madam Lan%')
    console.log('Businesses:', bus)

    const { data: ven } = await supabase.from('vendors').select('id, name, user_id, slug').ilike('name', '%Madam Lan%')
    console.log('Vendors:', ven)

    // Check if there are any records with sam's ID
    const samId = '3eaf883d-f14c-4545-9639-feae5412fc22'
    const { data: samEntities } = await supabase.from('entities').select('id, name, type').eq('owner_id', samId)
    console.log('Sam Owned Entities:', samEntities)
}

test()
