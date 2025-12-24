import type { SunTimes } from '../types'
import { GlassCard } from './GlassCard'

interface SunTimesCardProps {
  sun: SunTimes
}

export function SunTimesCard({ sun }: SunTimesCardProps) {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <GlassCard title="Sun & Twilight">
      <div className="grid grid-cols-2 gap-4">
        {/* Sunrise & Sunset */}
        <div className="space-y-1">
          <span className="text-slate-500 text-sm">Sunrise</span>
          <p className="text-slate-50 font-medium text-lg">
            {formatTime(sun.sunrise)}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-500 text-sm">Sunset</span>
          <p className="text-slate-50 font-medium text-lg">
            {formatTime(sun.sunset)}
          </p>
        </div>

        {/* Astronomical Twilight */}
        <div className="space-y-1">
          <span className="text-slate-500 text-sm">Morning Twilight Ends</span>
          <p className="text-slate-50 font-medium">
            {formatTime(sun.astronomical_twilight_end)}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-500 text-sm">Evening Twilight Starts</span>
          <p className="text-slate-50 font-medium">
            {formatTime(sun.astronomical_twilight_start)}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-sm text-slate-400">
          <span className="text-amber-400">★</span> Astronomical twilight marks true darkness for observing
        </p>
      </div>
    </GlassCard>
  )
}
