
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('Seeding sample intelligence...')

    // 1. Find a target entity (Vendor)
    const { data: entity, error } = await supabase
        .from('entities')
        .select('id, name, slug')
        .eq('type', 'vendor')
        .limit(1)
        .single()

    if (error || !entity) {
        console.error('No entities found to seed!', error)
        return
    }

    console.log(`Seeding for: ${entity.name} (${entity.slug})`)

    // 2. Clear existing (idempotent)
    await supabase.from('founder_tags').delete().eq('entity_id', entity.id)
    await supabase.from('founder_notes').delete().eq('entity_id', entity.id)

    // 3. Insert Tag
    const { error: tagError } = await supabase.from('founder_tags').insert({
        entity_id: entity.id,
        tag: 'Ceramic Master'
    })
    if (tagError) console.error('Tag Error:', tagError)
    else console.log('Tag inserted: Ceramic Master')

    // 4. Insert Note
    const { error: noteError } = await supabase.from('founder_notes').insert({
        entity_id: entity.id,
        note: 'Highly recommended for their glazing workshops. The founder is a local legend.',
        visibility: 'public'
    })
    if (noteError) console.error('Note Error:', noteError)
    else console.log('Note inserted.')

    console.log('✅ Seeding complete.')
}

seed()
