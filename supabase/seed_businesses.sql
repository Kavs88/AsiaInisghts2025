-- Seed Demo Businesses
INSERT INTO public.businesses (
    owner_id,
    name,
    slug,
    category,
    description,
    contact_phone,
    contact_email,
    address,
    website_url,
    logo_url,
    is_verified,
    is_active
) VALUES 
(
    '3eaf883d-f14c-4545-9639-feae5412fc22',
    'Da Nang Beach Boutique',
    'da-nang-beach-boutique',
    'retail',
    'Premium beachwear and local artisanal crafts from the heart of Da Nang.',
    '+84 123 456 789',
    'hello@dnbeach.com',
    '123 Vo Nguyen Giap, Da Nang',
    'https://dnbeach.com',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&h=200',
    true,
    true
),
(
    '3eaf883d-f14c-4545-9639-feae5412fc22',
    'Hoi An Heritage Cafe',
    'hoi-an-heritage-cafe',
    'food',
    'Traditional Vietnamese coffee and heritage-inspired pastries.',
    '+84 987 654 321',
    'info@heritagecafe.vn',
    '45 Tran Phu, Hoi An',
    'https://heritagecafe.vn',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&h=200',
    true,
    true
),
(
    '3eaf883d-f14c-4545-9639-feae5412fc22',
    'Dragon Bridge Tech Solutions',
    'dragon-bridge-tech',
    'service',
    'Professional IT consulting and digital transformation services for local SMEs.',
    '+84 555 123 456',
    'contact@dragontech.io',
    '88 Bach Dang, Da Nang',
    'https://dragontech.io',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&h=200',
    false,
    true
),
(
    '3eaf883d-f14c-4545-9639-feae5412fc22',
    'Marble Mountains Event Space',
    'marble-mountains-events',
    'venue',
    'Stunning rooftop venue with 360-degree views of the city and mountains.',
    '+84 777 888 999',
    'events@marblemountains.com',
    'Hoa Hai, Ngu Hanh Son, Da Nang',
    'https://marblemountainsevents.com',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=200&h=200',
    true,
    true
);

-- Note: owner_id '3eaf883d-f14c-4545-9639-feae5412fc22' is sam@kavsulting.com (Admin/Seed Account)
