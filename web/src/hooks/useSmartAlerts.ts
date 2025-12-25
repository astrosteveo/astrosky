import { useState, useEffect, useCallback } from 'react'
import type { ObservingConditions, SkyReport, AstroEvent } from '../types'

export interface SmartAlertPreferences {
  enabled: boolean
  // Condition thresholds
  maxCloudCover: number // 0-100, alert when below this
  minVisibility: number // km, alert when above this
  // What to include in alerts
  includeEvents: boolean
  includePlanets: boolean
  includeDeepSky: boolean
  // Timing
  alertTime: 'sunset' | '1h-before-sunset' | 'astronomical-twilight'
  // Quiet hours
  quietStart: number // Hour (0-23)
  quietEnd: number // Hour (0-23)
}

export interface ObservabilityScore {
  score: number // 0-100
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  factors: {
    weather: number
    moonPhase: number
    events: number
  }
  highlights: string[]
  recommendation: string
}

const STORAGE_KEY = 'astrosky-smart-alerts'

const DEFAULT_PREFERENCES: SmartAlertPreferences = {
  enabled: false,
  maxCloudCover: 30,
  minVisibility: 10,
  includeEvents: true,
  includePlanets: true,
  includeDeepSky: true,
  alertTime: 'sunset',
  quietStart: 23,
  quietEnd: 6,
}

function loadPreferences(): SmartAlertPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_PREFERENCES
}

function savePreferences(prefs: SmartAlertPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function calculateObservabilityScore(
  weather: ObservingConditions | null,
  moonIllumination: number,
  events: AstroEvent[]
): ObservabilityScore {
  const factors = {
    weather: 0,
    moonPhase: 0,
    events: 0,
  }
  const highlights: string[] = []

  // Weather score (0-50 points)
  if (weather && weather.cloud_cover >= 0) {
    const cloudScore = Math.max(0, 50 - weather.cloud_cover * 0.5) // 0% clouds = 50pts, 100% = 0pts
    const humidityPenalty = weather.humidity > 80 ? (weather.humidity - 80) * 0.2 : 0
    const visibilityBonus = weather.visibility > 10 ? 5 : 0
    factors.weather = Math.max(0, Math.min(50, cloudScore - humidityPenalty + visibilityBonus))

    if (weather.cloud_cover <= 10) {
      highlights.push('Crystal clear skies')
    } else if (weather.cloud_cover <= 25) {
      highlights.push('Mostly clear skies')
    }

    if (weather.humidity < 50) {
      highlights.push('Low humidity for sharp views')
    }
  } else {
    factors.weather = 25 // Unknown weather gets neutral score
  }

  // Moon phase score (0-30 points)
  // New moon = 30pts, full moon = 0pts
  factors.moonPhase = Math.round(30 * (1 - moonIllumination / 100))
  if (moonIllumination < 10) {
    highlights.push('New moon - perfect dark sky')
  } else if (moonIllumination < 25) {
    highlights.push('Minimal moonlight interference')
  }

  // Events score (0-20 points)
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    const today = new Date()
    return eventDate.toDateString() === today.toDateString()
  })

  if (todayEvents.length > 0) {
    factors.events = Math.min(20, todayEvents.length * 10)
    todayEvents.slice(0, 2).forEach(e => {
      highlights.push(e.title)
    })
  }

  const totalScore = factors.weather + factors.moonPhase + factors.events

  // Determine grade
  let grade: ObservabilityScore['grade']
  let recommendation: string

  if (totalScore >= 75) {
    grade = 'Excellent'
    recommendation = 'Perfect conditions! Drop everything and get outside.'
  } else if (totalScore >= 55) {
    grade = 'Good'
    recommendation = 'Great night for stargazing. Grab your gear!'
  } else if (totalScore >= 35) {
    grade = 'Fair'
    recommendation = 'Decent conditions. Bright objects will be visible.'
  } else {
    grade = 'Poor'
    recommendation = 'Not ideal tonight. Save your energy for a better night.'
  }

  return {
    score: totalScore,
    grade,
    factors,
    highlights,
    recommendation,
  }
}

export function generateAlertMessage(
  score: ObservabilityScore,
  report: SkyReport
): { title: string; body: string } {
  const visiblePlanets = report.planets.filter(p => p.altitude > 10)

  let body = score.recommendation

  if (score.highlights.length > 0) {
    body += ` ${score.highlights[0]}.`
  }

  if (visiblePlanets.length > 0) {
    const planetNames = visiblePlanets.slice(0, 3).map(p => p.name).join(', ')
    body += ` Visible planets: ${planetNames}.`
  }

  return {
    title: `${getScoreEmoji(score.grade)} ${score.grade} Stargazing Tonight!`,
    body,
  }
}

function getScoreEmoji(grade: ObservabilityScore['grade']): string {
  switch (grade) {
    case 'Excellent': return '🌟'
    case 'Good': return '✨'
    case 'Fair': return '🌙'
    case 'Poor': return '☁️'
  }
}

export function useSmartAlerts() {
  const [preferences, setPreferencesState] = useState<SmartAlertPreferences>(loadPreferences)

  // Persist changes
  useEffect(() => {
    savePreferences(preferences)
  }, [preferences])

  const updatePreferences = useCallback((updates: Partial<SmartAlertPreferences>) => {
    setPreferencesState(prev => ({ ...prev, ...updates }))
  }, [])

  const enableSmartAlerts = useCallback(() => {
    setPreferencesState(prev => ({ ...prev, enabled: true }))
  }, [])

  const disableSmartAlerts = useCallback(() => {
    setPreferencesState(prev => ({ ...prev, enabled: false }))
  }, [])

  return {
    preferences,
    updatePreferences,
    enableSmartAlerts,
    disableSmartAlerts,
    calculateScore: calculateObservabilityScore,
    generateMessage: generateAlertMessage,
  }
}
