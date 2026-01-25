const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const jsonPath = path.join(__dirname, '../supabase/seed_da_nang_hoi_an.json');
const outputPath = path.join(__dirname, '../supabase/101_seed_data.sql');

const uuid = () => crypto.randomUUID();
const escape = (str) => str ? str.replace(/'/g, "''") : '';

// Sourced from .env.local
const SUPABASE_URL = 'https://hkssuvamxdnqptyprsom.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/vendor-assets/seed`;

try {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const USER_ID = '3eaf883d-f14c-4545-9639-feae5412fc22';

  let sql = `-- Seed Data Script
-- Run this AFTER 100_repair_schema.sql

-- Clear existing data
TRUNCATE TABLE events, properties, businesses, vendors CASCADE;

`;

  // Pre-generate IDs
  const vendors = (data.vendors || []).map(v => ({ ...v, id: uuid() }));
  const businesses = (data.businesses || []).map(b => ({ ...b, id: uuid() }));

  const getRandomId = (items) => items.length > 0 ? items[Math.floor(Math.random() * items.length)].id : null;

  // 1. Vendors
  console.log(`Processing ${vendors.length} vendors...`);
  vendors.forEach((v, index) => {
    const userIdVal = index === 0 ? `'${USER_ID}'` : 'NULL';

    sql += `
INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '${v.id}',
  '${escape(v.name)}',
  '${escape(v.slug)}',
  '${escape(v.tagline || v.description)}',
  '${escape(v.logo_url)}',
  '${escape(v.banner_url)}', 
  '${escape(v.business_email || v.contact_email)}', 
  '${escape(v.business_phone || v.contact_phone)}',
  '${escape(v.website)}',
  ${userIdVal},
  true,
  true,
  ${v.delivery_available || false},
  true
) ON CONFLICT (id) DO NOTHING;
`;
  });

  // 2. Businesses
  console.log(`Processing ${businesses.length} businesses...`);
  businesses.forEach(b => {
    // Construct Image URL
    const filename = `business_${b.slug}_hero.jpg`;
    const storageUrl = `${STORAGE_BASE}/${filename}`;

    sql += `
INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '${b.id}',
  '${escape(b.name)}',
  '${escape(b.slug)}',
  '${escape(b.description)}',
  '${escape(b.address)}',
  '${escape(b.category)}',
  '${USER_ID}',
  '${storageUrl}', 
  '${escape(b.tagline)}',
  true,
  ${b.is_verified || true}
) ON CONFLICT (id) DO NOTHING;
`;
  });

  // 3. Properties
  if (data.properties) {
    console.log(`Processing ${data.properties.length} properties...`);
    data.properties.forEach(p => {
      const pId = uuid();
      const randomBusinessId = getRandomId(businesses);
      const bId = randomBusinessId ? `'${randomBusinessId}'` : 'NULL';

      const slug = p.address.replace(/[^a-z0-9]/gi, '-').toLowerCase();

      const imageUrls = (p.images || []).map((_, i) => {
        const filename = `property_${slug}_${i + 1}.jpg`;
        return `${STORAGE_BASE}/${filename}`;
      });

      const imagesArray = imageUrls.length > 0 ? `ARRAY[${imageUrls.map(url => `'${url}'`).join(',')}]` : 'NULL';

      sql += `
INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '${pId}',
  '${escape(p.address)}',
  '${escape(p.type)}',
  'rental',
  ${p.price || p.price_per_night || 0},
  ${p.bedrooms || 1},
  ${p.bathrooms || 1},
  ${p.capacity || 'NULL'},
  '${escape(p.description)}',
  ${imagesArray}, 
  '${USER_ID}',
  ${bId},
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
`;
    });
  }

  // 4. Events
  if (data.events) {
    console.log(`Processing ${data.events.length} events...`);
    data.events.forEach(e => {
      const eId = uuid();

      // Fix dates: Shift 2025 to 2026/2027
      const startAt = (e.start_at || new Date().toISOString()).replace('2025', '2026');
      const endAt = (e.end_at || new Date().toISOString()).replace('2025', '2026');

      // Fix Image URL: Assign based on title keywords if missing
      let imageUrl = e.image_url || e.hero_image_url || '';

      if (!imageUrl) {
        const lowerTitle = e.title.toLowerCase();
        if (lowerTitle.includes('fireworks')) imageUrl = 'https://images.unsplash.com/photo-1533230125150-5a3d7c588a44?auto=format&fit=crop&q=80&w=1000';
        else if (lowerTitle.includes('lantern')) imageUrl = 'https://images.unsplash.com/photo-1548625361-b8ae7bb03433?auto=format&fit=crop&q=80&w=1000';
        else if (lowerTitle.includes('marathon') || lowerTitle.includes('ironman') || lowerTitle.includes('run')) imageUrl = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1000';
        else if (lowerTitle.includes('christmas')) imageUrl = 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&q=80&w=1000';
        else if (lowerTitle.includes('new year')) imageUrl = 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&q=80&w=1000';
        else imageUrl = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000';
      }

      sql += `
INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  '${eId}',
  '${escape(e.title)}',
  '${escape(e.description)}',
  '${escape(e.location)}',
  '${startAt}',
  '${endAt}',
  'published',
  ${e.ticket_price || 0},
  '${escape(imageUrl)}',
  '${USER_ID}'
) ON CONFLICT (id) DO NOTHING;
`;
    });
  }

  fs.writeFileSync(outputPath, sql);
  console.log(`Generated SQL script at ${outputPath}`);

} catch (err) {
  console.error('Error generating seed SQL:', err);
}
