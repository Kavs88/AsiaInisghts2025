'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Stall {
  id: string
  stallNumber: string
  vendorId?: string
  vendorName?: string
  vendorTagline?: string
  vendorImageUrl?: string
  isOccupied: boolean
  x: number // Position as percentage
  y: number // Position as percentage
  width: number // Width as percentage
  height: number // Height as percentage
}

interface StallMapProps {
  stalls: Stall[]
  onStallClick?: (stall: Stall) => void
  onStallHover?: (stall: Stall | null) => void
  className?: string
  width?: number
  height?: number
}

export default function StallMap({
  stalls,
  onStallClick,
  onStallHover,
  className,
  width = 800,
  height = 600,
}: StallMapProps) {
  const [hoveredStall, setHoveredStall] = useState<Stall | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  const handleStallHover = (stall: Stall | null, event?: React.MouseEvent) => {
    setHoveredStall(stall)
    if (event) {
      setHoverPosition({ x: event.clientX, y: event.clientY })
    }
    onStallHover?.(stall)
  }

  return (
    <div className={cn('relative bg-neutral-50 rounded-2xl border border-neutral-200 p-6', className)}>
      <div className="relative" style={{ width: '100%', paddingBottom: `${(height / width) * 100}%` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background Grid */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-neutral-200"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Render Stalls */}
          {stalls.map((stall) => {
            const x = (stall.x / 100) * width
            const y = (stall.y / 100) * height
            const w = (stall.width / 100) * width
            const h = (stall.height / 100) * height

            return (
              <g key={stall.id}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={stall.isOccupied ? '#0ea5e9' : '#e5e7eb'}
                  stroke={hoveredStall?.id === stall.id ? '#0369a1' : '#9ca3af'}
                  strokeWidth={hoveredStall?.id === stall.id ? 3 : 1}
                  rx="4"
                  className={cn(
                    'transition-all cursor-pointer',
                    stall.isOccupied && 'hover:fill-primary-700',
                    !stall.isOccupied && 'hover:fill-neutral-300'
                  )}
                  onClick={() => onStallClick?.(stall)}
                  onMouseEnter={(e: any) => handleStallHover(stall, e.nativeEvent)}
                  onMouseLeave={() => handleStallHover(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    stall.isOccupied
                      ? `Stall ${stall.stallNumber}: ${stall.vendorName || 'Occupied'}`
                      : `Stall ${stall.stallNumber}: Available`
                  }
                />

                {/* Stall Number Label */}
                <text
                  x={x + w / 2}
                  y={y + h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-neutral-700 pointer-events-none"
                >
                  {stall.stallNumber}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(${width - 120}, 20)`}>
            <rect width="100" height="60" fill="white" stroke="#9ca3af" rx="4" />
            <text x="50" y="20" textAnchor="middle" className="text-xs font-semibold fill-neutral-900">
              Legend
            </text>
            <g transform="translate(10, 28)">
              <rect width="16" height="16" fill="#0ea5e9" rx="2" />
              <text x="22" y="12" className="text-xs fill-neutral-700">Occupied</text>
            </g>
            <g transform="translate(10, 48)">
              <rect width="16" height="16" fill="#e5e7eb" stroke="#9ca3af" rx="2" />
              <text x="22" y="12" className="text-xs fill-neutral-700">Available</text>
            </g>
          </g>
        </svg>
      </div>

      {/* Hover Card */}
      {hoveredStall && hoveredStall.isOccupied && hoveredStall.vendorName && (
        <div
          className="absolute z-10 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 max-w-xs pointer-events-none"
          style={{
            left: `${Math.min(hoverPosition.x, window.innerWidth - 340)}px`,
            top: `${Math.min(hoverPosition.y + 20, window.innerHeight - 200)}px`,
          }}
        >
          {hoveredStall.vendorImageUrl && (
            <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden mb-3">
              <img
                src={hoveredStall.vendorImageUrl}
                alt={hoveredStall.vendorName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h4 className="font-semibold text-neutral-900 mb-1">
            {hoveredStall.vendorName}
          </h4>
          {hoveredStall.vendorTagline && (
            <p className="text-sm text-neutral-600 mb-2">{hoveredStall.vendorTagline}</p>
          )}
          <div className="text-xs text-neutral-500 mb-3">
            Stall {hoveredStall.stallNumber}
          </div>
          <button
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              if (hoveredStall.vendorId) {
                window.location.href = `/markets/sellers/${hoveredStall.vendorId}`
              }
            }}
          >
            Order for Pickup
          </button>
        </div>
      )}

      {/* Stall List View (Mobile) */}
      <div className="lg:hidden mt-6 space-y-3">
        {stalls
          .filter((stall) => stall.isOccupied)
          .map((stall) => (
            <div
              key={stall.id}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200"
            >
              {stall.vendorImageUrl && (
                <div className="flex-shrink-0 w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden">
                  <img
                    src={stall.vendorImageUrl}
                    alt={stall.vendorName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-neutral-900">{stall.vendorName}</h4>
                {stall.vendorTagline && (
                  <p className="text-sm text-neutral-600 truncate">{stall.vendorTagline}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">Stall {stall.stallNumber}</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                Order
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}






