import type { SkyReport } from '../types'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { calculateTimeUntil, formatTimeUntil, isBefore } from '../lib/timeUtils'

interface NextEventProps {
  data: SkyReport
}

interface EventInfo {
  type: string
  icon: string
  title: string
  subtitle: string
  time: string | Date
  color: string
}

export function NextEvent({ data }: NextEventProps) {
  const now = useCurrentTime()

  // Collect all upcoming events
  const upcomingEvents: EventInfo[] = []

  // Sun events
  if (isBefore(now, data.sun.sunrise)) {
    upcomingEvents.push({
      type: 'sunrise',
      icon: '🌄',
      title: 'Sunrise',
      subtitle: 'Day begins',
      time: data.sun.sunrise,
      color: 'from-orange-500/30 to-amber-500/30 border-amber-500/40'
    })
  }

  if (isBefore(now, data.sun.sunset)) {
    upcomingEvents.push({
      type: 'sunset',
      icon: '🌇',
      title: 'Sunset',
      subtitle: 'Evening begins',
      time: data.sun.sunset,
      color: 'from-violet-500/30 to-purple-500/30 border-purple-500/40'
    })
  }

  if (isBefore(now, data.sun.astronomical_twilight_start)) {
    upcomingEvents.push({
      type: 'dark-sky',
      icon: '🌌',
      title: 'Dark Sky Begins',
      subtitle: 'Perfect for deep sky observing',
      time: data.sun.astronomical_twilight_start,
      color: 'from-indigo-500/30 to-blue-500/30 border-blue-500/40'
    })
  }

  // ISS Pass (show only the next one)
  if (data.iss_passes.length > 0) {
    const nextPass = data.iss_passes.find(pass => isBefore(now, pass.start_time))
    if (nextPass) {
      upcomingEvents.push({
        type: 'iss',
        icon: '🛰️',
        title: 'ISS Pass',
        subtitle: `Max altitude ${nextPass.max_altitude}° • ${nextPass.brightness}`,
        time: nextPass.start_time,
        color: 'from-cyan-500/30 to-sky-500/30 border-cyan-500/40'
      })
    }
  }

  // Meteor Showers
  data.meteors.forEach(shower => {
    if (isBefore(now, shower.peak_date)) {
      upcomingEvents.push({
        type: 'meteor',
        icon: '☄️',
        title: shower.name,
        subtitle: `Peak: ${shower.zhr} meteors/hour from ${shower.radiant_constellation}`,
        time: shower.peak_date,
        color: 'from-yellow-500/30 to-orange-500/30 border-yellow-500/40'
      })
    }
  })

  // Astronomical Events
  data.events.forEach(event => {
    if (isBefore(now, event.date)) {
      upcomingEvents.push({
        type: 'astro-event',
        icon: '✨',
        title: event.title,
        subtitle: event.description,
        time: event.date,
        color: 'from-pink-500/30 to-rose-500/30 border-pink-500/40'
      })
    }
  })

  // Sort by time and get the next one
  upcomingEvents.sort((a, b) => {
    const aTime = new Date(a.time).getTime()
    const bTime = new Date(b.time).getTime()
    return aTime - bTime
  })

  const nextEvent = upcomingEvents[0]

  if (!nextEvent) {
    return null
  }

  const timeUntil = calculateTimeUntil(now, nextEvent.time)

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${nextEvent.color} backdrop-blur-sm p-6 transition-all duration-500`}>
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="text-5xl" role="img" aria-label={nextEvent.title}>
            {nextEvent.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="font-display text-sm uppercase tracking-wider text-slate-400">
                Next Event
              </h3>
              <span className="text-xs text-slate-500">
                {new Date(nextEvent.time).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-50 mb-2">
              {nextEvent.title}
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              {nextEvent.subtitle}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 text-sm">Starts in</span>
              <span className="font-mono font-bold text-2xl text-emerald-400 tabular-nums">
                {formatTimeUntil(timeUntil)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-slate-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        LIVE
      </div>
    </div>
  )
}
