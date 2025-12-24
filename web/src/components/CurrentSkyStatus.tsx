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
    gradient: 'from-indigo-600/30 via-purple-600/20 to-violet-600/30',
    border: 'border-purple-500/40',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.2)]',
    accentColor: 'text-purple-300',
  },
  'morning-twilight': {
    icon: '🌅',
    gradient: 'from-orange-500/30 via-amber-500/20 to-yellow-500/30',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_60px_rgba(251,191,36,0.2)]',
    accentColor: 'text-amber-300',
  },
  day: {
    icon: '☀️',
    gradient: 'from-sky-500/30 via-blue-500/20 to-cyan-500/30',
    border: 'border-sky-500/40',
    glow: 'shadow-[0_0_60px_rgba(56,189,248,0.2)]',
    accentColor: 'text-sky-300',
  },
  'evening-twilight': {
    icon: '🌇',
    gradient: 'from-violet-500/30 via-purple-500/20 to-indigo-500/30',
    border: 'border-violet-500/40',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.2)]',
    accentColor: 'text-violet-300',
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
            subtitle: `Dark sky for ${formatTimeUntilCompact(untilMorningTwilight)}`,
          }
        }
        return {
          title: 'Perfect for Observing',
          subtitle: 'Optimal viewing conditions',
        }
      }
      case 'morning-twilight': {
        const untilSunrise = calculateTimeUntil(now, sun.sunrise)
        return {
          title: 'Morning Twilight',
          subtitle: `Sunrise in ${formatTimeUntilCompact(untilSunrise)}`,
        }
      }
      case 'day': {
        const untilSunset = calculateTimeUntil(now, sun.sunset)
        return {
          title: 'Daytime',
          subtitle: `Sunset in ${formatTimeUntilCompact(untilSunset)}`,
        }
      }
      case 'evening-twilight': {
        const untilDark = calculateTimeUntil(now, sun.astronomical_twilight_start)
        return {
          title: 'Evening Twilight',
          subtitle: `Dark sky in ${formatTimeUntilCompact(untilDark)}`,
        }
      }
    }
  }

  const status = getStatusInfo()

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        border ${config.border}
        bg-gradient-to-r ${config.gradient}
        backdrop-blur-xl
        ${config.glow}
        p-5 mb-2
      `}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
          ease: 'easeInOut',
        }}
      />

      <div className="relative flex items-center gap-5">
        {/* Animated icon */}
        <motion.div
          className="text-5xl"
          role="img"
          aria-label={status.title}
          animate={{
            scale: [1, 1.05, 1],
            rotate: phase === 'night' ? [0, 5, 0, -5, 0] : 0,
          }}
          transition={{
            duration: phase === 'night' ? 4 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {config.icon}
        </motion.div>

        <div className="flex-1">
          <h2 className="font-display text-2xl font-bold text-slate-50">
            {status.title}
          </h2>
          <p className={`${config.accentColor} text-sm mt-1 font-medium`}>
            {status.subtitle}
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <motion.span
            className="relative flex h-2.5 w-2.5"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </motion.span>
          <span className="text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
      </div>
    </motion.div>
  )
}
