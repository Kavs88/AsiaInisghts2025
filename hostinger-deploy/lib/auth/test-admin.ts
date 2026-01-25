/**
 * Test Admin Check - Run this in browser console
 * Copy and paste this entire function into browser console (F12)
 */

export async function testAdminCheck() {
  console.log('🔍 Testing Admin Check...\n')

  try {
    // Step 1: Check if Supabase client works
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    console.log('✅ Supabase client created')

    // Step 2: Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('❌ Error getting user:', userError)
      return
    }

    if (!user) {
      console.error('❌ No user found - you are not signed in!')
      console.log('👉 Sign in at /auth/login')
      return
    }

    console.log('✅ User authenticated:', {
      id: user.id,
      email: user.email
    })

    // Step 3: Check user record in database
    const { data, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', user.id)
      .single()

    const userData = data as any
    // @ts-ignore
    const userRecord = userData // Assuming the user intended to assign the cast data to userRecord
    const role = userData?.role // Assuming 'rolerRecord' was a typo and 'role' was intended

    if (dbError) {
      console.error('❌ Database error:', dbError)
      console.log('Error details:', {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details
      })
      return
    }

    if (!userRecord) {
      console.error('❌ User record not found in public.users table!')
      console.log('👉 Run: supabase/create_both_users.sql')
      return
    }

    console.log('✅ User record found:', userRecord)

    // Step 4: Check admin role
    const isAdmin = userRecord.role === 'admin'

    if (isAdmin) {
      console.log('✅ YOU ARE AN ADMIN!')
      console.log('Role:', userRecord.role)
    } else {
      console.error('❌ You are NOT an admin')
      console.log('Current role:', userRecord.role)
      console.log('👉 Run: VERIFY_ADMIN_ROLE.sql to set your role to admin')
    }

    // Step 5: Test isAdmin() function
    console.log('\n🔍 Testing isAdmin() function...')
    const { isAdmin: isAdminResult } = await import('@/lib/auth/admin')
    const adminCheck = await isAdminResult()

    if (adminCheck) {
      console.log('✅ isAdmin() returns: true')
    } else {
      console.error('❌ isAdmin() returns: false')
      console.log('This means the function is not working correctly')
    }

    return {
      authenticated: true,
      user: user,
      userRecord: userRecord,
      isAdmin: isAdmin,
      isAdminFunction: adminCheck
    }

  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
    return null
  }
}

// To use: Copy this into browser console:
// import('/lib/auth/test-admin').then(m => m.testAdminCheck())





