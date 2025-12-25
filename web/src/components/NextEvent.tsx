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
  accent: string
  glow: string
}

const eventStyles: Record<string, { accent: string; glow: string }> = {
  sunrise: {
    accent: '#fbbf24',
    glow: 'rgba(251,191,36,0.15)',
  },
  sunset: {
    accent: '#a855f7',
    glow: 'rgba(168,85,247,0.15)',
  },
  'dark-sky': {
    accent: '#4ecdc4',
    glow: 'rgba(78,205,196,0.15)',
  },
  iss: {
    accent: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
  },
  meteor: {
    accent: '#e25822',
    glow: 'rgba(226,88,34,0.15)',
  },
  'astro-event': {
    accent: '#c9a227',
    glow: 'rgba(201,162,39,0.15)',
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

  // ISS Pass
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
        subtitle: `Peak: ${shower.zhr} meteors/hour`,
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
  const maxSeconds = 86400
  const progress = Math.max(0, Math.min(1, 1 - timeUntil.totalSeconds / maxSeconds))

  // Split time for animated display
  const hours = Math.floor(timeUntil.totalSeconds / 3600)
  const minutes = Math.floor((timeUntil.totalSeconds % 3600) / 60)
  const seconds = timeUntil.totalSeconds % 60

  return (
    <motion.div
      className="observatory-card p-6 relative overflow-hidden"
      style={{
        borderColor: `${nextEvent.accent}30`,
        boxShadow: `0 0 60px ${nextEvent.glow}, 0 4px 24px rgba(0,0,0,0.4)`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${nextEvent.accent}08 0%, transparent 50%)`,
        }}
      />

      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(110deg, transparent 30%, rgba(245,240,225,0.02) 50%, transparent 70%)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatDelay: 4,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Large animated progress ring with icon */}
          <div className="relative flex-shrink-0 hidden sm:block">
            <ProgressRing
              progress={progress}
              size={80}
              strokeWidth={4}
              color={nextEvent.accent}
              bgColor="rgba(201,162,39,0.1)"
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${nextEvent.accent}15 0%, transparent 100%)`,
                  border: `1px solid ${nextEvent.accent}30`,
                }}
              >
                <span className="text-2xl" role="img" aria-label={nextEvent.title}>
                  {nextEvent.icon}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 min-w-0 w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded flex-shrink-0"
                style={{
                  color: nextEvent.accent,
                  background: `${nextEvent.accent}10`,
                  border: `1px solid ${nextEvent.accent}20`,
                }}
              >
                Next Event
              </span>
              <span className="text-xs text-[#c4baa6]/60 font-mono truncate">
                {new Date(nextEvent.time).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })} at {new Date(nextEvent.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Event title */}
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f5f0e1] mb-1 truncate">
              {nextEvent.title}
            </h2>
            <p className="text-[#c4baa6] text-sm mb-3 line-clamp-1">
              {nextEvent.subtitle}
            </p>

            {/* Animated countdown */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="data-label flex-shrink-0">Starts in</span>
              <div className="font-mono font-bold text-xl sm:text-2xl tabular-nums flex items-center gap-0.5" style={{ color: nextEvent.accent }}>
                {hours > 0 && (
                  <>
                    <AnimatedDigit value={hours} color={nextEvent.accent} />
                    <span className="text-[#c4baa6]/40 text-sm sm:text-lg">h</span>
                  </>
                )}
                <AnimatedDigit value={minutes} color={nextEvent.accent} />
                <span className="text-[#c4baa6]/40 text-sm sm:text-lg">m</span>
                <AnimatedDigit value={seconds} color={nextEvent.accent} />
                <span className="text-[#c4baa6]/40 text-sm sm:text-lg">s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4 status-live">
        <span>Live</span>
      </div>

      {/* Decorative corner */}
      <svg className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none rotate-180" viewBox="0 0 80 80">
        <path
          d="M80 0 L80 16 L64 16 L64 32 L48 32 L48 48 L32 48 L32 64 L16 64 L16 80"
          fill="none"
          stroke={nextEvent.accent}
          strokeWidth="0.5"
          opacity="0.15"
        />
      </svg>
    </motion.div>
  )
}

// Animated digit for countdown
function AnimatedDigit({ value, color }: { value: number; color: string }) {
  const displayValue = value.toString().padStart(2, '0')
  return (
    <span className="relative inline-flex overflow-hidden" style={{ minWidth: '1.5em' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayValue}
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ color }}
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
