/**
 * Test Supabase Connection
 * 
 * Run with: npx tsx scripts/test-supabase-connection.ts
 * 
 * This script tests if your Supabase connection is working correctly.
 */

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Testing Supabase Connection...\n')

  if (!supabaseUrl || supabaseUrl === 'your-project-url-here') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set!')
    console.log('   Please set it in .env.local')
    process.exit(1)
  }

  if (!supabaseKey || supabaseKey === 'your-supabase-anon-key') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!')
    console.log('   Please set it in .env.local')
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`)

  try {
    // Test connection by fetching from a table
    const response = await fetch(`${supabaseUrl}/rest/v1/vendors?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    })

    if (response.ok) {
      console.log('✅ Connection successful!')
      console.log('   Supabase is connected and responding.\n')
      
      // Check if schema is set up
      const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/vendors?select=count`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact',
        },
      })

      if (schemaResponse.ok) {
        console.log('✅ Database schema appears to be set up')
        console.log('   You can now start using the application!\n')
      } else {
        console.log('⚠️  Database schema may not be set up yet')
        console.log('   Run supabase/schema.sql in your Supabase SQL Editor\n')
      }
    } else {
      const error = await response.text()
      console.error('❌ Connection failed!')
      console.error(`   Status: ${response.status}`)
      console.error(`   Error: ${error}\n`)
      
      if (response.status === 401) {
        console.log('💡 Tip: Check that your API key is correct')
      } else if (response.status === 404) {
        console.log('💡 Tip: Check that your Supabase URL is correct')
      }
      
      process.exit(1)
    }
  } catch (error: any) {
    console.error('❌ Connection error!')
    console.error(`   ${error.message}\n`)
    console.log('💡 Tip: Check your internet connection and Supabase project status')
    process.exit(1)
  }
}

// Load env vars (for testing outside Next.js)
if (require.main === module) {
  require('dotenv').config({ path: '.env.local' })
  testConnection()
}

export { testConnection }






