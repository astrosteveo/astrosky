import { useMemo } from 'react'
import type { Observation } from '../types/observations'
import {
  ACHIEVEMENTS,
  type AchievementDefinition,
  type AchievementProgress,
} from '../types/achievements'

interface AchievementStats {
  totalObservations: number
  uniqueMessier: Set<string>
  uniquePlanets: Set<string>
  uniqueObjects: Set<string>
  longestStreak: number
  currentStreak: number
  equipmentUsed: Set<string>
  issCount: number
  meteorShowers: Set<string>
  moonObserved: boolean
  lateNightCount: number // After midnight
  earlyMorningCount: number // 4-6 AM
}

function calculateStreak(observations: Observation[]): { current: number; longest: number } {
  if (observations.length === 0) return { current: 0, longest: 0 }

  // Get unique observation dates
  const dates = new Set<string>()
  observations.forEach((obs) => {
    const date = new Date(obs.timestamp).toISOString().split('T')[0]
    dates.add(date)
  })

  const sortedDates = Array.from(dates).sort().reverse()
  if (sortedDates.length === 0) return { current: 0, longest: 0 }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Current streak: must include today or yesterday
  let currentStreak = 0
  const lastDate = sortedDates[0]
  if (lastDate === today || lastDate === yesterday) {
    currentStreak = 1
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000)
      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Longest streak
  let longestStreak = 0
  let tempStreak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currDate = new Date(sortedDates[i])
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000)
    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { current: currentStreak, longest: longestStreak }
}

function gatherStats(observations: Observation[]): AchievementStats {
  const stats: AchievementStats = {
    totalObservations: observations.length,
    uniqueMessier: new Set(),
    uniquePlanets: new Set(),
    uniqueObjects: new Set(),
    longestStreak: 0,
    currentStreak: 0,
    equipmentUsed: new Set(),
    issCount: 0,
    meteorShowers: new Set(),
    moonObserved: false,
    lateNightCount: 0,
    earlyMorningCount: 0,
  }

  observations.forEach((obs) => {
    // Track unique objects
    stats.uniqueObjects.add(obs.object.id)

    // Track equipment
    stats.equipmentUsed.add(obs.equipment)

    // Track Messier objects
    if (obs.object.id.startsWith('dso-M')) {
      stats.uniqueMessier.add(obs.object.id)
    }

    // Track planets
    if (obs.object.type === 'planet') {
      stats.uniquePlanets.add(obs.object.name)
    }

    // Track ISS
    if (obs.object.type === 'iss') {
      stats.issCount++
    }

    // Track meteor showers
    if (obs.object.type === 'meteor-shower') {
      stats.meteorShowers.add(obs.object.id)
    }

    // Track moon
    if (obs.object.type === 'moon') {
      stats.moonObserved = true
    }

    // Track time-based observations
    const hour = new Date(obs.timestamp).getHours()
    if (hour >= 0 && hour < 4) {
      stats.lateNightCount++
    }
    if (hour >= 4 && hour < 6) {
      stats.earlyMorningCount++
    }
  })

  // Calculate streaks
  const streaks = calculateStreak(observations)
  stats.currentStreak = streaks.current
  stats.longestStreak = streaks.longest

  return stats
}

function getProgressForAchievement(
  achievement: AchievementDefinition,
  stats: AchievementStats
): number {
  switch (achievement.id) {
    // Observation counts
    case 'first-light':
    case 'getting-started':
    case 'dedicated-observer':
    case 'seasoned-stargazer':
    case 'master-astronomer':
      return stats.totalObservations

    // Messier
    case 'messier-beginner':
    case 'messier-hunter':
    case 'messier-explorer':
    case 'messier-marathon':
      return stats.uniqueMessier.size

    // Planets
    case 'planet-spotter':
    case 'solar-system-tourist':
    case 'planet-collector':
      return stats.uniquePlanets.size

    // Streaks (use longest for achievement tracking)
    case 'weekend-warrior':
    case 'week-streak':
    case 'fortnight-streak':
    case 'month-streak':
      return stats.longestStreak

    // Equipment
    case 'naked-eye-observer':
      return stats.equipmentUsed.has('naked-eye') ? 1 : 0
    case 'binocular-user':
      return stats.equipmentUsed.has('binoculars') ? 1 : 0
    case 'telescope-user':
      return stats.equipmentUsed.has('telescope') ? 1 : 0
    case 'equipment-variety':
      return stats.equipmentUsed.size

    // Object types
    case 'iss-spotter':
      return stats.issCount > 0 ? 1 : 0
    case 'iss-regular':
      return stats.issCount
    case 'meteor-watcher':
      return stats.meteorShowers.size > 0 ? 1 : 0
    case 'meteor-chaser':
      return stats.meteorShowers.size
    case 'moon-observer':
      return stats.moonObserved ? 1 : 0

    // Dedication
    case 'night-owl':
      return stats.lateNightCount
    case 'early-bird':
      return stats.earlyMorningCount
    case 'variety-seeker':
    case 'object-master':
      return stats.uniqueObjects.size

    default:
      return 0
  }
}

export interface UseAchievementsResult {
  achievements: AchievementProgress[]
  earnedCount: number
  totalCount: number
  recentlyEarned: AchievementProgress[]
  nextToEarn: AchievementProgress[]
  stats: AchievementStats
}

export function useAchievements(observations: Observation[]): UseAchievementsResult {
  return useMemo(() => {
    const stats = gatherStats(observations)

    const achievements: AchievementProgress[] = ACHIEVEMENTS.map((definition) => {
      const current = getProgressForAchievement(definition, stats)
      const earned = current >= definition.requirement
      const percentComplete = Math.min(100, Math.round((current / definition.requirement) * 100))

      return {
        definition,
        current,
        earned,
        percentComplete,
      }
    })

    // Sort by earned status, then by percent complete
    const sorted = [...achievements].sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1
      return b.percentComplete - a.percentComplete
    })

    const earnedAchievements = sorted.filter((a) => a.earned)
    const inProgressAchievements = sorted.filter((a) => !a.earned && a.percentComplete > 0)

    // Get next achievements to earn (in progress, sorted by closest to completion)
    const nextToEarn = inProgressAchievements
      .sort((a, b) => b.percentComplete - a.percentComplete)
      .slice(0, 3)

    return {
      achievements: sorted,
      earnedCount: earnedAchievements.length,
      totalCount: ACHIEVEMENTS.length,
      recentlyEarned: earnedAchievements.slice(0, 5),
      nextToEarn,
      stats,
    }
  }, [observations])
}
