import { PlanetInfo } from '../types'
import { GlassCard } from './GlassCard'

interface PlanetsCardProps {
  planets: PlanetInfo[]
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

export function PlanetsCard({ planets }: PlanetsCardProps) {
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
        {planets.map((planet) => (
          <div key={planet.name} className="flex items-center gap-4">
            <div
              className={`w-4 h-4 rounded-full ${planetColors[planet.name] || 'bg-slate-400'}`}
            />

            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-semibold text-slate-50">
                  {planet.name}
                </span>
                <span className="text-sm text-slate-400">
                  {planet.direction} • {planet.altitude}°
                </span>
              </div>
              <p className="text-sm text-slate-500">{planet.description}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
