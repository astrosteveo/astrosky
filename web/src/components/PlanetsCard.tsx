import type { PlanetInfo } from '../types'
import { motion } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'
import { ObservationButton } from './ObservationButton'
import { useObservationsContext } from '../context/ObservationsContext'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { calculateTimeUntil, formatTimeUntilCompact, isBefore } from '../lib/timeUtils'
import type { EquipmentType } from '../types/observations'

interface PlanetsCardProps {
  planets: PlanetInfo[]
  location?: { lat: number; lon: number }
  placeName?: string
}

// Planet visual configurations
const planetConfig: Record<string, { color: string; size: number; ring?: boolean; glow: string }> = {
  Mercury: { color: '#94a3b8', size: 6, glow: 'rgba(148, 163, 184, 0.4)' },
  Venus: { color: '#fef3c7', size: 10, glow: 'rgba(254, 243, 199, 0.5)' },
  Mars: { color: '#e25822', size: 8, glow: 'rgba(226, 88, 34, 0.4)' },
  Jupiter: { color: '#fed7aa', size: 14, glow: 'rgba(254, 215, 170, 0.4)' },
  Saturn: { color: '#fde68a', size: 12, ring: true, glow: 'rgba(253, 230, 138, 0.4)' },
  Uranus: { color: '#a5f3fc', size: 10, glow: 'rgba(165, 243, 252, 0.4)' },
  Neptune: { color: '#93c5fd', size: 10, glow: 'rgba(147, 197, 253, 0.4)' },
}

// Planet visual component
function PlanetIcon({ name }: { name: string }) {
  const config = planetConfig[name] || { color: '#c4baa6', size: 8, glow: 'rgba(196, 186, 166, 0.3)' }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 28, height: 28 }}
    >
      {/* Glow effect */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size * 2.5,
          height: config.size * 2.5,
          background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
        }}
      />
      {/* Planet body */}
      <div
        className="relative rounded-full"
        style={{
          width: config.size,
          height: config.size,
          background: `radial-gradient(circle at 30% 30%, ${config.color}, ${config.color}80)`,
          boxShadow: `0 0 ${config.size}px ${config.glow}`,
        }}
      />
      {/* Saturn's rings */}
      {config.ring && (
        <div
          className="absolute"
          style={{
            width: config.size * 2,
            height: config.size * 0.4,
            border: `1px solid ${config.color}60`,
            borderRadius: '50%',
            transform: 'rotateX(70deg)',
          }}
        />
      )}
    </div>
  )
}

function getUrgencyColor(totalSeconds: number): { text: string; bg: string } {
  if (totalSeconds < 300) return { text: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
  if (totalSeconds < 1800) return { text: '#fbbf24', bg: 'rgba(251,191,36,0.1)' }
  if (totalSeconds < 3600) return { text: '#facc15', bg: 'rgba(250,204,21,0.1)' }
  return { text: '#34d399', bg: 'rgba(52,211,153,0.1)' }
}

export function PlanetsCard({ planets, location, placeName }: PlanetsCardProps) {
  const { addObservation, hasObserved, getObservationsForObject } = useObservationsContext()
  const now = useCurrentTime()

  const handleLog = (planet: PlanetInfo) => (equipment: EquipmentType, notes?: string) => {
    if (location) {
      const objectId = `planet-${planet.name.toLowerCase()}`
      addObservation(
        { type: 'planet', id: objectId, name: planet.name, details: planet.description },
        { ...location, placeName },
        equipment,
        notes
      )
    }
  }

  if (planets.length === 0) {
    return (
      <GlassCard title="Planets" icon="🪐" glowColor="nebula">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#c9a227]/10 flex items-center justify-center">
            <span className="text-2xl opacity-50">🪐</span>
          </div>
          <p className="text-[#c4baa6]">No planets visible tonight</p>
          <p className="text-[#c4baa6]/60 text-sm mt-1">Check back at different hours</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Visible Planets" icon="🪐" glowColor="nebula">
      <div className="space-y-3">
        {planets.map((planet, index) => {
          const objectId = `planet-${planet.name.toLowerCase()}`
          const observed = hasObserved(objectId)
          const count = getObservationsForObject(objectId).length

          return (
            <motion.div
              key={planet.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              {index > 0 && <div className="h-px bg-[#c9a227]/10 mb-3" />}

              <div className="flex items-start gap-4">
                {/* Planet visualization */}
                <PlanetIcon name={planet.name} />

                {/* Planet info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-lg font-semibold text-[#f5f0e1]">
                      {planet.name}
                    </span>
                    {observed && (
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20">
                        Observed
                      </span>
                    )}
                  </div>

                  {/* Position data */}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="font-mono text-xs text-[#c9a227]">
                      {planet.direction}
                    </span>
                    <span className="text-[#c4baa6]/40">•</span>
                    <span className="font-mono text-xs text-[#c4baa6]">
                      Az {planet.azimuth}°
                    </span>
                    <span className="text-[#c4baa6]/40">•</span>
                    <span className="font-mono text-xs text-[#c4baa6]">
                      Alt {planet.altitude}°
                    </span>

                    {/* Set time countdown */}
                    {planet.set_time && isBefore(now, planet.set_time) && (() => {
                      const timeUntil = calculateTimeUntil(now, planet.set_time)
                      const urgency = getUrgencyColor(timeUntil.totalSeconds)
                      return (
                        <span
                          className="font-mono text-xs px-2 py-0.5 rounded"
                          style={{
                            color: urgency.text,
                            background: urgency.bg,
                          }}
                        >
                          Sets in {formatTimeUntilCompact(timeUntil)}
                        </span>
                      )
                    })()}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#c4baa6]/70 mt-1 line-clamp-1">
                    {planet.description}
                  </p>
                </div>

                {/* Observation button */}
                {location && (
                  <ObservationButton
                    object={{ type: 'planet', id: objectId, name: planet.name, details: planet.description }}
                    hasObserved={observed}
                    observationCount={count}
                    onLog={handleLog(planet)}
                    placeName={placeName}
                    compact
                  />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {planets.length > 0 && (
        <>
          <CardDivider />
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c4baa6]/60">
              {planets.length} planet{planets.length !== 1 ? 's' : ''} visible
            </span>
            <span className="font-mono text-[#c9a227]/60">
              Alt = Altitude above horizon
            </span>
          </div>
        </>
      )}
    </GlassCard>
  )
}
