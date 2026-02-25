
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim();
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SEED_DATA = [
    {
        slug: 'madam-lan-seafood',
        notes: [
            { text: "Best for large groups, but request the garden seating to avoid the noise of the main hall.", visibility: 'public' },
            { text: "The owner is very strict about sourcing freshness daily at 4am.", visibility: 'internal' }
        ],
        tags: ["Group Dining", "Reliable Quality", "Bustling"]
    },
    {
        slug: 'enouvo-space',
        notes: [
            { text: "Excellent reliable wifi on the 2nd floor. The rooftop cafe is quieter for calls.", visibility: 'public' },
            { text: "Community manager is great for introductions to local dev scene.", visibility: 'internal' }
        ],
        tags: ["Remote Work", "Tech Community", "Reliable WiFi"]
    },
    {
        slug: 'marble-mountain',
        notes: [
            { text: "Go at 7 AM to beat the tour buses. The elevator is convenient but the stairs offer better views.", visibility: 'public' }
        ],
        tags: ["Early Riser", "Physical Activity", "Tourist Staple"]
    },
    {
        slug: 'juice-bar',
        notes: [
            { text: "Uses only organic produce from Tra Que village. No sugar added.", visibility: 'public' }
        ],
        tags: ["Healthy Option", "Organic Sourcing"]
    },
    {
        slug: 'sunday-market', // Self-referential or main entity
        notes: [
            { text: "The heart of the community. Best time to meet makers is during setup (8-9 AM).", visibility: 'public' }
        ],
        tags: ["Community Hub", "Weekend Ritual", "Family Friendly"]
    }
];

async function seedIntelligence() {
    console.log('🌱 Starting Phase 4.1 Intelligence Seeding...');

    for (const item of SEED_DATA) {
        // 1. Get Entity ID
        const { data: entity, error } = await supabase
            .from('entities')
            .select('id, name')
            .eq('slug', item.slug)
            .maybeSingle();

        if (error || !entity) {
            console.log(`⚠️  Skipping ${item.slug}: Not found.`);
            continue;
        }

        console.log(`Processing: ${entity.name} (${item.slug})`);

        // 2. Clear existing (Idempotent)
        await supabase.from('founder_tags').delete().eq('entity_id', entity.id);
        await supabase.from('founder_notes').delete().eq('entity_id', entity.id);

        // 3. Insert Tags
        for (const tag of item.tags) {
            const { error: tagError } = await supabase.from('founder_tags').insert({
                entity_id: entity.id,
                tag: tag
            });
            if (tagError) console.error(`   ❌ Tag Error (${tag}):`, tagError.message);
            else console.log(`   ✅ Tag added: ${tag}`);
        }

        // 4. Insert Notes
        for (const note of item.notes) {
            const { error: noteError } = await supabase.from('founder_notes').insert({
                entity_id: entity.id,
                note: note.text,
                visibility: note.visibility,
                // author_id: can be null for system seeding, or fetch a user if strictly required
            });
            if (noteError) console.error(`   ❌ Note Error:`, noteError.message);
            else console.log(`   ✅ Note added (${note.visibility})`);
        }
    }

    console.log('✨ Seeding Check Complete.');
}

seedIntelligence();
