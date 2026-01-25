import { createClient } from '@/lib/supabase/server'
import { hasAdminAccessServer } from '@/lib/auth/authority'
import { notFound } from 'next/navigation'

export default async function AdminDebugPage() {
  // Only accessible in development or by admins
  if (process.env.NODE_ENV !== 'development') {
    const isAdmin = await hasAdminAccessServer()
    if (!isAdmin) {
      notFound()
    }
  }

  const supabase = await createClient()
  const isAdmin = await hasAdminAccessServer()

  let userInfo = null
  let userRole = null
  let sessionInfo = null

  if (supabase) {
    // Check session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('[AdminDebug] Session error:', sessionError.message)
    }
    if (session) {
      sessionInfo = {
        hasSession: true,
        userId: session.user?.id,
        userEmail: session.user?.email,
        expiresAt: session.expires_at,
      }
    }

    // Also try getUser
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('[AdminDebug] User error:', userError.message)
    }

    if (user || session?.user) {
      const currentUser = user || session?.user
      if (currentUser) {
        userInfo = {
          id: currentUser.id,
          email: currentUser.email,
          source: user ? 'getUser()' : 'session',
        }

        const { data, error } = await supabase
          .from('users')
          .select('role, email, full_name')
          .eq('id', currentUser.id)
          .single()

        if (error) {
          console.error('[AdminDebug] Database error:', error.message)
        }

        userRole = data
      }
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">Admin Debug Info</h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Server Client</h2>
              <p className="text-neutral-600">
                {supabase ? '✅ Available' : '❌ Not available'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Is Admin</h2>
              <p className="text-neutral-600">
                {isAdmin ? '✅ Yes' : '❌ No'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">User Info</h2>
              <pre className="bg-neutral-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">User Role</h2>
              <pre className="bg-neutral-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(userRole, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Session Info</h2>
              <pre className="bg-neutral-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Next Steps</h2>
              {!userInfo ? (
                <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-warning-900 mb-2">⚠️ You are NOT signed in!</h3>
                  <p className="text-warning-800 mb-3">You must sign in first before accessing the admin panel.</p>
                  <a
                    href="/auth/login"
                    className="inline-block px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Go to Login Page →
                  </a>
                </div>
              ) : null}
              <ul className="list-disc list-inside space-y-2 text-neutral-600">
                {userInfo && !isAdmin && (
                  <li className="font-semibold text-error-600">
                    If "Is Admin" is ❌, run the SQL in <code className="bg-neutral-100 px-2 py-1 rounded">QUICK_ADMIN_FIX.sql</code> or <code className="bg-neutral-100 px-2 py-1 rounded">supabase/make_admin.sql</code>
                  </li>
                )}
                <li>If "Server Client" is ❌, check your Supabase connection</li>
                {!userInfo && (
                  <li className="font-semibold text-error-600">If "User Info" is null, <a href="/auth/login" className="text-primary-600 underline">sign in first</a></li>
                )}
                {userInfo && !userRole && (
                  <li className="font-semibold text-error-600">If "User Role" is null, your user record might not exist. Run <code className="bg-neutral-100 px-2 py-1 rounded">supabase/create_both_users.sql</code></li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

