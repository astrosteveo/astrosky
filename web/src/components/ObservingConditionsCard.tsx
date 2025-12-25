import type { ObservingConditions, MoonInfo } from '../types'
import { GlassCard, StatDisplay, CardDivider } from './GlassCard'

interface ObservingConditionsCardProps {
  weather: ObservingConditions | null
  moon?: MoonInfo | null
}

// Bortle scale descriptions and colors
const bortleScale: Record<number, { name: string; color: string; description: string }> = {
  1: { name: 'Excellent Dark', color: '#000000', description: 'Zodiacal light, gegenschein visible' },
  2: { name: 'Typical Dark', color: '#1a1a2e', description: 'Airglow visible, M33 easy naked eye' },
  3: { name: 'Rural Sky', color: '#2d3a4a', description: 'Some light pollution on horizon' },
  4: { name: 'Rural/Suburban', color: '#4a5568', description: 'Light domes visible in several directions' },
  5: { name: 'Suburban Sky', color: '#6b7280', description: 'Milky Way very weak or invisible' },
  6: { name: 'Bright Suburban', color: '#8b95a5', description: 'Milky Way only visible near zenith' },
  7: { name: 'Suburban/Urban', color: '#a8b5c4', description: 'Sky grayish-white, Milky Way invisible' },
  8: { name: 'City Sky', color: '#c4cdd8', description: 'Sky glows white, few constellations' },
  9: { name: 'Inner City', color: '#e0e5eb', description: 'Only Moon, planets, few stars visible' },
}

// Estimate Bortle scale from moon illumination and cloud cover
function estimateBortleScale(moonIllumination: number, cloudCover: number): number {
  // Base estimate from moon illumination
  // Full moon (100%) pushes towards Bortle 6-7, new moon (0%) allows Bortle 3-4
  // Note: True Bortle depends on location light pollution which we don't have
  let bortle = 4 // Base for typical suburban location

  // Moon impact: full moon adds ~3 levels, new moon subtracts ~1
  bortle += Math.round((moonIllumination / 100) * 3)

  // Cloud cover impact: high clouds make things worse
  if (cloudCover > 50) bortle += 1
  if (cloudCover > 80) bortle += 1

  // Clamp to valid range
  return Math.max(1, Math.min(9, bortle))
}

const conditionConfig: Record<string, { color: string; icon: string; bg: string }> = {
  Excellent: { color: '#34d399', icon: '✨', bg: 'rgba(52,211,153,0.1)' },
  Good: { color: '#4ecdc4', icon: '👍', bg: 'rgba(78,205,196,0.1)' },
  Fair: { color: '#c9a227', icon: '☁️', bg: 'rgba(201,162,39,0.1)' },
  Poor: { color: '#e25822', icon: '🌧️', bg: 'rgba(226,88,34,0.1)' },
  Unknown: { color: '#94a3b8', icon: '❓', bg: 'rgba(148,163,184,0.1)' },
}

export function ObservingConditionsCard({ weather, moon }: ObservingConditionsCardProps) {
  if (!weather) {
    return null
  }

  const config = conditionConfig[weather.condition] || conditionConfig.Unknown
  const isDataAvailable = weather.cloud_cover >= 0

  // Calculate estimated Bortle scale
  const moonIllumination = moon?.illumination ?? 50
  const cloudCover = weather.cloud_cover >= 0 ? weather.cloud_cover : 50
  const estimatedBortle = estimateBortleScale(moonIllumination, cloudCover)
  const bortleInfo = bortleScale[estimatedBortle]

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

      {/* Bortle Scale Indicator */}
      <div className="mb-4 p-3 rounded-lg bg-[rgba(201,162,39,0.03)] border border-[#c9a227]/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#c4baa6]/70 uppercase tracking-wider">Est. Sky Darkness</span>
          <span className="font-mono text-sm font-semibold text-[#c9a227]">
            Bortle {estimatedBortle}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          {/* Bortle scale bar */}
          <div className="flex-1 h-2 rounded-full bg-[#1e293b] overflow-hidden flex">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
              <div
                key={level}
                className="flex-1 transition-opacity duration-300"
                style={{
                  backgroundColor: bortleScale[level].color,
                  opacity: level <= estimatedBortle ? 1 : 0.2,
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: estimatedBortle <= 4 ? '#34d399' : estimatedBortle <= 6 ? '#c9a227' : '#e25822' }}>
            {bortleInfo.name}
          </span>
          <span className="text-xs text-[#c4baa6]/60">
            {estimatedBortle <= 3 ? '🌌' : estimatedBortle <= 5 ? '🌃' : '🏙️'}
          </span>
        </div>
        <p className="text-xs text-[#c4baa6]/50 mt-1">
          {bortleInfo.description}
        </p>
      </div>

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
