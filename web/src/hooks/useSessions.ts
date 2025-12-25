import { useState, useEffect, useCallback } from 'react'
import type { ObservingSession, EquipmentType, SessionConditions } from '../types/observations'

const STORAGE_KEY = 'astrosky-sessions'

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function loadSessions(): ObservingSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: ObservingSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

// Get tonight's date key (date changes at 6am local to keep evening sessions together)
export function getTonightDateKey(): string {
  const now = new Date()
  // If before 6am, consider it part of the previous day's observing session
  if (now.getHours() < 6) {
    now.setDate(now.getDate() - 1)
  }
  return now.toISOString().split('T')[0]
}

export function useSessions() {
  const [sessions, setSessions] = useState<ObservingSession[]>(() => loadSessions())

  // Sync to localStorage whenever sessions change
  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  const createSession = useCallback((
    location: { lat: number; lon: number; placeName?: string; siteName?: string },
    equipment: EquipmentType[] = [],
    notes?: string
  ): ObservingSession => {
    const dateKey = getTonightDateKey()
    const newSession: ObservingSession = {
      id: generateId(),
      date: dateKey,
      startTime: new Date().toISOString(),
      location,
      equipment,
      notes,
    }

    setSessions(prev => [newSession, ...prev])
    return newSession
  }, [])

  const updateSession = useCallback((id: string, updates: Partial<Omit<ObservingSession, 'id'>>) => {
    setSessions(prev => prev.map(session =>
      session.id === id ? { ...session, ...updates } : session
    ))
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id))
  }, [])

  const endSession = useCallback((id: string) => {
    setSessions(prev => prev.map(session =>
      session.id === id ? { ...session, endTime: new Date().toISOString() } : session
    ))
  }, [])

  const getSessionByDate = useCallback((date: string): ObservingSession | undefined => {
    return sessions.find(session => session.date === date)
  }, [sessions])

  const getTonightSession = useCallback((): ObservingSession | undefined => {
    const tonight = getTonightDateKey()
    return sessions.find(session => session.date === tonight)
  }, [sessions])

  const getRecentSessions = useCallback((limit: number = 10): ObservingSession[] => {
    return [...sessions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }, [sessions])

  const updateConditions = useCallback((id: string, conditions: SessionConditions) => {
    setSessions(prev => prev.map(session =>
      session.id === id
        ? { ...session, conditions: { ...session.conditions, ...conditions } }
        : session
    ))
  }, [])

  const addEquipment = useCallback((id: string, equipment: EquipmentType) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== id) return session
      const currentEquipment = session.equipment || []
      if (currentEquipment.includes(equipment)) return session
      return { ...session, equipment: [...currentEquipment, equipment] }
    }))
  }, [])

  const getSessionStats = useCallback(() => {
    const totalSessions = sessions.length
    const totalHours = sessions.reduce((acc, session) => {
      if (session.startTime && session.endTime) {
        const start = new Date(session.startTime).getTime()
        const end = new Date(session.endTime).getTime()
        return acc + (end - start) / 3600000
      }
      return acc
    }, 0)

    // Count unique locations
    const uniqueLocations = new Set(
      sessions.map(s => s.location.siteName || s.location.placeName || `${s.location.lat},${s.location.lon}`)
    )

    // Average conditions
    const sessionsWithSeeing = sessions.filter(s => s.conditions?.seeing)
    const sessionsWithBortle = sessions.filter(s => s.conditions?.bortleClass)

    return {
      totalSessions,
      totalHours: Math.round(totalHours * 10) / 10,
      uniqueLocations: uniqueLocations.size,
      averageSessionsPerMonth: totalSessions > 0
        ? Math.round((totalSessions / Math.max(1, getMonthsSpan(sessions))) * 10) / 10
        : 0,
      sessionsWithNotes: sessions.filter(s => s.notes).length,
      bestSeeing: sessionsWithSeeing.length > 0
        ? getMostCommon(sessionsWithSeeing.map(s => s.conditions!.seeing!))
        : null,
      averageBortle: sessionsWithBortle.length > 0
        ? Math.round(sessionsWithBortle.reduce((a, s) => a + s.conditions!.bortleClass!, 0) / sessionsWithBortle.length)
        : null,
    }
  }, [sessions])

  return {
    sessions,
    createSession,
    updateSession,
    deleteSession,
    endSession,
    getSessionByDate,
    getTonightSession,
    getRecentSessions,
    updateConditions,
    addEquipment,
    getSessionStats,
  }
}

// Helper functions
function getMonthsSpan(sessions: ObservingSession[]): number {
  if (sessions.length === 0) return 1
  const dates = sessions.map(s => new Date(s.date).getTime())
  const oldest = Math.min(...dates)
  const newest = Math.max(...dates)
  return Math.max(1, Math.ceil((newest - oldest) / (30 * 24 * 60 * 60 * 1000)))
}

function getMostCommon<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  const counts = new Map<T, number>()
  arr.forEach(item => counts.set(item, (counts.get(item) || 0) + 1))
  let maxCount = 0
  let maxItem: T | null = null
  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count
      maxItem = item
    }
  })
  return maxItem
}
