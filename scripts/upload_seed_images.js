const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env vars provided via --env-file
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Missing Supabase credentials. Make sure to run with --env-file=.env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const imagesDir = path.join(__dirname, '../downloaded_seed_images');
const BUCKET = 'vendor-assets';
const UPLOAD_FOLDER = 'seed';

async function uploadImages() {
    if (!fs.existsSync(imagesDir)) {
        console.error(`Directory not found: ${imagesDir}`);
        return;
    }

    const files = fs.readdirSync(imagesDir);
    console.log(`Found ${files.length} images to upload...`);

    let success = 0;
    let failed = 0;

    for (const file of files) {
        if (file === '.DS_Store') continue;

        const filePath = path.join(imagesDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        const storagePath = `${UPLOAD_FOLDER}/${file}`;

        console.log(`Uploading ${file}...`);

        const { data, error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType: 'image/jpeg', // Assuming mostly jpg/jpeg from earlier script
                upsert: true
            });

        if (error) {
            console.error(`Failed to upload ${file}:`, error.message);
            failed++;
        } else {
            // console.log(`Uploaded: ${data.path}`);
            success++;
        }
    }

    console.log(`\nUpload complete!`);
    console.log(`Success: ${success}`);
    console.log(`Failed: ${failed}`);
}

uploadImages();
