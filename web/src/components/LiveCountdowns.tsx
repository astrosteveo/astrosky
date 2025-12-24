import type { SunTimes, ISSPass, ShowerInfo } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { ProgressRing } from './motion'
import { calculateTimeUntil, isBefore } from '../lib/timeUtils'

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
  maxSeconds?: number
}

function CountdownRow({ icon, label, time, sublabel, maxSeconds = 86400 }: CountdownRowProps) {
  const now = useCurrentTime()
  const timeUntil = calculateTimeUntil(now, time)

  if (timeUntil.isPast) {
    return null
  }

  // Color based on urgency
  const getUrgencyColor = () => {
    if (timeUntil.totalSeconds < 300) return { text: 'text-red-400', ring: '#f87171', glow: 'shadow-red-500/20' }
    if (timeUntil.totalSeconds < 1800) return { text: 'text-amber-400', ring: '#fbbf24', glow: 'shadow-amber-500/20' }
    if (timeUntil.totalSeconds < 3600) return { text: 'text-yellow-400', ring: '#facc15', glow: 'shadow-yellow-500/20' }
    return { text: 'text-emerald-400', ring: '#34d399', glow: 'shadow-emerald-500/20' }
  }

  const urgency = getUrgencyColor()
  const progress = Math.max(0, Math.min(1, 1 - timeUntil.totalSeconds / maxSeconds))

  // Split the time for animated digits
  const hours = Math.floor(timeUntil.totalSeconds / 3600)
  const minutes = Math.floor((timeUntil.totalSeconds % 3600) / 60)
  const seconds = timeUntil.totalSeconds % 60

  return (
    <motion.div
      className={`
        flex items-center justify-between py-3 px-4 -mx-4
        border-b border-white/5 last:border-0
        hover:bg-white/[0.02] transition-colors rounded-lg
        ${timeUntil.totalSeconds < 300 ? 'shadow-lg ' + urgency.glow : ''}
      `}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      layout
    >
      <div className="flex items-center gap-4">
        {/* Progress ring with icon */}
        <div className="relative">
          <ProgressRing
            progress={progress}
            size={44}
            strokeWidth={3}
            color={urgency.ring}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-xl"
            role="img"
            aria-label={label}
          >
            {icon}
          </span>
        </div>

        <div>
          <div className="text-slate-200 font-medium">{label}</div>
          {sublabel && <div className="text-xs text-slate-500">{sublabel}</div>}
        </div>
      </div>

      {/* Animated countdown display */}
      <div className={`font-mono font-bold text-lg tabular-nums flex items-center gap-0.5 ${urgency.text}`}>
        {hours > 0 && (
          <>
            <AnimatedDigit value={hours} />
            <span className="text-slate-600">h</span>
            <span className="w-1" />
          </>
        )}
        <AnimatedDigit value={minutes} />
        <span className="text-slate-600">m</span>
        <span className="w-1" />
        <AnimatedDigit value={seconds} />
        <span className="text-slate-600">s</span>
      </div>
    </motion.div>
  )
}

// Animated digit component with flip effect
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
    <GlassCard glowColor="emerald">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-slate-50">
          Live Countdowns
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <motion.span
            className="relative flex h-2 w-2"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </motion.span>
          <span className="text-emerald-400 font-medium uppercase tracking-wider">Live</span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-1">
          {showTwilightEnd && (
            <CountdownRow
              icon="🌅"
              label="Twilight Ends"
              time={sun.astronomical_twilight_end}
              sublabel="Darkness fading"
              maxSeconds={7200}
            />
          )}

          {showSunrise && (
            <CountdownRow
              icon="🌄"
              label="Sunrise"
              time={sun.sunrise}
              maxSeconds={43200}
            />
          )}

          {showSunset && (
            <CountdownRow
              icon="🌇"
              label="Sunset"
              time={sun.sunset}
              maxSeconds={43200}
            />
          )}

          {showTwilightStart && (
            <CountdownRow
              icon="🌌"
              label="Dark Sky Begins"
              time={sun.astronomical_twilight_start}
              sublabel="Perfect for observing"
              maxSeconds={7200}
            />
          )}

          {showISSPass && issPass && (
            <CountdownRow
              icon="🛰️"
              label="ISS Pass"
              time={issPass.start_time}
              sublabel={`Max ${issPass.max_altitude}° • Mag ${issPass.brightness}`}
              maxSeconds={86400}
            />
          )}

          {showMeteorShower && meteorShower && (
            <CountdownRow
              icon="☄️"
              label={`${meteorShower.name} Peak`}
              time={meteorShower.peak_date}
              sublabel={`Up to ${meteorShower.zhr}/hour`}
              maxSeconds={604800}
            />
          )}
        </div>
      </AnimatePresence>
    </GlassCard>
  )
}
