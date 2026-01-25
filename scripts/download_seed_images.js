const fs = require('fs');
const path = require('path');
const https = require('https');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const seedFile = path.join(__dirname, '../supabase/seed_da_nang_hoi_an.json');
const downloadDir = path.join(__dirname, '../downloaded_seed_images');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

async function downloadFile(url, filename) {
    const destination = path.join(downloadDir, filename);
    const fileStream = fs.createWriteStream(destination, { flags: 'wx' });

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download: ${res.statusCode} ${url}`));
                return;
            }
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(destination, () => { }); // Delete failed file
            reject(err);
        });
    }).catch(err => {
        if (err.code === 'EEXIST') {
            console.log(`Skipped existing: ${filename}`);
            return;
        }
        console.error(`Error downloading ${url}:`, err.message);
    });
}

async function main() {
    const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
    const downloads = [];

    // Process Businesses
    if (data.businesses) {
        data.businesses.forEach((biz, index) => {
            if (biz.hero_image_url) {
                const ext = 'jpg'; // Unsplash usually jpg
                const filename = `business_${biz.slug}_hero.${ext}`;
                downloads.push(downloadFile(biz.hero_image_url, filename));
            }
        });
    }

    // Process Properties
    if (data.properties) {
        data.properties.forEach((prop, index) => {
            if (prop.images && Array.isArray(prop.images)) {
                prop.images.forEach((imgUrl, imgIndex) => {
                    const slug = prop.address.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                    const filename = `property_${slug}_${imgIndex + 1}.jpg`;
                    downloads.push(downloadFile(imgUrl, filename));
                });
            }
        });
    }

    await Promise.all(downloads);
    console.log('All downloads completed.');
}

main();
