
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) { process.exit(1) }
const supabase = createClient(supabaseUrl, supabaseKey)

async function seedGoldenSet() {
    console.log('🌟 Starting Golden Set Seed...')

    // 1. MOCK PROFILES
    const profiles = [
        { id: '00000000-0000-0000-0000-000000000001', first_name: 'Sarah', last_name: 'Jenkins', email: 'sarah.j@example.com', role: 'resident' },
        { id: '00000000-0000-0000-0000-000000000002', first_name: 'David', last_name: 'Chen', email: 'david.c@example.com', role: 'expat' },
        { id: '00000000-0000-0000-0000-000000000003', first_name: 'Elena', last_name: 'Rodriguez', email: 'elena.r@example.com', role: 'resident' },
        { id: '00000000-0000-0000-0000-000000000004', first_name: 'Michael', last_name: 'Ross', email: 'mike.r@example.com', role: 'expat' },
        { id: '00000000-0000-0000-0000-000000000005', first_name: 'Jenny', last_name: 'Nguyen', email: 'jenny.n@example.com', role: 'resident' }
    ]

    const { error: profileError } = await supabase.from('profiles').upsert(profiles, { onConflict: 'id' })
    if (profileError) console.error('Profile Seed Error:', profileError)
    else console.log('✅ 5 Mock Profiles Seeded')

    // 2. SOCIAL PROOF (User Entity Signals)
    // Fetch entity IDs
    const { data: entities } = await supabase.from('entities').select('id, slug').in('slug', ['banh-mi-phuong', 'enouvo-space'])
    const banhMi = entities?.find(e => e.slug === 'banh-mi-phuong')
    const enouvo = entities?.find(e => e.slug === 'enouvo-space')

    if (banhMi && enouvo) {
        const signals = [
            { user_id: profiles[0].id, entity_id: banhMi.id, signal_type: 'save' },
            { user_id: profiles[1].id, entity_id: banhMi.id, signal_type: 'save' },
            { user_id: profiles[2].id, entity_id: banhMi.id, signal_type: 'save' },
            { user_id: profiles[3].id, entity_id: enouvo.id, signal_type: 'save' },
            { user_id: profiles[4].id, entity_id: enouvo.id, signal_type: 'save' }
        ]

        const { error: signalError } = await supabase.from('user_entity_signals').upsert(signals, { onConflict: 'user_id, entity_id, signal_type' })
        if (signalError) console.error('Signal Seed Error:', signalError)
        else console.log('✅ 5 User Saves Seeded')
    }

    // 3. MARKET EVENTS
    const events = [
        {
            title: 'Sunday Market: Holiday Special',
            description: 'Join us for a special holiday edition...',
            start_time: new Date(Date.now() + 2 * 86400000).toISOString(),
            end_time: new Date(Date.now() + 2.5 * 86400000).toISOString(),
            location_name: 'Riverside Park',
            event_type: 'market',
            cover_image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1600&q=80'
        }
    ]

    const { data: seededEvents, error: eventError } = await supabase.from('events').insert(events).select()
    if (eventError) console.error('Event Seed Error:', eventError)
    else console.log('✅ Market Event Seeded')

    // 4. FOUNDER NOTES
    if (enouvo) {
        const note = {
            entity_id: enouvo.id,
            note: 'The best spot for digital nomads. Fast internet and great community lunch.',
            tags: ['Digital Nomad', 'Wifi', 'Community'],
            confidence_score: 0.95
        }
        const { error: noteError } = await supabase.from('founder_notes').insert(note)
        if (noteError) console.error('Note Seed Error:', noteError)
        else console.log('✅ Founder Insight Seeded')
    }

}

seedGoldenSet()
