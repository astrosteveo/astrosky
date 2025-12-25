import { createContext, useContext, type ReactNode } from 'react'
import { useSessions } from '../hooks/useSessions'
import type { ObservingSession, EquipmentType, SessionConditions } from '../types/observations'

interface SessionsContextType {
  sessions: ObservingSession[]
  createSession: (
    location: { lat: number; lon: number; placeName?: string; siteName?: string },
    equipment?: EquipmentType[],
    notes?: string
  ) => ObservingSession
  updateSession: (id: string, updates: Partial<Omit<ObservingSession, 'id'>>) => void
  deleteSession: (id: string) => void
  endSession: (id: string) => void
  getSessionByDate: (date: string) => ObservingSession | undefined
  getTonightSession: () => ObservingSession | undefined
  getRecentSessions: (limit?: number) => ObservingSession[]
  updateConditions: (id: string, conditions: SessionConditions) => void
  addEquipment: (id: string, equipment: EquipmentType) => void
  getSessionStats: () => {
    totalSessions: number
    totalHours: number
    uniqueLocations: number
    averageSessionsPerMonth: number
    sessionsWithNotes: number
    bestSeeing: string | null
    averageBortle: number | null
  }
}

const SessionsContext = createContext<SessionsContextType | null>(null)

export function SessionsProvider({ children }: { children: ReactNode }) {
  const sessionsHook = useSessions()

  return (
    <SessionsContext.Provider value={sessionsHook}>
      {children}
    </SessionsContext.Provider>
  )
}

export function useSessionsContext() {
  const context = useContext(SessionsContext)
  if (!context) {
    throw new Error('useSessionsContext must be used within a SessionsProvider')
  }
  return context
}
