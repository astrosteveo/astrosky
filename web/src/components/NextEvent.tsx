import type { SkyReport } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { ProgressRing } from './motion'
import { calculateTimeUntil, isBefore } from '../lib/timeUtils'

interface NextEventProps {
  data: SkyReport
}

interface EventInfo {
  type: string
  icon: string
  title: string
  subtitle: string
  time: string | Date
  gradient: string
  border: string
  glow: string
  ringColor: string
}

const eventStyles: Record<string, Omit<EventInfo, 'type' | 'icon' | 'title' | 'subtitle' | 'time'>> = {
  sunrise: {
    gradient: 'from-orange-500/25 via-amber-500/15 to-yellow-500/25',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_80px_rgba(251,191,36,0.15)]',
    ringColor: '#fbbf24',
  },
  sunset: {
    gradient: 'from-violet-500/25 via-purple-500/15 to-fuchsia-500/25',
    border: 'border-purple-500/40',
    glow: 'shadow-[0_0_80px_rgba(168,85,247,0.15)]',
    ringColor: '#a855f7',
  },
  'dark-sky': {
    gradient: 'from-indigo-500/25 via-blue-500/15 to-cyan-500/25',
    border: 'border-blue-500/40',
    glow: 'shadow-[0_0_80px_rgba(59,130,246,0.15)]',
    ringColor: '#3b82f6',
  },
  iss: {
    gradient: 'from-cyan-500/25 via-sky-500/15 to-teal-500/25',
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_0_80px_rgba(34,211,238,0.15)]',
    ringColor: '#22d3ee',
  },
  meteor: {
    gradient: 'from-yellow-500/25 via-orange-500/15 to-red-500/25',
    border: 'border-yellow-500/40',
    glow: 'shadow-[0_0_80px_rgba(250,204,21,0.15)]',
    ringColor: '#facc15',
  },
  'astro-event': {
    gradient: 'from-pink-500/25 via-rose-500/15 to-red-500/25',
    border: 'border-pink-500/40',
    glow: 'shadow-[0_0_80px_rgba(236,72,153,0.15)]',
    ringColor: '#ec4899',
  },
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
      ...eventStyles.sunrise,
    })
  }

  if (isBefore(now, data.sun.sunset)) {
    upcomingEvents.push({
      type: 'sunset',
      icon: '🌇',
      title: 'Sunset',
      subtitle: 'Evening begins',
      time: data.sun.sunset,
      ...eventStyles.sunset,
    })
  }

  if (isBefore(now, data.sun.astronomical_twilight_start)) {
    upcomingEvents.push({
      type: 'dark-sky',
      icon: '🌌',
      title: 'Dark Sky Begins',
      subtitle: 'Perfect for deep sky observing',
      time: data.sun.astronomical_twilight_start,
      ...eventStyles['dark-sky'],
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
        ...eventStyles.iss,
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
        ...eventStyles.meteor,
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
        ...eventStyles['astro-event'],
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

  // Progress for the ring (assuming max 24 hours to next event)
  const maxSeconds = 86400 // 24 hours
  const progress = Math.max(0, Math.min(1, 1 - timeUntil.totalSeconds / maxSeconds))

  // Split time for animated display
  const hours = Math.floor(timeUntil.totalSeconds / 3600)
  const minutes = Math.floor((timeUntil.totalSeconds % 3600) / 60)
  const seconds = timeUntil.totalSeconds % 60

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        border ${nextEvent.border}
        bg-gradient-to-br ${nextEvent.gradient}
        backdrop-blur-xl
        ${nextEvent.glow}
        p-6
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start gap-5">
          {/* Large animated progress ring with icon */}
          <div className="relative flex-shrink-0">
            <ProgressRing
              progress={progress}
              size={80}
              strokeWidth={4}
              color={nextEvent.ringColor}
            />
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-4xl"
              role="img"
              aria-label={nextEvent.title}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {nextEvent.icon}
            </motion.span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                Next Event
              </span>
              <span className="text-xs text-slate-500">
                {new Date(nextEvent.time).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-50 mb-1 truncate">
              {nextEvent.title}
            </h2>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
              {nextEvent.subtitle}
            </p>

            {/* Animated countdown */}
            <div className="flex items-baseline gap-3">
              <span className="text-slate-500 text-sm">Starts in</span>
              <div className="font-mono font-bold text-2xl text-emerald-400 tabular-nums flex items-center gap-1">
                {hours > 0 && (
                  <>
                    <AnimatedDigit value={hours} />
                    <span className="text-slate-600 text-lg">h</span>
                  </>
                )}
                <AnimatedDigit value={minutes} />
                <span className="text-slate-600 text-lg">m</span>
                <AnimatedDigit value={seconds} />
                <span className="text-slate-600 text-lg">s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <motion.span
          className="relative flex h-2.5 w-2.5"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </motion.span>
        <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Live</span>
      </div>
    </motion.div>
  )
}

// Animated digit for countdown
function AnimatedDigit({ value }: { value: number }) {
  const displayValue = value.toString().padStart(2, '0')
  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayValue}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
