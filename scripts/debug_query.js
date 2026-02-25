
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const logFile = 'debug_query.txt';
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

if (!supabaseUrl || !anonKey) {
    log('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function checkQuery() {
    fs.writeFileSync(logFile, 'Starting Query debug...\n');

    // Reproducing getVendors query
    console.log("Running getVendors equivalent query...");

    const { data, error, count } = await supabase
        .from('vendors')
        .select('id, name, is_active, category', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        log('Error running getVendors query: ' + error.message);
    } else {
        log(`getVendors returned ${data.length} rows.`);
        if (data.length > 0) {
            log('Sample row: ' + JSON.stringify(data[0]));
        } else {
            // Check total active count
            const { count: totalActive } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);
            log(`Total active vendors in DB: ${totalActive}`);

            // Check total inactive
            const { count: totalInactive } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', false);
            log(`Total inactive vendors in DB: ${totalInactive}`);
        }
    }
}

checkQuery();
