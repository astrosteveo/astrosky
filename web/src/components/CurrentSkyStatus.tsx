import type { SunTimes } from '../types'
import { motion } from 'framer-motion'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { isBetween, isAfter, isBefore, calculateTimeUntil, formatTimeUntilCompact } from '../lib/timeUtils'

interface CurrentSkyStatusProps {
  sun: SunTimes
}

type SkyPhase = 'night' | 'morning-twilight' | 'day' | 'evening-twilight'

const phaseConfig = {
  night: {
    icon: '🌙',
    label: 'Night Sky',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(78,205,196,0.08) 50%, rgba(201,162,39,0.05) 100%)',
    border: 'rgba(168,85,247,0.3)',
    glow: '0 0 60px rgba(168,85,247,0.15), 0 0 120px rgba(78,205,196,0.08)',
    accent: '#a855f7',
  },
  'morning-twilight': {
    icon: '🌅',
    label: 'Morning Twilight',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(226,88,34,0.1) 50%, rgba(201,162,39,0.05) 100%)',
    border: 'rgba(251,191,36,0.3)',
    glow: '0 0 60px rgba(251,191,36,0.15), 0 0 120px rgba(226,88,34,0.08)',
    accent: '#fbbf24',
  },
  day: {
    icon: '☀️',
    label: 'Daytime',
    gradient: 'linear-gradient(135deg, rgba(78,205,196,0.15) 0%, rgba(251,191,36,0.08) 50%, rgba(201,162,39,0.05) 100%)',
    border: 'rgba(78,205,196,0.3)',
    glow: '0 0 60px rgba(78,205,196,0.15), 0 0 120px rgba(251,191,36,0.08)',
    accent: '#4ecdc4',
  },
  'evening-twilight': {
    icon: '🌇',
    label: 'Evening Twilight',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(226,88,34,0.1) 50%, rgba(201,162,39,0.05) 100%)',
    border: 'rgba(168,85,247,0.3)',
    glow: '0 0 60px rgba(168,85,247,0.15), 0 0 120px rgba(226,88,34,0.08)',
    accent: '#a855f7',
  },
}

export function CurrentSkyStatus({ sun }: CurrentSkyStatusProps) {
  const now = useCurrentTime()

  // Determine current sky phase
  const getCurrentPhase = (): SkyPhase => {
    if (isAfter(now, sun.astronomical_twilight_start) || isBefore(now, sun.astronomical_twilight_end)) {
      return 'night'
    }
    if (isBetween(now, sun.astronomical_twilight_end, sun.sunrise)) {
      return 'morning-twilight'
    }
    if (isBetween(now, sun.sunrise, sun.sunset)) {
      return 'day'
    }
    if (isBetween(now, sun.sunset, sun.astronomical_twilight_start)) {
      return 'evening-twilight'
    }
    return 'day'
  }

  const phase = getCurrentPhase()
  const config = phaseConfig[phase]

  // Get next interesting time and message
  const getStatusInfo = () => {
    switch (phase) {
      case 'night': {
        const untilMorningTwilight = calculateTimeUntil(now, sun.astronomical_twilight_end)
        if (!untilMorningTwilight.isPast) {
          return {
            title: 'Perfect for Observing',
            subtitle: `Dark sky continues for ${formatTimeUntilCompact(untilMorningTwilight)}`,
            quality: 'excellent',
          }
        }
        return {
          title: 'Perfect for Observing',
          subtitle: 'Optimal viewing conditions',
          quality: 'excellent',
        }
      }
      case 'morning-twilight': {
        const untilSunrise = calculateTimeUntil(now, sun.sunrise)
        return {
          title: 'Dawn Approaching',
          subtitle: `Sunrise in ${formatTimeUntilCompact(untilSunrise)}`,
          quality: 'fair',
        }
      }
      case 'day': {
        const untilSunset = calculateTimeUntil(now, sun.sunset)
        return {
          title: 'Daytime',
          subtitle: `Sunset in ${formatTimeUntilCompact(untilSunset)}`,
          quality: 'poor',
        }
      }
      case 'evening-twilight': {
        const untilDark = calculateTimeUntil(now, sun.astronomical_twilight_start)
        return {
          title: 'Dusk Deepening',
          subtitle: `True darkness in ${formatTimeUntilCompact(untilDark)}`,
          quality: 'good',
        }
      }
    }
  }

  const status = getStatusInfo()

  const qualityColors: Record<string, string> = {
    excellent: '#34d399',
    good: '#4ecdc4',
    fair: '#fbbf24',
    poor: '#c4baa6',
  }

  return (
    <motion.div
      className="observatory-card p-6 relative overflow-hidden"
      style={{
        background: config.gradient,
        borderColor: config.border,
        boxShadow: config.glow,
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated shimmer effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(110deg, transparent 30%, rgba(245,240,225,0.03) 50%, transparent 70%)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 6,
          ease: 'easeInOut',
        }}
      />

      {/* Decorative corner elements */}
      <svg className="absolute top-0 right-0 w-24 h-24 pointer-events-none" viewBox="0 0 96 96">
        <path
          d="M96 0 L96 24 L72 24 L72 48 L48 48 L48 72 L24 72 L24 96"
          fill="none"
          stroke={config.accent}
          strokeWidth="0.5"
          opacity="0.2"
        />
        <circle cx="88" cy="8" r="2" fill={config.accent} opacity="0.4" />
        <circle cx="76" cy="8" r="1.5" fill={config.accent} opacity="0.3" />
      </svg>

      <div className="relative flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6">
        {/* Animated phase icon */}
        <motion.div
          className="relative flex-shrink-0"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Icon glow */}
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, ${config.accent}40 0%, transparent 70%)`,
              transform: 'scale(1.5)',
            }}
          />
          {/* Icon container */}
          <div
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${config.accent}20 0%, ${config.accent}05 100%)`,
              border: `2px solid ${config.accent}40`,
              boxShadow: `inset 0 0 20px ${config.accent}10`,
            }}
          >
            <span className="text-2xl sm:text-3xl" role="img" aria-label={status.title}>
              {config.icon}
            </span>
          </div>
        </motion.div>

        {/* Status content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f5f0e1]">
              {status.title}
            </h2>
            <span
              className="font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
              style={{
                color: qualityColors[status.quality],
                background: `${qualityColors[status.quality]}15`,
                border: `1px solid ${qualityColors[status.quality]}30`,
              }}
            >
              {status.quality}
            </span>
          </div>
          <p className="text-[#c4baa6] text-sm sm:text-base">
            {status.subtitle}
          </p>
        </div>

        {/* Live indicator */}
        <div className="status-live absolute top-0 right-0 sm:static">
          <span>Live</span>
        </div>
      </div>

      {/* Phase indicator bar */}
      <div className="mt-5 pt-4 border-t border-[#c9a227]/10">
        <div className="flex items-center gap-1">
          {(['night', 'morning-twilight', 'day', 'evening-twilight'] as SkyPhase[]).map((p) => (
            <div
              key={p}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: p === phase
                  ? `linear-gradient(90deg, ${phaseConfig[p].accent}, ${phaseConfig[p].accent}80)`
                  : 'rgba(201,162,39,0.1)',
                boxShadow: p === phase ? `0 0 8px ${phaseConfig[p].accent}60` : 'none',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-mono text-[#c4baa6]/50 uppercase tracking-wider">
          <span>Night</span>
          <span>Dawn</span>
          <span>Day</span>
          <span>Dusk</span>
        </div>
      </div>
    </motion.div>
  )
}
