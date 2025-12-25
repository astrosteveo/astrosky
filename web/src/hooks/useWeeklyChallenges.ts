import { useState, useEffect, useCallback, useMemo } from 'react'

export type ChallengeType =
  | 'observe_planets'
  | 'observe_dsos'
  | 'observe_constellation'
  | 'observe_type'
  | 'streak'
  | 'variety'
  | 'moon_phase'

export interface Challenge {
  id: string
  type: ChallengeType
  title: string
  description: string
  icon: string
  target: number
  targetIds?: string[] // Specific object IDs to observe
  targetType?: string // For type-based challenges (galaxy, nebula, etc.)
  targetConstellation?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xpReward: number
}

export interface ActiveChallenge extends Challenge {
  weekStart: string // ISO date of the week start
  progress: number
  completed: boolean
  completedAt?: string
}

export interface ChallengeProgress {
  challengeId: string
  progress: number
  completed: boolean
  completedAt?: string
}

const STORAGE_KEY = 'astrosky-challenges'

// Challenge templates - rotated weekly
const CHALLENGE_POOL: Challenge[] = [
  // Easy challenges
  {
    id: 'planets-3',
    type: 'observe_planets',
    title: 'Planet Hunter',
    description: 'Observe 3 different planets this week',
    icon: '🪐',
    target: 3,
    difficulty: 'Easy',
    xpReward: 50,
  },
  {
    id: 'moon-observer',
    type: 'moon_phase',
    title: 'Moon Watcher',
    description: 'Observe the Moon twice this week',
    icon: '🌙',
    target: 2,
    difficulty: 'Easy',
    xpReward: 30,
  },
  {
    id: 'dso-beginner',
    type: 'observe_dsos',
    title: 'Deep Sky Explorer',
    description: 'Find 2 deep sky objects',
    icon: '✨',
    target: 2,
    difficulty: 'Easy',
    xpReward: 50,
  },
  {
    id: 'streak-3',
    type: 'streak',
    title: 'Night Owl',
    description: 'Log observations on 3 different nights',
    icon: '🦉',
    target: 3,
    difficulty: 'Easy',
    xpReward: 60,
  },

  // Medium challenges
  {
    id: 'orion-hunt',
    type: 'observe_constellation',
    title: 'Orion Quest',
    description: 'Observe 3 objects in Orion',
    icon: '🏹',
    target: 3,
    targetConstellation: 'Orion',
    difficulty: 'Medium',
    xpReward: 100,
  },
  {
    id: 'galaxy-finder',
    type: 'observe_type',
    title: 'Galaxy Hunter',
    description: 'Observe 3 galaxies',
    icon: '🌌',
    target: 3,
    targetType: 'Galaxy',
    difficulty: 'Medium',
    xpReward: 120,
  },
  {
    id: 'cluster-collector',
    type: 'observe_type',
    title: 'Cluster Collector',
    description: 'Observe 4 star clusters',
    icon: '⭐',
    target: 4,
    targetType: 'Cluster',
    difficulty: 'Medium',
    xpReward: 100,
  },
  {
    id: 'variety-5',
    type: 'variety',
    title: 'Sky Sampler',
    description: 'Observe 5 different types of objects',
    icon: '🎨',
    target: 5,
    difficulty: 'Medium',
    xpReward: 100,
  },

  // Hard challenges
  {
    id: 'messier-5',
    type: 'observe_dsos',
    title: 'Messier Marathon',
    description: 'Observe 5 Messier objects',
    icon: '🏃',
    target: 5,
    targetIds: ['M1', 'M13', 'M31', 'M42', 'M45', 'M51', 'M57', 'M81', 'M82', 'M101'],
    difficulty: 'Hard',
    xpReward: 200,
  },
  {
    id: 'streak-5',
    type: 'streak',
    title: 'Dedicated Observer',
    description: 'Log observations on 5 different nights',
    icon: '🔥',
    target: 5,
    difficulty: 'Hard',
    xpReward: 150,
  },
  {
    id: 'nebula-hunter',
    type: 'observe_type',
    title: 'Nebula Hunter',
    description: 'Observe 4 nebulae',
    icon: '💨',
    target: 4,
    targetType: 'Nebula',
    difficulty: 'Hard',
    xpReward: 180,
  },
]

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getChallengesForWeek(weekNumber: number): Challenge[] {
  // Use week number to deterministically select 3 challenges
  // One easy, one medium, one hard
  const easy = CHALLENGE_POOL.filter(c => c.difficulty === 'Easy')
  const medium = CHALLENGE_POOL.filter(c => c.difficulty === 'Medium')
  const hard = CHALLENGE_POOL.filter(c => c.difficulty === 'Hard')

  return [
    easy[weekNumber % easy.length],
    medium[weekNumber % medium.length],
    hard[weekNumber % hard.length],
  ]
}

