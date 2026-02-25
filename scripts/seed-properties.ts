
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedProperties() {
    console.log('🌱 Starting Property Seed...')

    // 1. Fetch Business IDs
    const slugs = ['banh-mi-phuong', 'reaching-out-teahouse', 'enouvo-space', 'roots-plant-based-cafe', 'barefoot-beach-club', 'six-on-six']
    const { data: businesses, error: busError } = await supabase
        .from('businesses')
        .select('id, slug')
        .in('slug', slugs)

    if (busError) {
        console.error('Error fetching businesses:', busError)
        return
    }

    const businessMap: Record<string, string> = {}
    businesses?.forEach(b => businessMap[b.slug] = b.id)

    console.log('Found Businesses:', Object.keys(businessMap))

    // 2. Define Properties
    const properties = [
        {
            // Fallback to any business if Enouvo not found, or skip
            business_id: businessMap['enouvo-space'] || businesses?.[0]?.id,
            type: 'villa',
            property_type: 'rental',
            address: '123 An Thuong 4, My An, Da Nang',
            price: 2500000,
            bedrooms: 4,
            bathrooms: 5,
            capacity: 8,
            description: 'Luxurious modern villa with private pool, just steps from My Khe Beach. Perfect for digital nomads and families. Features high-speed fiber internet, coworking setup, and daily housekeeping.',
            images: [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
                'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80'
            ],
            location_coords: 'POINT(108.243 16.054)',
            availability: 'available',
            is_active: true
        },
        {
            business_id: businessMap['roots-plant-based-cafe'] || businesses?.[1]?.id,
            type: 'apartment',
            property_type: 'rental',
            address: '45 Le Quang Dao, Da Nang',
            price: 1200000,
            bedrooms: 2,
            bathrooms: 2,
            capacity: 4,
            description: 'Modern 2-bedroom apartment with ocean view. Fully furnished kitchen, smart TV, and access to building gym and pool. Located in the heart of the expat district.',
            images: [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80'
            ],
            location_coords: 'POINT(108.240 16.058)',
            availability: 'available',
            is_active: true
        },
        {
            business_id: businessMap['barefoot-beach-club'] || businesses?.[2]?.id,
            type: 'event_space',
            property_type: 'event_space',
            address: 'My Khe Beach, Da Nang',
            price: 5000000,
            bedrooms: 0,
            bathrooms: 4,
            capacity: 200,
            description: 'Stunning beachfront venue perfect for sunset parties, corporate retreats, and weddings. Full catering service available. Capacity up to 200 guests.',
            images: [
                'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80',
                'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=1600&q=80'
            ],
            location_coords: 'POINT(108.245 16.060)',
            availability: 'available',
            is_active: true
        },
        {
            business_id: businessMap['six-on-six'] || businesses?.[0]?.id,
            type: 'house',
            property_type: 'rental',
            address: 'Friendly Neighborhood, Hoi An',
            price: 1800000,
            bedrooms: 3,
            bathrooms: 3,
            capacity: 6,
            description: 'Charming heritage house in Hoi An. Experience traditional architecture with modern comforts. deeply quiet and peaceful garden.',
            images: [
                'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1600&q=80',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80'
            ],
            location_coords: 'POINT(108.328 15.877)',
            availability: 'available',
            is_active: true
        }
    ]

    // Filter out any where business_id is missing (shouldn't happen with fallback)
    const validProperties = properties.filter(p => p.business_id)

    if (validProperties.length === 0) {
        console.log('❌ No valid businesses found to link properties to.')
        return
    }

    const { data, error } = await supabase
        .from('properties')
        .insert(validProperties)
        .select()

    if (error) {
        console.error('❌ property Seed Failed:', error.message)
    } else {
        console.log(`✅ Successfully seeded ${data.length} properties.`)
    }
}

seedProperties()
