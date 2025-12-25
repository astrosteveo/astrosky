import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAchievements } from './useAchievements'
import type { Observation } from '../types/observations'

// Helper to create test observations
function createObservation(overrides: Partial<Observation> = {}): Observation {
  return {
    id: `obs-${Date.now()}-${Math.random()}`,
    object: {
      type: 'planet',
      id: 'planet-mars',
      name: 'Mars',
    },
    timestamp: new Date().toISOString(),
    location: { lat: 40.7, lon: -74.0 },
    equipment: 'naked-eye',
    ...overrides,
  }
}

describe('useAchievements', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T22:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty achievements with no observations', () => {
    const { result } = renderHook(() => useAchievements([]))
    expect(result.current.earnedCount).toBe(0)
    expect(result.current.totalCount).toBeGreaterThan(0)
  })

  it('earns first-light achievement with one observation', () => {
    const observations = [createObservation()]
    const { result } = renderHook(() => useAchievements(observations))

    const firstLight = result.current.achievements.find(
      (a) => a.definition.id === 'first-light'
    )
    expect(firstLight?.earned).toBe(true)
  })

  it('tracks progress for getting-started achievement', () => {
    const observations = Array.from({ length: 5 }, () => createObservation())
    const { result } = renderHook(() => useAchievements(observations))

    const gettingStarted = result.current.achievements.find(
      (a) => a.definition.id === 'getting-started'
    )
    expect(gettingStarted?.earned).toBe(false)
    expect(gettingStarted?.current).toBe(5)
    expect(gettingStarted?.percentComplete).toBe(50)
  })

  it('earns getting-started achievement with 10 observations', () => {
    const observations = Array.from({ length: 10 }, () => createObservation())
    const { result } = renderHook(() => useAchievements(observations))

    const gettingStarted = result.current.achievements.find(
      (a) => a.definition.id === 'getting-started'
    )
    expect(gettingStarted?.earned).toBe(true)
  })

  it('tracks unique Messier objects', () => {
    const observations = [
      createObservation({
        object: { type: 'deep-sky', id: 'dso-M31', name: 'Andromeda Galaxy' },
      }),
      createObservation({
        object: { type: 'deep-sky', id: 'dso-M42', name: 'Orion Nebula' },
      }),
      createObservation({
        object: { type: 'deep-sky', id: 'dso-M31', name: 'Andromeda Galaxy' },
      }),
    ]
    const { result } = renderHook(() => useAchievements(observations))

    const messierBeginner = result.current.achievements.find(
      (a) => a.definition.id === 'messier-beginner'
    )
    expect(messierBeginner?.current).toBe(2) // Only 2 unique
  })

  it('tracks unique planets', () => {
    const observations = [
      createObservation({
        object: { type: 'planet', id: 'planet-mars', name: 'Mars' },
      }),
      createObservation({
        object: { type: 'planet', id: 'planet-jupiter', name: 'Jupiter' },
      }),
      createObservation({
        object: { type: 'planet', id: 'planet-saturn', name: 'Saturn' },
      }),
    ]
    const { result } = renderHook(() => useAchievements(observations))

    const planetSpotter = result.current.achievements.find(
      (a) => a.definition.id === 'planet-spotter'
    )
    expect(planetSpotter?.earned).toBe(true)
    expect(planetSpotter?.current).toBe(3)
  })

  it('earns equipment achievements', () => {
    const observations = [
      createObservation({ equipment: 'naked-eye' }),
      createObservation({ equipment: 'binoculars' }),
      createObservation({ equipment: 'telescope' }),
    ]
    const { result } = renderHook(() => useAchievements(observations))

    expect(
      result.current.achievements.find((a) => a.definition.id === 'naked-eye-observer')?.earned
    ).toBe(true)
    expect(
      result.current.achievements.find((a) => a.definition.id === 'binocular-user')?.earned
    ).toBe(true)
    expect(
      result.current.achievements.find((a) => a.definition.id === 'telescope-user')?.earned
    ).toBe(true)
    expect(
      result.current.achievements.find((a) => a.definition.id === 'equipment-variety')?.earned
    ).toBe(true)
  })

  it('tracks ISS observations', () => {
    const observations = [
      createObservation({
        object: { type: 'iss', id: 'iss-pass-1', name: 'ISS' },
      }),
      createObservation({
        object: { type: 'iss', id: 'iss-pass-2', name: 'ISS' },
      }),
    ]
    const { result } = renderHook(() => useAchievements(observations))

    const issSpotter = result.current.achievements.find(
      (a) => a.definition.id === 'iss-spotter'
    )
    expect(issSpotter?.earned).toBe(true)
  })

  it('tracks meteor shower observations', () => {
    const observations = [
      createObservation({
        object: { type: 'meteor-shower', id: 'perseids', name: 'Perseids' },
      }),
    ]
    const { result } = renderHook(() => useAchievements(observations))

    const meteorWatcher = result.current.achievements.find(
      (a) => a.definition.id === 'meteor-watcher'
    )
    expect(meteorWatcher?.earned).toBe(true)
  })

  it('tracks moon observations', () => {
    const observations = [
      createObservation({
        object: { type: 'moon', id: 'moon', name: 'Moon' },
      }),
    ]
    const { result } = renderHook(() => useAchievements(observations))

    const moonObserver = result.current.achievements.find(
      (a) => a.definition.id === 'moon-observer'
    )
    expect(moonObserver?.earned).toBe(true)
  })

  it('tracks late night observations', () => {
    const observations = Array.from({ length: 10 }, (_, i) =>
      createObservation({
        timestamp: new Date(`2025-06-15T0${i % 4}:00:00Z`).toISOString(),
      })
    )
    const { result } = renderHook(() => useAchievements(observations))

    const nightOwl = result.current.achievements.find(
      (a) => a.definition.id === 'night-owl'
    )
    expect(nightOwl?.earned).toBe(true)
  })

  it('calculates streak correctly', () => {
    // Create observations on consecutive days
    const today = new Date('2025-06-15')
    const observations = [
      createObservation({ timestamp: new Date(today).toISOString() }),
      createObservation({
        timestamp: new Date(today.getTime() - 86400000).toISOString(),
      }),
      createObservation({
        timestamp: new Date(today.getTime() - 86400000 * 2).toISOString(),
      }),
    ]
    const { result } = renderHook(() => useAchievements(observations))

    const weekendWarrior = result.current.achievements.find(
      (a) => a.definition.id === 'weekend-warrior'
    )
    expect(weekendWarrior?.earned).toBe(true)
    expect(weekendWarrior?.current).toBe(3)
  })

  it('provides next achievements to earn', () => {
    const observations = [createObservation()]
    const { result } = renderHook(() => useAchievements(observations))

    expect(result.current.nextToEarn.length).toBeGreaterThan(0)
    expect(result.current.nextToEarn[0].percentComplete).toBeGreaterThan(0)
    expect(result.current.nextToEarn[0].earned).toBe(false)
  })

  it('sorts achievements with earned first', () => {
    const observations = Array.from({ length: 10 }, () => createObservation())
    const { result } = renderHook(() => useAchievements(observations))

    // Earned achievements should come first
    const lastEarnedIndex = result.current.achievements
      .map((a, i) => (a.earned ? i : -1))
      .filter((i) => i >= 0)
      .pop()

    const firstNotEarnedIndex = result.current.achievements.findIndex((a) => !a.earned)

    if (lastEarnedIndex !== undefined && firstNotEarnedIndex !== -1) {
      expect(lastEarnedIndex).toBeLessThan(firstNotEarnedIndex)
    }
  })

  it('tracks unique objects for variety achievements', () => {
    const observations = Array.from({ length: 20 }, (_, i) =>
      createObservation({
        object: { type: 'planet', id: `object-${i}`, name: `Object ${i}` },
      })
    )
    const { result } = renderHook(() => useAchievements(observations))

    const varietySeeker = result.current.achievements.find(
      (a) => a.definition.id === 'variety-seeker'
    )
    expect(varietySeeker?.earned).toBe(true)
  })
})
