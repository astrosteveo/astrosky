import type { SunTimes } from '../types'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { isBetween, isAfter, isBefore, calculateTimeUntil, formatTimeUntilCompact } from '../lib/timeUtils'

interface CurrentSkyStatusProps {
  sun: SunTimes
}

type SkyPhase = 'night' | 'morning-twilight' | 'day' | 'evening-twilight'

export function CurrentSkyStatus({ sun }: CurrentSkyStatusProps) {
  const now = useCurrentTime()

  // Determine current sky phase
  const getCurrentPhase = (): SkyPhase => {
    // Night (after evening twilight or before morning twilight)
    if (isAfter(now, sun.astronomical_twilight_start) || isBefore(now, sun.astronomical_twilight_end)) {
      return 'night'
    }
    // Morning twilight
    if (isBetween(now, sun.astronomical_twilight_end, sun.sunrise)) {
      return 'morning-twilight'
    }
    // Day
    if (isBetween(now, sun.sunrise, sun.sunset)) {
      return 'day'
    }
    // Evening twilight
    if (isBetween(now, sun.sunset, sun.astronomical_twilight_start)) {
      return 'evening-twilight'
    }
    return 'day'
  }

  const phase = getCurrentPhase()

  // Get next interesting time and message
  const getStatusInfo = () => {
    switch (phase) {
      case 'night': {
        // Calculate time until sunrise/twilight ends
        const untilMorningTwilight = calculateTimeUntil(now, sun.astronomical_twilight_end)
        if (!untilMorningTwilight.isPast) {
          return {
            icon: '🌙',
            title: 'Dark Sky - Perfect for Observing!',
            subtitle: `Twilight begins in ${formatTimeUntilCompact(untilMorningTwilight)}`,
            color: 'from-indigo-500/20 to-purple-500/20 border-purple-500/30'
          }
        }
        return {
          icon: '🌙',
          title: 'Dark Sky - Perfect for Observing!',
          subtitle: 'Optimal viewing conditions',
          color: 'from-indigo-500/20 to-purple-500/20 border-purple-500/30'
        }
      }
      case 'morning-twilight': {
        const untilSunrise = calculateTimeUntil(now, sun.sunrise)
        return {
          icon: '🌆',
          title: 'Morning Twilight',
          subtitle: `Sunrise in ${formatTimeUntilCompact(untilSunrise)}`,
          color: 'from-orange-500/20 to-amber-500/20 border-amber-500/30'
        }
      }
      case 'day': {
        const untilSunset = calculateTimeUntil(now, sun.sunset)
        return {
          icon: '☀️',
          title: 'Daylight',
          subtitle: `Sunset in ${formatTimeUntilCompact(untilSunset)}`,
          color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30'
        }
      }
      case 'evening-twilight': {
        const untilDark = calculateTimeUntil(now, sun.astronomical_twilight_start)
        return {
          icon: '🌇',
          title: 'Evening Twilight',
          subtitle: `Dark sky in ${formatTimeUntilCompact(untilDark)}`,
          color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/30'
        }
      }
    }
  }

  const status = getStatusInfo()

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${status.color} backdrop-blur-sm p-4 mb-6 transition-all duration-500`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl" role="img" aria-label={status.title}>
          {status.icon}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-slate-50">
            {status.title}
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            {status.subtitle}
          </p>
        </div>
        <div className="text-right text-slate-400 text-xs">
          <div className="animate-pulse">● LIVE</div>
        </div>
      </div>
    </div>
  )
}
