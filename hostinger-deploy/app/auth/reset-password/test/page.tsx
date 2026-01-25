'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Test Page</h1>
        <p className="text-neutral-600">If you can see this, the route is working!</p>
        <p className="text-sm text-neutral-500 mt-4">Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        <p className="text-sm text-neutral-500">Hash: {typeof window !== 'undefined' ? window.location.hash : 'N/A'}</p>
      </div>
    </div>
  )
}





