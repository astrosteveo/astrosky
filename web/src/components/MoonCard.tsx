import type { MoonInfo } from '../types'
import { motion } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'
import { ObservationButton } from './ObservationButton'
import { useObservationsContext } from '../context/ObservationsContext'
import type { EquipmentType } from '../types/observations'

interface MoonCardProps {
  moon: MoonInfo
  location?: { lat: number; lon: number }
  placeName?: string
}

// Elegant moon phase visualization with brass viewfinder frame
function MoonPhaseViewer({ illumination, phaseName }: { illumination: number; phaseName: string }) {
  const isWaxing = phaseName.toLowerCase().includes('waxing')
  const isNew = phaseName.toLowerCase().includes('new')
  const isFull = phaseName.toLowerCase().includes('full')
  const fraction = illumination / 100

  return (
    <div className="relative" data-testid="moon-phase-viewer">
      {/* Outer brass ring - viewfinder frame */}
      <svg
        viewBox="0 0 120 120"
        className="w-28 h-28"
      >
        <defs>
          {/* Brass gradient */}
          <linearGradient id="brassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="50%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#b87333" />
          </linearGradient>

          {/* Moon glow */}
          <radialGradient id="moonGlowGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#c9a227" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
          </radialGradient>

          {/* Moon surface gradient */}
          <radialGradient id="moonSurface" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d4a574" />
          </radialGradient>

          <clipPath id="moonClipPath">
            <circle cx="60" cy="60" r="36" />
          </clipPath>
        </defs>

        {/* Outer decorative ring */}
        <circle
          cx="60" cy="60" r="56"
          fill="none"
          stroke="url(#brassGradient)"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Tick marks around the edge */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const x1 = 60 + 52 * Math.cos(angle)
          const y1 = 60 + 52 * Math.sin(angle)
          const x2 = 60 + (i % 6 === 0 ? 48 : 50) * Math.cos(angle)
          const y2 = 60 + (i % 6 === 0 ? 48 : 50) * Math.sin(angle)
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#c9a227"
              strokeWidth={i % 6 === 0 ? 1 : 0.5}
              opacity={i % 6 === 0 ? 0.5 : 0.25}
            />
          )
        })}

        {/* Inner brass ring */}
        <circle
          cx="60" cy="60" r="44"
          fill="none"
          stroke="url(#brassGradient)"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Moon glow */}
        <circle cx="60" cy="60" r="42" fill="url(#moonGlowGold)" />

        {/* Moon dark base */}
        <circle cx="60" cy="60" r="36" fill="#1e293b" />

        {/* Illuminated portion */}
        <g clipPath="url(#moonClipPath)">
          {isFull ? (
            <circle cx="60" cy="60" r="36" fill="url(#moonSurface)" />
          ) : isNew ? null : (
            <motion.ellipse
              cx={isWaxing ? 60 + (1 - fraction) * 36 : 60 - (1 - fraction) * 36}
              cy="60"
              rx={36 * fraction}
              ry="36"
              fill="url(#moonSurface)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Crater details */}
          <circle cx="48" cy="52" r="5" fill="#e2e8f0" fillOpacity="0.15" />
          <circle cx="70" cy="68" r="8" fill="#e2e8f0" fillOpacity="0.1" />
          <circle cx="55" cy="75" r="4" fill="#e2e8f0" fillOpacity="0.08" />
          <circle cx="72" cy="48" r="3" fill="#e2e8f0" fillOpacity="0.12" />
        </g>

        {/* Crosshairs */}
        <line x1="60" y1="20" x2="60" y2="30" stroke="#c9a227" strokeWidth="0.5" opacity="0.3" />
        <line x1="60" y1="90" x2="60" y2="100" stroke="#c9a227" strokeWidth="0.5" opacity="0.3" />
        <line x1="20" y1="60" x2="30" y2="60" stroke="#c9a227" strokeWidth="0.5" opacity="0.3" />
        <line x1="90" y1="60" x2="100" y2="60" stroke="#c9a227" strokeWidth="0.5" opacity="0.3" />
      </svg>
    </div>
  )
}

export function MoonCard({ moon, location, placeName }: MoonCardProps) {
  const { addObservation, hasObserved, getObservationsForObject } = useObservationsContext()

  const objectId = 'moon'
  const observed = hasObserved(objectId)
  const observationCount = getObservationsForObject(objectId).length

  const handleLog = (equipment: EquipmentType, notes?: string) => {
    if (location) {
      addObservation(
        { type: 'moon', id: objectId, name: 'The Moon', details: moon.phase_name },
        { ...location, placeName },
        equipment,
        notes
      )
    }
  }

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const qualityConfig = {
    Excellent: { color: '#34d399', label: 'Excellent' },
    Good: { color: '#4ecdc4', label: 'Good' },
    Fair: { color: '#fbbf24', label: 'Fair' },
    Poor: { color: '#e25822', label: 'Poor' },
  }[moon.darkness_quality] || { color: '#c4baa6', label: moon.darkness_quality }

  return (
    <GlassCard title="Moon Phase" icon="🌙">
      <div className="flex items-start gap-6">
        {/* Moon visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MoonPhaseViewer
            illumination={moon.illumination}
            phaseName={moon.phase_name}
          />
        </motion.div>

        {/* Moon data */}
        <div className="flex-1 space-y-3">
          {/* Phase name */}
          <div>
            <span className="data-label">Current Phase</span>
            <p className="font-display text-2xl font-semibold text-[#f5f0e1] mt-1">
              {moon.phase_name}
            </p>
          </div>

          {/* Illumination */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-medium text-[#c9a227]">
              {moon.illumination}%
            </span>
            <span className="text-[#c4baa6] text-sm">illuminated</span>
          </div>

          {/* Sky darkness quality */}
          <div className="flex items-center gap-2">
            <span className="data-label">Sky Darkness</span>
            <span
              className="font-mono text-sm font-medium px-2 py-0.5 rounded"
              style={{
                color: qualityConfig.color,
                background: `${qualityConfig.color}15`,
                border: `1px solid ${qualityConfig.color}30`,
              }}
            >
              {qualityConfig.label}
            </span>
          </div>
        </div>
      </div>

      <CardDivider />

      {/* Rise/Set times and observation button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <span className="data-label">Moonrise</span>
            <p className="font-mono text-[#f5f0e1] font-medium mt-1">
              {formatTime(moon.moonrise)}
            </p>
          </div>
          <div>
            <span className="data-label">Moonset</span>
            <p className="font-mono text-[#f5f0e1] font-medium mt-1">
              {formatTime(moon.moonset)}
            </p>
          </div>
        </div>

        {/* Observation button */}
        {location && (
          <ObservationButton
            object={{ type: 'moon', id: objectId, name: 'The Moon', details: moon.phase_name }}
            hasObserved={observed}
            observationCount={observationCount}
            onLog={handleLog}
            placeName={placeName}
            compact
          />
        )}
      </div>
    </GlassCard>
  )
}
