import type { ObservingConditions } from '../types'
import { GlassCard, StatDisplay, CardDivider } from './GlassCard'

interface ObservingConditionsCardProps {
  weather: ObservingConditions | null
}

const conditionConfig: Record<string, { color: string; icon: string; bg: string }> = {
  Excellent: { color: '#34d399', icon: '✨', bg: 'rgba(52,211,153,0.1)' },
  Good: { color: '#4ecdc4', icon: '👍', bg: 'rgba(78,205,196,0.1)' },
  Fair: { color: '#c9a227', icon: '☁️', bg: 'rgba(201,162,39,0.1)' },
  Poor: { color: '#e25822', icon: '🌧️', bg: 'rgba(226,88,34,0.1)' },
  Unknown: { color: '#94a3b8', icon: '❓', bg: 'rgba(148,163,184,0.1)' },
}

export function ObservingConditionsCard({ weather }: ObservingConditionsCardProps) {
  if (!weather) {
    return null
  }

  const config = conditionConfig[weather.condition] || conditionConfig.Unknown
  const isDataAvailable = weather.cloud_cover >= 0

  return (
    <GlassCard
      title="Observing Conditions"
      icon="🔭"
      glowColor={weather.condition === 'Excellent' ? 'success' : weather.condition === 'Good' ? 'aurora' : 'brass'}
    >
      {/* Condition badge */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: config.bg }}
        >
          <span className="text-lg">{config.icon}</span>
          <span
            className="font-display font-semibold text-sm"
            style={{ color: config.color }}
          >
            {weather.condition}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-[#c4baa6] leading-relaxed mb-4">
        {weather.summary}
      </p>

      {isDataAvailable && (
        <>
          <CardDivider />

          {/* Weather stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatDisplay
              label="Cloud Cover"
              value={weather.cloud_cover}
              unit="%"
            />
            <StatDisplay
              label="Humidity"
              value={weather.humidity}
              unit="%"
            />
            <StatDisplay
              label="Visibility"
              value={weather.visibility}
              unit="km"
            />
            <StatDisplay
              label="Wind"
              value={weather.wind_speed}
              unit="km/h"
            />
          </div>

          {/* Temperature */}
          <div className="mt-4 flex items-center gap-2 text-sm text-[#94a3b8]">
            <span>🌡️</span>
            <span className="font-mono">{weather.temperature}°C</span>
          </div>
        </>
      )}
    </GlassCard>
  )
}
