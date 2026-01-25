'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AdminEventsPage() {
  // Mock data for Phase 3 Foundation
  const events: any[] = []

  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Events Management</h1>
            <p className="text-neutral-600">Manage community and vendor events</p>
          </div>
          <button disabled className="px-4 py-2 bg-neutral-200 text-neutral-500 rounded-lg cursor-not-allowed">
            + Create Event (Coming Phase 4)
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <table className="w-full text-left bg-white">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Host</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No events found. Events table is ready for Phase 4 population.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4">{event.title}</td>
                    <td className="px-6 py-4">{event.host_id}</td>
                    <td className="px-6 py-4">{event.start_at}</td>
                    <td className="px-6 py-4">{event.status}</td>
                    <td className="px-6 py-4">View</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}



