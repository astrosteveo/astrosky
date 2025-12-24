import type { PlanetInfo } from '../types'
import { GlassCard } from './GlassCard'
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

const planetColors: Record<string, string> = {
  Mercury: 'bg-slate-400',
  Venus: 'bg-amber-200',
  Mars: 'bg-red-500',
  Jupiter: 'bg-orange-300',
  Saturn: 'bg-yellow-200',
  Uranus: 'bg-cyan-300',
  Neptune: 'bg-blue-400',
}

function getUrgencyColor(totalSeconds: number): string {
  if (totalSeconds < 300) return 'text-red-400' // < 5 min
  if (totalSeconds < 1800) return 'text-amber-400' // < 30 min
  if (totalSeconds < 3600) return 'text-yellow-400' // < 1 hour
  return 'text-emerald-400' // > 1 hour
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
      <GlassCard title="Planets">
        <p className="text-slate-400 text-center py-4">
          No planets visible tonight
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Planets">
      <div className="space-y-4">
        {planets.map((planet) => {
          const objectId = `planet-${planet.name.toLowerCase()}`
          const observed = hasObserved(objectId)
          const count = getObservationsForObject(objectId).length

          return (
            <div key={planet.name} className="flex items-center gap-4">
              <div
                className={`w-4 h-4 rounded-full ${planetColors[planet.name] || 'bg-slate-400'}`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display font-semibold text-slate-50">
                    {planet.name}
                  </span>
                  <span className="text-sm text-slate-400">
                    {planet.direction} ({planet.azimuth}°) • {planet.altitude}° alt
                  </span>
                  {planet.set_time && isBefore(now, planet.set_time) && (() => {
                    const timeUntil = calculateTimeUntil(now, planet.set_time)
                    return (
                      <span className={`text-sm font-medium ${getUrgencyColor(timeUntil.totalSeconds)}`}>
                        Sets in {formatTimeUntilCompact(timeUntil)}
                      </span>
                    )
                  })()}
                </div>
                <p className="text-sm text-slate-500">{planet.description}</p>
              </div>

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
          )
        })}
      </div>
    </GlassCard>
  )
}
