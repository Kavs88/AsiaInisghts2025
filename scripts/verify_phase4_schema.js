const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const lines = content.split('\n');
            const env = {};
            lines.forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();
                    // Remove quotes if present
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error('Error loading .env.local', e);
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1); // Exit if no credentials, script cannot run
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
    console.log('Verifying Phase 4 Schema Compatibility...');

    // 1. Check if 'events' table exists and has 'host_id' AND 'venue_id'
    const { data: events, error } = await supabase
        .from('events')
        .select('id, host_id, host_type, vendor_id, venue_id, venue_type')
        .limit(1);

    if (error) {
        console.error('❌ Error querying events table:', error.message);
        console.log('   (This likely means the table structure is outdated or RLS blocks access)');
        return false;
    }

    console.log('✅ Events table has compatible columns (host_id, vendor_id, venue_id)');

    if (events && events.length > 0) {
        console.log('✅ Events data found:', events.length, 'row(s)');
        console.log('   Sample:', events[0]);
    } else {
        console.log('⚠️ Events table is empty. Seeding might be needed.');
    }

    return true;
}

verifySchema().then((passed) => {
    if (passed) {
        console.log('\nSUCCESS: Schema appears correct.');
        process.exit(0);
    } else {
        console.log('\nFAILURE: Schema verification failed.');
        process.exit(1);
    }
});
