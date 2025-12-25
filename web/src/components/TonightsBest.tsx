import { useMemo } from 'react'
import type { SkyReport } from '../types'
import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { useObservationsContext } from '../context/ObservationsContext'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { calculateTimeUntil, formatTimeUntilCompact, isBefore } from '../lib/timeUtils'

interface TonightsBestProps {
  data: SkyReport
}

interface Recommendation {
  id: string
  type: 'planet' | 'dso' | 'iss' | 'meteor' | 'event' | 'moon'
  title: string
  subtitle: string
  reason: string
  urgency: 'now' | 'soon' | 'tonight' | 'upcoming'
  score: number
  icon: string
  color: string
  timeInfo?: string
}

// Score and rank all visible objects to find tonight's best
function getRecommendations(data: SkyReport, now: Date, observedIds: Set<string>): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Score planets
  data.planets.forEach(planet => {
    const objectId = `planet-${planet.name.toLowerCase()}`
    const notObserved = !observedIds.has(objectId)
    let score = 50

    // Altitude bonus (higher = better viewing)
    score += Math.min(planet.altitude, 60) * 0.5

    // Brightness bonus
    if (['Venus', 'Jupiter'].includes(planet.name)) score += 20
    if (['Saturn', 'Mars'].includes(planet.name)) score += 10

    // Not observed bonus
    if (notObserved) score += 15

    // Time remaining
    let urgency: Recommendation['urgency'] = 'tonight'
    let timeInfo: string | undefined
    if (planet.set_time && isBefore(now, planet.set_time)) {
      const timeUntil = calculateTimeUntil(now, planet.set_time)
      if (timeUntil.totalSeconds < 3600) {
        urgency = 'now'
        score += 25 // Urgency bonus
        timeInfo = `Sets in ${formatTimeUntilCompact(timeUntil)}`
      } else if (timeUntil.totalSeconds < 7200) {
        urgency = 'soon'
        score += 10
        timeInfo = `Sets in ${formatTimeUntilCompact(timeUntil)}`
      }
    }

    const planetColors: Record<string, string> = {
      Mercury: '#94a3b8', Venus: '#fef3c7', Mars: '#e25822',
      Jupiter: '#fed7aa', Saturn: '#fde68a', Uranus: '#a5f3fc', Neptune: '#93c5fd'
    }

    recommendations.push({
      id: objectId,
      type: 'planet',
      title: planet.name,
      subtitle: `${planet.direction} • Alt ${planet.altitude}°`,
      reason: notObserved ? "Haven't logged yet" : planet.altitude > 40 ? 'Excellent position' : 'Visible now',
      urgency,
      score,
      icon: '🪐',
      color: planetColors[planet.name] || '#c9a227',
      timeInfo,
    })
  })

  // Score ISS passes
  data.iss_passes.forEach((pass, index) => {
    if (index > 0) return // Only first pass
    const passTime = new Date(pass.start_time)
    if (!isBefore(now, passTime)) return

    const timeUntil = calculateTimeUntil(now, pass.start_time)
    let score = 70 // ISS passes are special
    let urgency: Recommendation['urgency'] = 'tonight'

    if (timeUntil.totalSeconds < 1800) {
      urgency = 'now'
      score += 40
    } else if (timeUntil.totalSeconds < 3600) {
      urgency = 'soon'
      score += 20
    }

    // Brightness bonus
    if (pass.brightness === 'Very Bright') score += 15
    if (pass.brightness === 'Bright') score += 10

    recommendations.push({
      id: 'iss-pass',
      type: 'iss',
      title: 'ISS Pass',
      subtitle: `${pass.max_altitude}° max • ${pass.duration_minutes}min`,
      reason: pass.brightness === 'Very Bright' ? 'Exceptionally bright!' : 'Space station flyover',
      urgency,
      score,
      icon: '🛸',
      color: '#4ecdc4',
      timeInfo: `In ${formatTimeUntilCompact(timeUntil)}`,
    })
  })

  // Score meteor showers
  data.meteors.forEach(shower => {
    if (!shower.is_peak) return
    let score = 65

    // ZHR bonus
    if (shower.zhr > 100) score += 20
    else if (shower.zhr > 50) score += 10

    recommendations.push({
      id: `meteor-${shower.name}`,
      type: 'meteor',
      title: shower.name,
      subtitle: `~${shower.zhr} meteors/hour`,
      reason: 'Peak activity tonight!',
      urgency: 'tonight',
      score,
      icon: '☄️',
      color: '#e25822',
    })
  })

  // Score deep sky objects (top 3)
  data.deep_sky.slice(0, 5).forEach((dso, index) => {
    const objectId = `dso-${dso.id}`
    const notObserved = !observedIds.has(objectId)
    let score = 40

    // Brightness bonus (lower mag = brighter)
    score += Math.max(0, (10 - dso.mag) * 3)

    // Altitude bonus
    score += Math.min(dso.altitude, 60) * 0.3

    // Not observed bonus
    if (notObserved) score += 20

    // Rank penalty
    score -= index * 5

    // Only include if notable
    if (score < 50 && index > 2) return

    recommendations.push({
      id: objectId,
      type: 'dso',
      title: `${dso.id} - ${dso.name}`,
      subtitle: `${dso.type} • ${dso.equipment}`,
      reason: notObserved ? "Haven't logged yet" : `${dso.constellation} - good position`,
      urgency: 'tonight',
      score,
      icon: '🌌',
      color: '#a855f7',
    })
  })

  // Moon phase recommendation
  if (data.moon.illumination < 25) {
    recommendations.push({
      id: 'moon-dark',
      type: 'moon',
      title: 'Dark Sky Window',
      subtitle: `${data.moon.phase_name} • ${data.moon.illumination}% lit`,
      reason: 'Excellent for deep sky!',
      urgency: 'tonight',
      score: 55,
      icon: '🌑',
      color: '#1e293b',
    })
  } else if (data.moon.illumination > 90) {
    recommendations.push({
      id: 'moon-full',
      type: 'moon',
      title: data.moon.phase_name,
      subtitle: `${data.moon.illumination}% illuminated`,
      reason: 'Great for lunar observation',
      urgency: 'tonight',
      score: 50,
      icon: '🌕',
      color: '#fef9c3',
    })
  }

  // Sort by score and return top recommendations
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
}

