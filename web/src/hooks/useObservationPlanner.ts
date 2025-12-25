import { useMemo } from 'react'
import type { SkyReport, DSOInfo, PlanetInfo } from '../types'

export interface PlannedObservation {
  id: string
  name: string
  type: 'planet' | 'dso' | 'moon'
  priority: number // 1-5, higher = more urgent
  score: number // 0-100
  reasons: string[]
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  bestTime: string
  equipment: string
  hasObserved: boolean
  // Object data
  altitude: number
  azimuth: number
  magnitude?: number
  constellation?: string
  objectType?: string
}

export interface PlannerResult {
  topPicks: PlannedObservation[]
  allRecommendations: PlannedObservation[]
  stats: {
    totalAvailable: number
    newToYou: number
    easyTargets: number
  }
}

interface PlannerOptions {
  limitingMagnitude: number
  observedObjectIds: string[]
  includeObserved: boolean
  maxResults: number
}

const DEFAULT_OPTIONS: PlannerOptions = {
  limitingMagnitude: 6, // Naked eye default
  observedObjectIds: [],
  includeObserved: true,
  maxResults: 10,
}

function getDifficulty(magnitude: number, limitingMag: number): PlannedObservation['difficulty'] {
  const margin = limitingMag - magnitude
  if (margin > 3) return 'Easy'
  if (margin > 1) return 'Moderate'
  return 'Challenging'
}

function getEquipmentNeeded(magnitude: number): string {
  if (magnitude <= 4) return 'Naked eye'
  if (magnitude <= 7) return 'Binoculars'
  if (magnitude <= 10) return 'Small telescope'
  return 'Telescope'
}

function getBestTimeDescription(altitude: number, isRising: boolean): string {
  if (altitude > 60) return 'Excellent position now'
  if (altitude > 40) return 'Good position now'
  if (altitude > 20) {
    return isRising ? 'Rising - best in 1-2 hours' : 'Setting - observe soon'
  }
  return 'Low on horizon'
}

function scoreDSO(
  dso: DSOInfo,
  options: PlannerOptions
): { score: number; priority: number; reasons: string[] } {
  const reasons: string[] = []
  let score = 0

  // Visibility score (0-30)
  if (dso.altitude > 60) {
    score += 30
    reasons.push('Excellent viewing position')
  } else if (dso.altitude > 40) {
    score += 25
  } else if (dso.altitude > 20) {
    score += 15
  } else {
    score += 5
  }

  // Brightness score (0-25)
  const brightnessMargin = options.limitingMagnitude - dso.mag
  if (brightnessMargin > 4) {
    score += 25
    reasons.push('Very bright - easy to find')
  } else if (brightnessMargin > 2) {
    score += 20
  } else if (brightnessMargin > 0) {
    score += 10
  }

  // "New to you" bonus (0-25)
  const hasObserved = options.observedObjectIds.includes(dso.id)
  if (!hasObserved) {
    score += 25
    reasons.push('New to your observation log')
  }

  // Famous/interesting objects bonus (0-20)
  const famousObjects = ['M31', 'M42', 'M45', 'M13', 'M51', 'M57', 'M27', 'M1', 'M81', 'M82']
  if (famousObjects.includes(dso.id)) {
    score += 20
    reasons.push('Famous showpiece object')
  }

  // Type variety bonus
  if (dso.type.toLowerCase().includes('galaxy')) {
    reasons.push('Galaxy')
  } else if (dso.type.toLowerCase().includes('nebula')) {
    reasons.push('Nebula')
  } else if (dso.type.toLowerCase().includes('cluster')) {
    reasons.push('Star cluster')
  }

  // Priority based on score
  let priority = 1
  if (score >= 80) priority = 5
  else if (score >= 60) priority = 4
  else if (score >= 40) priority = 3
  else if (score >= 25) priority = 2

  return { score, priority, reasons }
}

function scorePlanet(
  planet: PlanetInfo,
  options: PlannerOptions
): { score: number; priority: number; reasons: string[] } {
  const reasons: string[] = []
  let score = 0

  // Planets are always high priority if visible
  if (planet.altitude > 30) {
    score += 40
    reasons.push('Well-positioned for viewing')
  } else if (planet.altitude > 15) {
    score += 25
  } else if (planet.altitude > 0) {
    score += 10
  }

  // Planet-specific bonuses
  const planetBonuses: Record<string, { bonus: number; reason: string }> = {
    Jupiter: { bonus: 30, reason: 'Excellent detail in small scopes' },
    Saturn: { bonus: 30, reason: 'Stunning rings visible' },
    Mars: { bonus: 20, reason: 'Surface features visible at opposition' },
    Venus: { bonus: 25, reason: 'Brightest planet - shows phases' },
    Mercury: { bonus: 15, reason: 'Challenging but rewarding' },
    Uranus: { bonus: 10, reason: 'Distant ice giant' },
    Neptune: { bonus: 10, reason: 'Remote blue world' },
  }

  const planetInfo = planetBonuses[planet.name]
  if (planetInfo) {
    score += planetInfo.bonus
    reasons.push(planetInfo.reason)
  }

  // "New to you" bonus
  const hasObserved = options.observedObjectIds.includes(`planet-${planet.name.toLowerCase()}`)
  if (!hasObserved) {
    score += 15
    reasons.push('Not in your log yet')
  }

  let priority = planet.altitude > 30 ? 5 : planet.altitude > 15 ? 4 : 3

  return { score, priority, reasons }
}

