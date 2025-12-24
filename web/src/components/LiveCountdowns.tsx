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
  const getUrgencyConfig = () => {
    if (timeUntil.totalSeconds < 300) return { color: '#ef4444', glow: 'rgba(239,68,68,0.15)' }
    if (timeUntil.totalSeconds < 1800) return { color: '#fbbf24', glow: 'rgba(251,191,36,0.15)' }
    if (timeUntil.totalSeconds < 3600) return { color: '#facc15', glow: 'rgba(250,204,21,0.15)' }
    return { color: '#34d399', glow: 'rgba(52,211,153,0.15)' }
  }

  const urgency = getUrgencyConfig()
  const progress = Math.max(0, Math.min(1, 1 - timeUntil.totalSeconds / maxSeconds))

  const hours = Math.floor(timeUntil.totalSeconds / 3600)
  const minutes = Math.floor((timeUntil.totalSeconds % 3600) / 60)
  const seconds = timeUntil.totalSeconds % 60

  return (
    <motion.div
      className="flex items-center justify-between py-3 px-4 -mx-4 rounded-lg transition-colors hover:bg-[rgba(201,162,39,0.03)]"
      style={{
        borderBottom: '1px solid rgba(201,162,39,0.08)',
        boxShadow: timeUntil.totalSeconds < 300 ? `0 0 20px ${urgency.glow}` : 'none',
      }}
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
            color={urgency.color}
            bgColor="rgba(201,162,39,0.1)"
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-lg"
            role="img"
            aria-label={label}
          >
            {icon}
          </span>
        </div>

        <div>
          <div className="text-[#f5f0e1] font-medium">{label}</div>
          {sublabel && <div className="text-xs text-[#c4baa6]/60 font-mono">{sublabel}</div>}
        </div>
      </div>

      {/* Animated countdown display */}
      <div className="font-mono font-bold text-lg tabular-nums flex items-center gap-0.5" style={{ color: urgency.color }}>
        {hours > 0 && (
          <>
            <AnimatedDigit value={hours} color={urgency.color} />
            <span className="text-[#c4baa6]/40 text-sm">h</span>
            <span className="w-1" />
          </>
        )}
        <AnimatedDigit value={minutes} color={urgency.color} />
        <span className="text-[#c4baa6]/40 text-sm">m</span>
        <span className="w-1" />
        <AnimatedDigit value={seconds} color={urgency.color} />
        <span className="text-[#c4baa6]/40 text-sm">s</span>
      </div>
    </motion.div>
  )
}

// Animated digit component
function AnimatedDigit({ value, color }: { value: number; color: string }) {
  const displayValue = value.toString().padStart(2, '0')
  return (
    <span className="relative inline-flex overflow-hidden" style={{ minWidth: '1.2em' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayValue}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ color }}
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

  // Determine which ISS pass to show
  const showISSPass = issPass && isBefore(now, issPass.start_time)

  // Check if meteor shower is upcoming
  const showMeteorShower = meteorShower && isBefore(now, meteorShower.peak_date)

  // If nothing to show, don't render the card
  const hasCountdowns = showSunrise || showSunset || showTwilightEnd || showTwilightStart || showISSPass || showMeteorShower

  if (!hasCountdowns) {
    return null
  }

  return (
    <GlassCard glowColor="success">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.05) 100%)',
              border: '1px solid rgba(52,211,153,0.3)',
            }}
          >
            <span className="text-sm">⏱️</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-[#f5f0e1]">
              Live Countdowns
            </h2>
            <div
              className="mt-1 h-px w-12"
              style={{
                background: 'linear-gradient(90deg, #34d399 0%, transparent 100%)',
              }}
            />
          </div>
        </div>
        <div className="status-live">
          <span>Live</span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-0">
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
              sublabel={`Max ${issPass.max_altitude}° • ${issPass.brightness}`}
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