const urgencyConfig = {
  now: { label: 'NOW', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  soon: { label: 'SOON', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  tonight: { label: 'TONIGHT', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  upcoming: { label: 'UPCOMING', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

export function TonightsBest({ data }: TonightsBestProps) {
  const { hasObserved } = useObservationsContext()
  const now = useCurrentTime()

  const recommendations = useMemo(() => {
    // Build set of observed object IDs
    const observedIds = new Set<string>()
    // Check common object types
    data.planets.forEach(p => {
      const id = `planet-${p.name.toLowerCase()}`
      if (hasObserved(id)) observedIds.add(id)
    })
    data.deep_sky.forEach(d => {
      const id = `dso-${d.id}`
      if (hasObserved(id)) observedIds.add(id)
    })

    return getRecommendations(data, now, observedIds)
  }, [data, now, hasObserved])

  if (recommendations.length === 0) {
    return null
  }

  return (
    <GlassCard
      title="Tonight's Best"
      icon="⭐"
      glowColor="brass"
    >
      <p className="text-xs text-[#c4baa6]/70 mb-4">
        Top picks based on conditions, timing & your observation history
      </p>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const urgency = urgencyConfig[rec.urgency]

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(201,162,39,0.03)' }}
            >
              {/* Rank badge */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold"
                style={{
                  background: index === 0 ? 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)' :
                             index === 1 ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' :
                             'rgba(201,162,39,0.2)',
                  color: index < 2 ? '#0a0a0f' : '#c9a227',
                }}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-lg">{rec.icon}</span>
                  <span className="font-display font-semibold text-[#f5f0e1]">
                    {rec.title}
                  </span>
                  {/* Urgency badge */}
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: urgency.bg, color: urgency.color }}
                  >
                    {urgency.label}
                  </span>
                </div>

                <p className="text-xs text-[#c4baa6]/70 mb-1">
                  {rec.subtitle}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-medium"
                    style={{ color: rec.color }}
                  >
                    {rec.reason}
                  </span>
                  {rec.timeInfo && (
                    <>
                      <span className="text-[#c4baa6]/30">•</span>
                      <span className="text-xs font-mono text-[#c4baa6]/60">
                        {rec.timeInfo}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#c9a227]/10">
        <p className="text-[10px] text-[#c4baa6]/50 text-center">
          Rankings update in real-time based on object positions
        </p>
      </div>
    </GlassCard>
  )
}
