import type { SunTimes } from '../types'
import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

interface SunTimesCardProps {
  sun: SunTimes
}

// Beautiful horizon arc visualization
function HorizonArc({ sun }: { sun: SunTimes }) {
  const formatHour = (isoString: string | null) => {
    if (!isoString) return 0
    return new Date(isoString).getHours() + new Date(isoString).getMinutes() / 60
  }

  const sunriseHour = formatHour(sun.sunrise)
  const sunsetHour = formatHour(sun.sunset)
  const twilightEndHour = formatHour(sun.astronomical_twilight_end)
  const twilightStartHour = formatHour(sun.astronomical_twilight_start)

  // Map hours to arc positions (0-180 degrees)
  const hourToAngle = (hour: number) => {
    // Map 0-24 hours to 0-180 degrees on the arc
    const normalized = ((hour - 4) / 16) * 180 // 4am to 8pm range
    return Math.max(0, Math.min(180, normalized))
  }

  const sunriseAngle = hourToAngle(sunriseHour)
  const sunsetAngle = hourToAngle(sunsetHour)
  const twilightEndAngle = hourToAngle(twilightEndHour)
  const twilightStartAngle = hourToAngle(twilightStartHour)

  // Get current sun position
  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const currentAngle = hourToAngle(currentHour)
  const isDay = currentHour >= sunriseHour && currentHour <= sunsetHour

  // Convert angle to SVG coordinates on the arc
  const angleToPoint = (angle: number, radius: number) => {
    const rad = ((180 - angle) * Math.PI) / 180
    return {
      x: 100 + radius * Math.cos(rad),
      y: 80 - radius * Math.sin(rad),
    }
  }

  const sunPos = angleToPoint(currentAngle, 60)

  return (
    <svg viewBox="0 0 200 100" className="w-full h-24">
      <defs>
        {/* Sky gradients */}
        <linearGradient id="dayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ecdc4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4ecdc4" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="twilightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizon line */}
      <line
        x1="10" y1="80" x2="190" y2="80"
        stroke="#c9a227"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Night arc sections (twilight zones) */}
      <path
        d={`M ${angleToPoint(0, 60).x} ${angleToPoint(0, 60).y}
            A 60 60 0 0 1 ${angleToPoint(twilightEndAngle, 60).x} ${angleToPoint(twilightEndAngle, 60).y}`}
        fill="url(#twilightGradient)"
        opacity="0.5"
      />
      <path
        d={`M ${angleToPoint(twilightStartAngle, 60).x} ${angleToPoint(twilightStartAngle, 60).y}
            A 60 60 0 0 1 ${angleToPoint(180, 60).x} ${angleToPoint(180, 60).y}`}
        fill="url(#twilightGradient)"
        opacity="0.5"
      />

      {/* Day arc (sun up) */}
      <path
        d={`M ${angleToPoint(sunriseAngle, 60).x} ${angleToPoint(sunriseAngle, 60).y}
            A 60 60 0 0 1 ${angleToPoint(sunsetAngle, 60).x} ${angleToPoint(sunsetAngle, 60).y}
            L ${angleToPoint(sunsetAngle, 0).x} 80
            L ${angleToPoint(sunriseAngle, 0).x} 80 Z`}
        fill="url(#dayGradient)"
      />

      {/* Arc outline */}
      <path
        d="M 40 80 A 60 60 0 0 1 160 80"
        fill="none"
        stroke="#c9a227"
        strokeWidth="1"
        opacity="0.3"
        strokeDasharray="2 4"
      />

      {/* Time markers */}
      {[6, 9, 12, 15, 18].map((hour) => {
        const angle = hourToAngle(hour)
        const pt = angleToPoint(angle, 65)
        return (
          <g key={hour}>
            <line
              x1={angleToPoint(angle, 60).x}
              y1={angleToPoint(angle, 60).y}
              x2={angleToPoint(angle, 55).x}
              y2={angleToPoint(angle, 55).y}
              stroke="#c9a227"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <text
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              className="text-[6px] fill-[#c9a227]/60"
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {hour}:00
            </text>
          </g>
        )
      })}

      {/* Sunrise marker */}
      <circle
        cx={angleToPoint(sunriseAngle, 60).x}
        cy={angleToPoint(sunriseAngle, 60).y}
        r="4"
        fill="#fbbf24"
        opacity="0.8"
      />

      {/* Sunset marker */}
      <circle
        cx={angleToPoint(sunsetAngle, 60).x}
        cy={angleToPoint(sunsetAngle, 60).y}
        r="4"
        fill="#a855f7"
        opacity="0.8"
      />

      {/* Current sun position (only if above horizon) */}
      {currentAngle > 0 && currentAngle < 180 && (
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Sun glow */}
          <circle
            cx={sunPos.x}
            cy={sunPos.y}
            r="10"
            fill="#fbbf24"
            opacity="0.2"
          />
          {/* Sun body */}
          <circle
            cx={sunPos.x}
            cy={sunPos.y}
            r="6"
            fill={isDay ? '#fbbf24' : '#a855f7'}
          />
          {/* Sun rays (if daytime) */}
          {isDay && (
            <>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180
                return (
                  <line
                    key={angle}
                    x1={sunPos.x + 8 * Math.cos(rad)}
                    y1={sunPos.y + 8 * Math.sin(rad)}
                    x2={sunPos.x + 12 * Math.cos(rad)}
                    y2={sunPos.y + 12 * Math.sin(rad)}
                    stroke="#fbbf24"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                )
              })}
            </>
          )}
        </motion.g>
      )}

      {/* Labels */}
      <text x="20" y="95" className="text-[7px] fill-[#c4baa6]/60" style={{ fontFamily: 'JetBrains Mono' }}>
        E
      </text>
      <text x="96" y="95" className="text-[7px] fill-[#c4baa6]/60" style={{ fontFamily: 'JetBrains Mono' }}>
        S
      </text>
      <text x="175" y="95" className="text-[7px] fill-[#c4baa6]/60" style={{ fontFamily: 'JetBrains Mono' }}>
        W
      </text>
    </svg>
  )
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
    <GlassCard title="Sun & Twilight" icon="☀️" glowColor="aurora">
      {/* Horizon visualization */}
      <div className="mb-4">
        <HorizonArc sun={sun} />
      </div>

      {/* Time data grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sunrise */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.05) 100%)',
              border: '1px solid rgba(251,191,36,0.3)',
            }}
          >
            <span className="text-sm">🌅</span>
          </div>
          <div>
            <span className="data-label">Sunrise</span>
            <p className="font-mono text-[#f5f0e1] font-medium">
              {formatTime(sun.sunrise)}
            </p>
          </div>
        </div>

        {/* Sunset */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0.05) 100%)',
              border: '1px solid rgba(168,85,247,0.3)',
            }}
          >
            <span className="text-sm">🌇</span>
          </div>
          <div>
            <span className="data-label">Sunset</span>
            <p className="font-mono text-[#f5f0e1] font-medium">
              {formatTime(sun.sunset)}
            </p>
          </div>
        </div>

        {/* Morning twilight ends */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(78,205,196,0.15) 0%, rgba(78,205,196,0.05) 100%)',
              border: '1px solid rgba(78,205,196,0.2)',
            }}
          >
            <span className="text-sm">🌃</span>
          </div>
          <div>
            <span className="data-label">Dawn Ends</span>
            <p className="font-mono text-[#f5f0e1] font-medium text-sm">
              {formatTime(sun.astronomical_twilight_end)}
            </p>
          </div>
        </div>

        {/* Evening twilight starts */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(78,205,196,0.15) 0%, rgba(78,205,196,0.05) 100%)',
              border: '1px solid rgba(78,205,196,0.2)',
            }}
          >
            <span className="text-sm">🌌</span>
          </div>
          <div>
            <span className="data-label">Dusk Begins</span>
            <p className="font-mono text-[#f5f0e1] font-medium text-sm">
              {formatTime(sun.astronomical_twilight_start)}
            </p>
          </div>
        </div>
      </div>

      {/* Note about astronomical twilight */}
      <div className="mt-4 pt-3 border-t border-[#c9a227]/10">
        <p className="text-xs text-[#c4baa6]/70 flex items-center gap-2">
          <span className="text-[#c9a227]">★</span>
          Astronomical twilight marks true darkness for observing
        </p>
      </div>
    </GlassCard>
  )
}
