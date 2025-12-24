import type { SunTimes, ISSPass, ShowerInfo } from '../types'
import { GlassCard } from './GlassCard'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { calculateTimeUntil, formatTimeUntil, isBefore } from '../lib/timeUtils'

interface LiveCountdownsProps {
  sun: SunTimes
  issPass?: ISSPass
  meteorShower?: ShowerInfo
}

interface CountdownRowProps {
  icon: string
  label: string
  time: string | Date
  sublabel?: string
}

function CountdownRow({ icon, label, time, sublabel }: CountdownRowProps) {
  const now = useCurrentTime()
  const timeUntil = calculateTimeUntil(now, time)

  if (timeUntil.isPast) {
    return null
  }

  // Color based on urgency
  const getUrgencyColor = () => {
    if (timeUntil.totalSeconds < 300) return 'text-red-400' // < 5 minutes
    if (timeUntil.totalSeconds < 1800) return 'text-amber-400' // < 30 minutes
    if (timeUntil.totalSeconds < 3600) return 'text-yellow-400' // < 1 hour
    return 'text-emerald-400'
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label={label}>
          {icon}
        </span>
        <div>
          <div className="text-slate-200 font-medium">{label}</div>
          {sublabel && <div className="text-xs text-slate-500">{sublabel}</div>}
        </div>
      </div>
      <div className={`font-mono font-bold text-lg tabular-nums ${getUrgencyColor()}`}>
        {formatTimeUntil(timeUntil)}
      </div>
    </div>
  )
}

export function LiveCountdowns({ sun, issPass, meteorShower }: LiveCountdownsProps) {
  const now = useCurrentTime()

  // Determine which sun events to show
  const showSunrise = isBefore(now, sun.sunrise)
  const showSunset = isBefore(now, sun.sunset)
  const showTwilightEnd = isBefore(now, sun.astronomical_twilight_end)
  const showTwilightStart = isBefore(now, sun.astronomical_twilight_start)

  // Determine which ISS pass to show (next upcoming one)
  const showISSPass = issPass && isBefore(now, issPass.start_time)

  // Check if meteor shower is active or upcoming
  const showMeteorShower = meteorShower && isBefore(now, meteorShower.peak_date)

  // If nothing to show, don't render the card
  const hasCountdowns = showSunrise || showSunset || showTwilightEnd || showTwilightStart || showISSPass || showMeteorShower

  if (!hasCountdowns) {
    return null
  }

  return (
    <GlassCard title="⏱️ Live Countdowns">
      <div className="space-y-1">
        {showTwilightEnd && (
          <CountdownRow
            icon="🌅"
            label="Morning Twilight Ends"
            time={sun.astronomical_twilight_end}
            sublabel="True darkness ends"
          />
        )}

        {showSunrise && (
          <CountdownRow
            icon="🌄"
            label="Sunrise"
            time={sun.sunrise}
          />
        )}

        {showSunset && (
          <CountdownRow
            icon="🌇"
            label="Sunset"
            time={sun.sunset}
          />
        )}

        {showTwilightStart && (
          <CountdownRow
            icon="🌌"
            label="Dark Sky Begins"
            time={sun.astronomical_twilight_start}
            sublabel="Perfect for observing"
          />
        )}

        {showISSPass && issPass && (
          <CountdownRow
            icon="🛰️"
            label="ISS Pass"
            time={issPass.start_time}
            sublabel={`Max ${issPass.max_altitude}° altitude`}
          />
        )}

        {showMeteorShower && meteorShower && (
          <CountdownRow
            icon="☄️"
            label={`${meteorShower.name} Peak`}
            time={meteorShower.peak_date}
            sublabel={`${meteorShower.zhr} meteors/hour`}
          />
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
        <span>Updates every second</span>
        <span className="flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          LIVE
        </span>
      </div>
    </GlassCard>
  )
}
