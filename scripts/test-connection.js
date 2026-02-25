
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to avoid dotenv dependency issues in this quick script
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
        console.error('Error loading .env.local:', e.message);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
    console.log(`Testing connection to: ${supabaseUrl}`);

    const start = Date.now();
    const { count, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

    const duration = Date.now() - start;

    if (error) {
        console.error('❌ CONNECTION FAILED');
        console.error('Error:', error.message);
        if (error.message.includes('Fetch')) {
            console.error('This indicates a network blockage or the Supabase project is paused/offline.');
        }
    } else {
        console.log('✅ CONNECTION SUCCESSFUL');
        console.log(`Response time: ${duration}ms`);
        console.log(`User count (access verification): ${count !== null ? count : 'Authorized'}`);
        console.log('Database is active and accepting requests via Service Key.');
    }
}

testConnection();
