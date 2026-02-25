
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const logFile = 'debug_output.txt';
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

if (!supabaseUrl || !supabaseKey) {
    log('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    fs.writeFileSync(logFile, 'Starting debug...\n');
    log('Checking Supabase connection...');

    // Check vendors table
    const { count: vendorCount, error: vendorError } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

    if (vendorError) {
        log('Error querying vendors table: ' + vendorError.message);
    } else {
        log(`Vendors table exists. Count: ${vendorCount}`);
    }

    // Check entities table
    const { count: entityCount, error: entityError } = await supabase
        .from('entities')
        .select('*', { count: 'exact', head: true });

    if (entityError) {
        log('Error querying entities table: ' + entityError.message);
    } else {
        log(`Entities table exists. Count: ${entityCount}`);
    }

    // Check businesses table
    const { count: businessCount, error: businessError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    if (businessError) {
        log('Businesses table query error (expected if dropped): ' + businessError.message);
    } else {
        log(`Businesses table exists. Count: ${businessCount}`);
    }
}

checkTables();
