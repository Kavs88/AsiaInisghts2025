'use client'

import RSVPAction from './RSVPAction'

interface MobileRSVPBarProps {
  eventId: string
  marketDayId?: string
}

export default function MobileRSVPBar({ eventId, marketDayId }: MobileRSVPBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg p-4 safe-area-bottom">
      <RSVPAction
        eventId={eventId}
        marketDayId={marketDayId}
      />
    </div>
  )
}





