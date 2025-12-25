import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessions, getTonightDateKey } from './useSessions'

describe('useSessions', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getTonightDateKey', () => {
    it('returns today date after 6am', () => {
      vi.setSystemTime(new Date('2025-01-15T10:00:00'))
      expect(getTonightDateKey()).toBe('2025-01-15')
    })

    it('returns yesterday date before 6am (same observing night)', () => {
      vi.setSystemTime(new Date('2025-01-15T03:00:00'))
      expect(getTonightDateKey()).toBe('2025-01-14')
    })

    it('returns yesterday at 5:59am', () => {
      vi.setSystemTime(new Date('2025-01-15T05:59:00'))
      expect(getTonightDateKey()).toBe('2025-01-14')
    })

    it('returns today at 6:00am', () => {
      vi.setSystemTime(new Date('2025-01-15T06:00:00'))
      expect(getTonightDateKey()).toBe('2025-01-15')
    })
  })

  describe('createSession', () => {
    it('creates a new session with location', () => {
      vi.setSystemTime(new Date('2025-01-15T20:00:00'))

      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession(
          { lat: 40.7128, lon: -74.006, placeName: 'New York' },
          ['telescope'],
          'First session'
        )
      })

      expect(result.current.sessions).toHaveLength(1)
      expect(result.current.sessions[0].date).toBe('2025-01-15')
      expect(result.current.sessions[0].location.placeName).toBe('New York')
      expect(result.current.sessions[0].equipment).toEqual(['telescope'])
      expect(result.current.sessions[0].notes).toBe('First session')
      expect(result.current.sessions[0].startTime).toBeDefined()
    })

    it('assigns unique IDs to sessions', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
        result.current.createSession({ lat: 41, lon: -75 })
      })

      expect(result.current.sessions[0].id).not.toBe(result.current.sessions[1].id)
    })
  })

  describe('updateSession', () => {
    it('updates session notes', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
      })

      const sessionId = result.current.sessions[0].id

      act(() => {
        result.current.updateSession(sessionId, { notes: 'Updated notes' })
      })

      expect(result.current.sessions[0].notes).toBe('Updated notes')
    })

    it('updates session conditions', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
      })

      const sessionId = result.current.sessions[0].id

      act(() => {
        result.current.updateSession(sessionId, {
          conditions: { seeing: 'excellent', bortleClass: 4 }
        })
      })

      expect(result.current.sessions[0].conditions?.seeing).toBe('excellent')
      expect(result.current.sessions[0].conditions?.bortleClass).toBe(4)
    })
  })

  describe('endSession', () => {
    it('sets endTime on session', () => {
      vi.setSystemTime(new Date('2025-01-15T20:00:00'))

      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
      })

      const sessionId = result.current.sessions[0].id

      vi.setSystemTime(new Date('2025-01-15T23:30:00'))

      act(() => {
        result.current.endSession(sessionId)
      })

      expect(result.current.sessions[0].endTime).toBeDefined()
      expect(new Date(result.current.sessions[0].endTime!).getHours()).toBe(23)
    })
  })

  describe('deleteSession', () => {
    it('removes session from list', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
        result.current.createSession({ lat: 41, lon: -75 })
      })

      expect(result.current.sessions).toHaveLength(2)

      const sessionToDelete = result.current.sessions[0].id

      act(() => {
        result.current.deleteSession(sessionToDelete)
      })

      expect(result.current.sessions).toHaveLength(1)
      expect(result.current.sessions.find(s => s.id === sessionToDelete)).toBeUndefined()
    })
  })

  describe('getTonightSession', () => {
    it('returns session for current date', () => {
      vi.setSystemTime(new Date('2025-01-15T20:00:00'))

      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
      })

      const tonightSession = result.current.getTonightSession()
      expect(tonightSession).toBeDefined()
      expect(tonightSession?.date).toBe('2025-01-15')
    })

    it('returns undefined if no session exists for tonight', () => {
      vi.setSystemTime(new Date('2025-01-15T20:00:00'))

      const { result } = renderHook(() => useSessions())

      // Create a session for a different date
      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
      })

      // Move to next day
      vi.setSystemTime(new Date('2025-01-16T20:00:00'))

      const tonightSession = result.current.getTonightSession()
      expect(tonightSession).toBeUndefined()
    })
  })

  describe('getRecentSessions', () => {
    it('returns sessions sorted by date descending', () => {
      const { result } = renderHook(() => useSessions())

      vi.setSystemTime(new Date('2025-01-10T20:00:00'))
      act(() => { result.current.createSession({ lat: 40, lon: -74 }) })

      vi.setSystemTime(new Date('2025-01-15T20:00:00'))
      act(() => { result.current.createSession({ lat: 40, lon: -74 }) })

      vi.setSystemTime(new Date('2025-01-12T20:00:00'))
      act(() => { result.current.createSession({ lat: 40, lon: -74 }) })

      const recent = result.current.getRecentSessions(10)

      expect(recent[0].date).toBe('2025-01-15')
      expect(recent[1].date).toBe('2025-01-12')
      expect(recent[2].date).toBe('2025-01-10')
    })

    it('limits results to specified count', () => {
      const { result } = renderHook(() => useSessions())

      for (let i = 0; i < 10; i++) {
        vi.setSystemTime(new Date(`2025-01-${10 + i}T20:00:00`))
        act(() => { result.current.createSession({ lat: 40, lon: -74 }) })
      }

      const recent = result.current.getRecentSessions(3)
      expect(recent).toHaveLength(3)
    })
  })

  describe('addEquipment', () => {
    it('adds equipment to session', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 }, ['naked-eye'])
      })

      const sessionId = result.current.sessions[0].id

      act(() => {
        result.current.addEquipment(sessionId, 'telescope')
      })

      expect(result.current.sessions[0].equipment).toContain('naked-eye')
      expect(result.current.sessions[0].equipment).toContain('telescope')
    })

    it('does not duplicate equipment', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 }, ['telescope'])
      })

      const sessionId = result.current.sessions[0].id

      act(() => {
        result.current.addEquipment(sessionId, 'telescope')
      })

      expect(result.current.sessions[0].equipment).toHaveLength(1)
    })
  })

  describe('updateConditions', () => {
    it('updates session conditions', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
      })

      const sessionId = result.current.sessions[0].id

      act(() => {
        result.current.updateConditions(sessionId, { seeing: 'good', transparency: 'excellent' })
      })

      expect(result.current.sessions[0].conditions?.seeing).toBe('good')
      expect(result.current.sessions[0].conditions?.transparency).toBe('excellent')
    })

    it('merges with existing conditions', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 })
      })

      const sessionId = result.current.sessions[0].id

      act(() => {
        result.current.updateConditions(sessionId, { seeing: 'good' })
      })

      act(() => {
        result.current.updateConditions(sessionId, { bortleClass: 5 })
      })

      expect(result.current.sessions[0].conditions?.seeing).toBe('good')
      expect(result.current.sessions[0].conditions?.bortleClass).toBe(5)
    })
  })

  describe('getSessionStats', () => {
    it('calculates session statistics', () => {
      const { result } = renderHook(() => useSessions())

      vi.setSystemTime(new Date('2025-01-15T20:00:00'))
      act(() => {
        result.current.createSession(
          { lat: 40, lon: -74, siteName: 'Backyard' },
          ['telescope'],
          'Session 1'
        )
      })

      vi.setSystemTime(new Date('2025-01-16T20:00:00'))
      act(() => {
        result.current.createSession(
          { lat: 40, lon: -74, siteName: 'Backyard' },
          ['binoculars']
        )
      })

      vi.setSystemTime(new Date('2025-01-17T20:00:00'))
      act(() => {
        result.current.createSession(
          { lat: 41, lon: -75, siteName: 'Dark Site' },
          ['telescope'],
          'Session 3'
        )
      })

      const stats = result.current.getSessionStats()

      expect(stats.totalSessions).toBe(3)
      expect(stats.uniqueLocations).toBe(2)
      expect(stats.sessionsWithNotes).toBe(2)
    })
  })

  describe('localStorage persistence', () => {
    it('persists sessions to localStorage', () => {
      const { result } = renderHook(() => useSessions())

      act(() => {
        result.current.createSession({ lat: 40, lon: -74 }, [], 'Test session')
      })

      const stored = localStorage.getItem('astrosky-sessions')
      expect(stored).toBeDefined()

      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].notes).toBe('Test session')
    })

    it('loads sessions from localStorage on mount', () => {
      const testSession = {
        id: 'session-test',
        date: '2025-01-15',
        location: { lat: 40, lon: -74 },
        equipment: ['telescope'],
        notes: 'Stored session',
      }

      localStorage.setItem('astrosky-sessions', JSON.stringify([testSession]))

      const { result } = renderHook(() => useSessions())

      expect(result.current.sessions).toHaveLength(1)
      expect(result.current.sessions[0].notes).toBe('Stored session')
    })
  })
})
