import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing keys")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

import fs from 'fs'

async function run() {
    const output = {}

    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) console.error(userError)
    let founderId = null
    if (users) {
        const founders = users.users.filter(u => u.email === 'sam@kavsulting.com' || u.app_metadata?.role === 'admin' || u.app_metadata?.role === 'superadmin' || u.email?.includes('admin'))
        output.founders = founders.map(f => ({ id: f.id, email: f.email }))
        if (founders.length > 0) founderId = founders[0].id
    }

    const { data: mlsBus, error: err1 } = await supabase.from('businesses').select('*').ilike('name', '%Madam Lan%')
    if (err1) console.error(err1)
    output.madamLansSeafood_businesses = mlsBus

    const { data: mlsEnt, error: err3 } = await supabase.from('entities').select('*').ilike('name', '%Madam Lan%')
    if (err3) console.error(err3)
    output.madamLansSeafood_entities = mlsEnt

    const { data: props, error: err4 } = await supabase.from('properties').select('*').ilike('name', '%Madam Lan%')
    if (err4) console.error(err4)
    output.madamLansSeafood_properties = props

    const { data: businesses, error: err2 } = await supabase.from('businesses').select('id, name, owner_id')
    if (err2) console.error(err2)
    if (businesses) {
        const withOwner = businesses.filter(b => b.owner_id !== null)
        const withoutOwner = businesses.filter(b => b.owner_id === null)
        output.stats = {
            total: businesses.length,
            withOwner: withOwner.length,
            withoutOwner: withoutOwner.length
        }
        if (founderId) {
            const founderOwned = withOwner.filter(b => b.owner_id === founderId)
            output.stats.founderOwned = founderOwned.length
            output.founderOwnedList = founderOwned.map(b => b.name)
        }
    }

    fs.writeFileSync('audit.json', JSON.stringify(output, null, 2))
    console.log('Audit generated to audit.json')
}

run()
