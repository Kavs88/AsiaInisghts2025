
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking Remote Database Schema ---');
    console.log('Target:', supabaseUrl);

    // 1. Check if 'embedding' column exists on entities (via loose introspection)
    // We can't query information_schema via API usually, but we can select the column and see if it errors.

    const { data, error } = await supabase
        .from('entities')
        .select('id, embedding')
        .limit(1);

    if (error) {
        console.log('Embedding Column Check: FAILED / MISSING');
        console.log('Error:', error.message);
    } else {
        console.log('Embedding Column Check: EXISTS');
    }

    // 2. Check if 'businesses' table still exists (should be dropped)
    const { data: bData, error: bError } = await supabase
        .from('businesses')
        .select('id')
        .limit(1);

    if (!bError) {
        console.log('Legacy "businesses" table: EXISTS (Migration 025 NOT applied)');
    } else {
        console.log('Legacy "businesses" table: GONE (Migration 025 Applied or Access Denied)');
        console.log('Error:', bError.message);
    }

    // 3. Check RPC function
    const { error: rpcError } = await supabase.rpc('match_entities', {
        query_embedding: [0.1], // Invalid dimensions but should trigger "function not found" vs "params error"
        match_threshold: 0.5,
        match_count: 1
    });

    if (rpcError) {
        if (rpcError.message.includes('function match_entities') && rpcError.message.includes('does not exist')) {
            console.log('RPC match_entities: MISSING (Migration 026 NOT applied)');
        } else {
            console.log('RPC match_entities: EXISTS (or different error)');
            console.log('Error:', rpcError.message);
        }
    } else {
        console.log('RPC match_entities: EXISTS');
    }
}

checkSchema();
