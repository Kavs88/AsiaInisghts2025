import { notFound } from 'next/navigation'

export default function TestSimple() {
  // Only accessible in development
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <h1 className="text-4xl font-bold text-neutral-900">Simple Test Page</h1>
      <p className="text-neutral-600 mt-4">If you can see this, the app is working.</p>
    </div>
  )
}






