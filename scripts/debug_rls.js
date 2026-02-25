
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const logFile = 'debug_rls.txt';
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

if (!supabaseUrl || !serviceKey || !anonKey) {
    log('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey);
const anonClient = createClient(supabaseUrl, anonKey);

async function checkAccess() {
    fs.writeFileSync(logFile, 'Starting RLS debug...\n');

    // 1. Check Admin Access to Vendors
    const { count: adminCount, error: adminError } = await adminClient
        .from('vendors')
        .select('*', { count: 'exact', head: true });

    if (adminError) {
        log('Admin Error querying vendors: ' + adminError.message);
    } else {
        log(`Admin sees ${adminCount} vendors.`);
    }

    // 2. Check Anon Access to Vendors
    const { count: anonCount, error: anonError } = await anonClient
        .from('vendors')
        .select('*', { count: 'exact', head: true });

    if (anonCount === null && anonError) {
        log('Anon Error querying vendors: ' + anonError.message);
    } else {
        log(`Anon sees ${anonCount} vendors.`);
    }

    // 3. Check Admin Access to Entities
    const { count: adminEntity, error: adminEntityErr } = await adminClient
        .from('entities')
        .select('*', { count: 'exact', head: true });

    if (adminEntityErr) {
        log('Admin Error querying entities: ' + adminEntityErr.message);
    } else {
        log(`Admin sees ${adminEntity} entities.`);
    }

    // 4. Check Anon Access to Entities
    const { count: anonEntity, error: anonEntityErr } = await anonClient
        .from('entities')
        .select('*', { count: 'exact', head: true });

    if (anonEntityErr) {
        log('Anon Error querying entities: ' + anonEntityErr.message);
    } else {
        log(`Anon sees ${anonEntity} entities.`);
    }
}

checkAccess();
