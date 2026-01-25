'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TestConnectionPage() {
  const router = useRouter()
  
  // Only accessible in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      router.replace('/')
    }
  }, [router])
  
  // Don't render if not in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [message, setMessage] = useState('Testing connection...')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        
        // Test 1: Basic connection
        setMessage('Testing basic connection...')
        const { data: healthCheck, error: healthError } = await supabase
          .from('vendors')
          .select('count')
          .limit(0)

        if (healthError) {
          // Check if it's a "relation does not exist" error (schema not set up)
          if (healthError.code === '42P01' || healthError.message.includes('does not exist')) {
            setStatus('error')
            setMessage('Database schema not set up yet')
            setDetails({
              error: healthError.message,
              solution: 'Run supabase/schema.sql in your Supabase SQL Editor',
            })
            return
          }
          
          // Other errors
          setStatus('error')
          setMessage('Connection failed')
          setDetails({
            error: healthError.message,
            code: healthError.code,
          })
          return
        }

        // Test 2: Check if we can query (even if empty)
        setMessage('Testing query capability...')
        const { data: vendors, error: queryError } = await supabase
          .from('vendors')
          .select('id, name')
          .limit(5)

        if (queryError) {
          setStatus('error')
          setMessage('Query test failed')
          setDetails({
            error: queryError.message,
            code: queryError.code,
          })
          return
        }

        // Success!
        setStatus('success')
        setMessage('✅ Connection successful!')
        setDetails({
          vendorsFound: vendors?.length || 0,
          canQuery: true,
          nextStep: vendors?.length === 0 
            ? 'Database is set up but empty. Start adding vendors!'
            : `Found ${vendors.length} vendor(s)`,
        })
      } catch (error: any) {
        setStatus('error')
        setMessage('❌ Connection error')
        setDetails({
          error: error.message,
          type: 'Unexpected error',
        })
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">
          Supabase Connection Test
        </h1>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            {status === 'testing' && (
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            )}
            {status === 'success' && (
              <div className="w-5 h-5 bg-success-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-5 h-5 bg-error-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <p className={`text-lg font-medium ${
              status === 'success' ? 'text-success-600' :
              status === 'error' ? 'text-error-600' :
              'text-neutral-600'
            }`}>
              {message}
            </p>
          </div>

          {/* Details */}
          {details && (
            <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
              <h2 className="font-semibold text-neutral-900 mb-2">Details:</h2>
              <pre className="text-sm text-neutral-700 overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}

          {/* Environment Check */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
            <h2 className="font-semibold text-neutral-900 mb-2">Environment Variables:</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                  <>
                    <div className="w-2 h-2 bg-success-600 rounded-full" />
                    <span className="text-neutral-700">
                      NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-error-600 rounded-full" />
                    <span className="text-error-600">NEXT_PUBLIC_SUPABASE_URL: Not set</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <>
                    <div className="w-2 h-2 bg-success-600 rounded-full" />
                    <span className="text-neutral-700">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY: Set ({process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-error-600 rounded-full" />
                    <span className="text-error-600">NEXT_PUBLIC_SUPABASE_ANON_KEY: Not set</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          {status === 'error' && (
            <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-xl">
              <h2 className="font-semibold text-warning-900 mb-2">Next Steps:</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-warning-800">
                <li>Make sure you created `.env.local` file</li>
                <li>Check that your Supabase URL and keys are correct</li>
                <li>Run `supabase/schema.sql` in your Supabase SQL Editor</li>
                <li>Restart your dev server after changing `.env.local`</li>
              </ul>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-6">
              <a
                href="/"
                className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                Go to Homepage →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}