interface StoredProgress {
  weekStart: string
  challenges: ChallengeProgress[]
  totalXP: number
}

function loadProgress(): StoredProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return { weekStart: '', challenges: [], totalXP: 0 }
}

function saveProgress(progress: StoredProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export interface UseWeeklyChallengesResult {
  challenges: ActiveChallenge[]
  totalXP: number
  weekStart: string
  daysRemaining: number
  updateProgress: (challengeId: string, observedIds: string[]) => void
  markCompleted: (challengeId: string) => void
  getChallengeProgress: (challengeId: string) => number
}

export function useWeeklyChallenges(
  observedObjectIds: string[]
): UseWeeklyChallengesResult {
  const [storedProgress, setStoredProgress] = useState<StoredProgress>(loadProgress)

  const currentWeekStart = useMemo(() => getWeekStart(), [])
  const weekNumber = useMemo(() => getWeekNumber(), [])

  // Get this week's challenges
  const weekChallenges = useMemo(() => getChallengesForWeek(weekNumber), [weekNumber])

  // Check if we need to reset for a new week
  useEffect(() => {
    if (storedProgress.weekStart !== currentWeekStart) {
      // New week - reset progress but keep XP
      const newProgress: StoredProgress = {
        weekStart: currentWeekStart,
        challenges: weekChallenges.map(c => ({
          challengeId: c.id,
          progress: 0,
          completed: false,
        })),
        totalXP: storedProgress.totalXP,
      }
      setStoredProgress(newProgress)
      saveProgress(newProgress)
    }
  }, [currentWeekStart, weekChallenges, storedProgress.weekStart, storedProgress.totalXP])

  // Calculate days remaining
  const daysRemaining = useMemo(() => {
    const weekStart = new Date(currentWeekStart)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const now = new Date()
    const diff = weekEnd.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [currentWeekStart])

  // Auto-update progress when observations change
  useEffect(() => {
    if (observedObjectIds.length === 0 || storedProgress.weekStart !== currentWeekStart) return

    // Calculate progress for each challenge based on observations
    weekChallenges.forEach(challenge => {
      let progress = 0
      switch (challenge.type) {
        case 'observe_planets':
          progress = observedObjectIds.filter(id => id.startsWith('planet-')).length
          break
        case 'observe_dsos':
          if (challenge.targetIds) {
            progress = challenge.targetIds.filter(id => observedObjectIds.includes(id)).length
          } else {
            progress = observedObjectIds.filter(id => id.startsWith('M') || id.startsWith('NGC')).length
          }
          break
        case 'moon_phase':
          progress = observedObjectIds.includes('moon') ? 1 : 0
          break
        default:
          progress = Math.min(challenge.target, observedObjectIds.length)
      }

      const existingProgress = storedProgress.challenges.find(p => p.challengeId === challenge.id)
      if (existingProgress && progress > existingProgress.progress) {
        // Update if we have more progress
        const completed = progress >= challenge.target
        const wasCompleted = existingProgress.completed
        const xpGain = completed && !wasCompleted ? challenge.xpReward : 0

        setStoredProgress(prev => {
          const updatedChallenges = prev.challenges.map(p => {
            if (p.challengeId === challenge.id) {
              return {
                ...p,
                progress,
                completed,
                completedAt: completed && !wasCompleted ? new Date().toISOString() : p.completedAt,
              }
            }
            return p
          })

          const newState = {
            ...prev,
            challenges: updatedChallenges,
            totalXP: prev.totalXP + xpGain,
          }
          saveProgress(newState)
          return newState
        })
      }
    })
  }, [observedObjectIds, weekChallenges, storedProgress.weekStart, storedProgress.challenges, currentWeekStart])

  // Build active challenges with progress
  const challenges: ActiveChallenge[] = useMemo(() => {
    return weekChallenges.map(challenge => {
      const progress = storedProgress.challenges.find(
        p => p.challengeId === challenge.id
      )
      return {
        ...challenge,
        weekStart: currentWeekStart,
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt,
      }
    })
  }, [weekChallenges, storedProgress.challenges, currentWeekStart])

  // Update progress based on observations
  const updateProgress = useCallback(
    (challengeId: string, newObservedIds: string[]) => {
      setStoredProgress(prev => {
        const challenge = weekChallenges.find(c => c.id === challengeId)
        if (!challenge) return prev

        // Calculate progress based on challenge type
        let progress = 0
        switch (challenge.type) {
          case 'observe_planets':
            progress = newObservedIds.filter(id => id.startsWith('planet-')).length
            break
          case 'observe_dsos':
            if (challenge.targetIds) {
              progress = challenge.targetIds.filter(id => newObservedIds.includes(id)).length
            } else {
              progress = newObservedIds.filter(id => id.startsWith('M') || id.startsWith('NGC')).length
            }
            break
          case 'observe_type':
            // This would need DSO type info passed in
            progress = Math.min(challenge.target, newObservedIds.length)
            break
          case 'streak':
            // Count unique observation days
            // For simplicity, count observations as proxy
            progress = Math.min(challenge.target, newObservedIds.length)
            break
          case 'moon_phase':
            progress = newObservedIds.includes('moon') ? Math.min(challenge.target, 2) : 0
            break
          default:
            progress = Math.min(challenge.target, newObservedIds.length)
        }

        const completed = progress >= challenge.target
        const existingProgress = prev.challenges.find(p => p.challengeId === challengeId)
        const wasCompleted = existingProgress?.completed || false

        // Calculate XP gain
        const xpGain = completed && !wasCompleted ? challenge.xpReward : 0

        const updatedChallenges = prev.challenges.map(p => {
          if (p.challengeId === challengeId) {
            return {
              ...p,
              progress,
              completed,
              completedAt: completed && !wasCompleted ? new Date().toISOString() : p.completedAt,
            }
          }
          return p
        })

        const newState = {
          ...prev,
          challenges: updatedChallenges,
          totalXP: prev.totalXP + xpGain,
        }
        saveProgress(newState)
        return newState
      })
    },
    [weekChallenges]
  )

  const markCompleted = useCallback((challengeId: string) => {
    setStoredProgress(prev => {
      const challenge = weekChallenges.find(c => c.id === challengeId)
      if (!challenge) return prev

      const existingProgress = prev.challenges.find(p => p.challengeId === challengeId)
      if (existingProgress?.completed) return prev

      const updatedChallenges = prev.challenges.map(p => {
        if (p.challengeId === challengeId) {
          return {
            ...p,
            progress: challenge.target,
            completed: true,
            completedAt: new Date().toISOString(),
          }
        }
        return p
      })

      const newState = {
        ...prev,
        challenges: updatedChallenges,
        totalXP: prev.totalXP + challenge.xpReward,
      }
      saveProgress(newState)
      return newState
    })
  }, [weekChallenges])

  const getChallengeProgress = useCallback(
    (challengeId: string): number => {
      const progress = storedProgress.challenges.find(p => p.challengeId === challengeId)
      return progress?.progress || 0
    },
    [storedProgress.challenges]
  )

  return {
    challenges,
    totalXP: storedProgress.totalXP,
    weekStart: currentWeekStart,
    daysRemaining,
    updateProgress,
    markCompleted,
    getChallengeProgress,
  }
}
