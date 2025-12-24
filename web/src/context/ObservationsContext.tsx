import { createContext, useContext, type ReactNode } from 'react'
import { useObservations } from '../hooks/useObservations'
import type { Observation, ObservableObject, EquipmentType, ObservationStats } from '../types/observations'

interface ObservationsContextType {
  observations: Observation[]
  addObservation: (
    object: ObservableObject,
    location: { lat: number; lon: number; placeName?: string },
    equipment: EquipmentType,
    notes?: string
  ) => Observation
  removeObservation: (id: string) => void
  updateObservation: (id: string, updates: Partial<Omit<Observation, 'id'>>) => void
  hasObserved: (objectId: string) => boolean
  getObservationsForObject: (objectId: string) => Observation[]
  getStats: () => ObservationStats
  // Sync status
  syncing: boolean
  lastSynced: Date | null
  syncError: string | null
  forceSync: () => void
  deviceId: string
}

const ObservationsContext = createContext<ObservationsContextType | null>(null)

export function ObservationsProvider({ children }: { children: ReactNode }) {
  const observationsHook = useObservations()

  return (
    <ObservationsContext.Provider value={observationsHook}>
      {children}
    </ObservationsContext.Provider>
  )
}

export function useObservationsContext() {
  const context = useContext(ObservationsContext)
  if (!context) {
    throw new Error('useObservationsContext must be used within an ObservationsProvider')
  }
  return context
}