export function generateObservationPlan(
  report: SkyReport,
  options: Partial<PlannerOptions> = {}
): PlannerResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const recommendations: PlannedObservation[] = []

  // Add Moon if visible
  // (Moon is always interesting for beginners)
  recommendations.push({
    id: 'moon',
    name: `Moon (${report.moon.phase_name})`,
    type: 'moon',
    priority: report.moon.illumination > 10 ? 4 : 2,
    score: report.moon.illumination > 10 ? 75 : 40,
    reasons: report.moon.illumination > 10
      ? ['Excellent detail visible', `${report.moon.illumination}% illuminated`]
      : ['Thin crescent - look for Earthshine'],
    difficulty: 'Easy',
    bestTime: 'Visible now',
    equipment: 'Any - binoculars or telescope enhance detail',
    hasObserved: opts.observedObjectIds.includes('moon'),
    altitude: 45, // Placeholder - could be calculated
    azimuth: 180,
  })

  // Add planets
  report.planets
    .filter(p => p.altitude > 5)
    .forEach(planet => {
      const { score, priority, reasons } = scorePlanet(planet, opts)
      const hasObserved = opts.observedObjectIds.includes(`planet-${planet.name.toLowerCase()}`)

      if (!hasObserved || opts.includeObserved) {
        recommendations.push({
          id: `planet-${planet.name.toLowerCase()}`,
          name: planet.name,
          type: 'planet',
          priority,
          score,
          reasons,
          difficulty: planet.altitude > 30 ? 'Easy' : 'Moderate',
          bestTime: getBestTimeDescription(planet.altitude, true),
          equipment: getEquipmentNeeded(-2), // Planets are bright
          hasObserved,
          altitude: planet.altitude,
          azimuth: planet.azimuth,
        })
      }
    })

  // Add DSOs
  report.deep_sky
    .filter(dso => dso.altitude > 15 && dso.mag <= opts.limitingMagnitude)
    .forEach(dso => {
      const { score, priority, reasons } = scoreDSO(dso, opts)
      const hasObserved = opts.observedObjectIds.includes(dso.id)

      if (!hasObserved || opts.includeObserved) {
        recommendations.push({
          id: dso.id,
          name: dso.name || dso.id,
          type: 'dso',
          priority,
          score,
          reasons,
          difficulty: getDifficulty(dso.mag, opts.limitingMagnitude),
          bestTime: getBestTimeDescription(dso.altitude, true),
          equipment: getEquipmentNeeded(dso.mag),
          hasObserved,
          altitude: dso.altitude,
          azimuth: dso.azimuth,
          magnitude: dso.mag,
          constellation: dso.constellation,
          objectType: dso.type,
        })
      }
    })

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score)

  // Get top picks (prioritize variety and new objects)
  const topPicks: PlannedObservation[] = []
  const seenTypes = new Set<string>()

  // First pass: add highest-scoring new objects
  for (const rec of recommendations) {
    if (topPicks.length >= 5) break
    if (!rec.hasObserved && !seenTypes.has(rec.type)) {
      topPicks.push(rec)
      seenTypes.add(rec.type)
    }
  }

  // Fill remaining slots with best remaining
  for (const rec of recommendations) {
    if (topPicks.length >= 5) break
    if (!topPicks.includes(rec)) {
      topPicks.push(rec)
    }
  }

  // Calculate stats
  const stats = {
    totalAvailable: recommendations.length,
    newToYou: recommendations.filter(r => !r.hasObserved).length,
    easyTargets: recommendations.filter(r => r.difficulty === 'Easy').length,
  }

  return {
    topPicks,
    allRecommendations: recommendations.slice(0, opts.maxResults),
    stats,
  }
}

export function useObservationPlanner(
  report: SkyReport | null,
  options: Partial<PlannerOptions> = {}
): PlannerResult | null {
  return useMemo(() => {
    if (!report) return null
    return generateObservationPlan(report, options)
  }, [report, options])
}
