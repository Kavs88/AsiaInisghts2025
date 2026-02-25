
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runQA() {
    console.log('--- Debugging Entity Schema ---');

    // 1. Just get ANY entity
    const { data: entities, error } = await supabase
        .from('entities')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Fetch Error:', error);
        return;
    }

    if (entities.length > 0) {
        console.log('Keys found:', Object.keys(entities[0]));
        const entity = entities[0];

        // Try to find a valid slug from here
        const slug = entity.slug;
        if (slug) {
            console.log(`Found slug: ${slug}, proceeding with QA...`);
            await doPageCheck(slug);
        } else {
            console.log('First entity has no slug?');
        }
    } else {
        console.log('No entities found in table.');
    }
}

async function doPageCheck(slug) {
    const BASE_URL = 'http://localhost:3002';
    try {
        const res = await fetch(`${BASE_URL}/makers/${slug}`);
        const html = await res.text();
        console.log(`Page Load Status: ${res.status}`);

        // Buttons Check
        const hasFollow = html.includes('Follow');
        const hasRecommend = html.includes('Recommend') || html.includes('Recommended');
        const hasSave = html.includes('Save') || html.includes('Saved');

        console.log('Analysis:');
        console.log(`- Recommend Button: ${hasRecommend ? 'PASS' : 'FAIL'}`);
        console.log(`- Save Button: ${hasSave ? 'PASS' : 'FAIL'}`);
        console.log(`- Follow Button: ${hasFollow ? 'FAIL (Present)' : 'PASS (Absent)'}`);

    } catch (e) {
        console.error('Page fetch failed:', e);
    }
}

runQA();
