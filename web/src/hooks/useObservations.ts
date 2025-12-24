import { useState, useEffect, useCallback, useRef } from 'react'
import type { Observation, ObservableObject, EquipmentType, ObservationStats } from '../types/observations'
import { getDeviceId } from '../lib/deviceId'
import { syncObservations, deleteObservation as deleteObservationApi } from '../lib/api'

const STORAGE_KEY = 'astrosky-observations'
const SYNC_DEBOUNCE_MS = 2000 // Wait 2 seconds after changes before syncing

function generateId(): string {
  return `obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function loadObservations(): Observation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveObservations(observations: Observation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(observations))
}

export function useObservations() {
  const [observations, setObservations] = useState<Observation[]>(() => loadObservations())
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deviceId = getDeviceId()

  // Sync to localStorage whenever observations change
  useEffect(() => {
    saveObservations(observations)
  }, [observations])

  // Debounced sync to backend
  const syncToBackend = useCallback(async () => {
    if (observations.length === 0) return

    setSyncing(true)
    setSyncError(null)

    try {
      await syncObservations(deviceId, observations)
      setLastSynced(new Date())
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncError('Sync failed - observations saved locally')
    } finally {
      setSyncing(false)
    }
  }, [observations, deviceId])

  // Trigger sync after changes (debounced)
  useEffect(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    if (observations.length > 0) {
      syncTimeoutRef.current = setTimeout(syncToBackend, SYNC_DEBOUNCE_MS)
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [observations, syncToBackend])

  const addObservation = useCallback((
    object: ObservableObject,
    location: { lat: number; lon: number; placeName?: string },
    equipment: EquipmentType,
    notes?: string
  ): Observation => {
    const newObservation: Observation = {
      id: generateId(),
      object,
      timestamp: new Date().toISOString(),
      location,
      equipment,
      notes,
    }

    setObservations(prev => [newObservation, ...prev])
    return newObservation
  }, [])

  const removeObservation = useCallback(async (id: string) => {
    // Remove locally first for responsive UI
    setObservations(prev => prev.filter(obs => obs.id !== id))

    // Then try to remove from backend
    try {
      await deleteObservationApi(id, deviceId)
    } catch (error) {
      console.error('Failed to delete from backend:', error)
      // Local deletion still happened, which is fine
    }
  }, [deviceId])

  const updateObservation = useCallback((id: string, updates: Partial<Omit<Observation, 'id'>>) => {
    setObservations(prev => prev.map(obs =>
      obs.id === id ? { ...obs, ...updates } : obs
    ))
  }, [])

  const hasObserved = useCallback((objectId: string): boolean => {
    return observations.some(obs => obs.object.id === objectId)
  }, [observations])

  const getObservationsForObject = useCallback((objectId: string): Observation[] => {
    return observations.filter(obs => obs.object.id === objectId)
  }, [observations])

  const getStats = useCallback((): ObservationStats => {
    const uniqueIds = new Set(observations.map(o => o.object.id))
    const messierIds = observations
      .filter(o => o.object.id.startsWith('dso-M'))
      .map(o => o.object.id)
    const uniqueMessier = new Set(messierIds)

    const planets = observations
      .filter(o => o.object.type === 'planet')
      .map(o => o.object.name)
    const uniquePlanets = [...new Set(planets)]

    const sorted = [...observations].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    return {
      totalObservations: observations.length,
      uniqueObjects: uniqueIds.size,
      messierCount: uniqueMessier.size,
      planetsObserved: uniquePlanets,
      firstObservation: sorted[0]?.timestamp,
      lastObservation: sorted[sorted.length - 1]?.timestamp,
    }
  }, [observations])

  // Manual sync trigger
  const forceSync = useCallback(() => {
    syncToBackend()
  }, [syncToBackend])

  return {
    observations,
    addObservation,
    removeObservation,
    updateObservation,
    hasObserved,
    getObservationsForObject,
    getStats,
    // Sync status
    syncing,
    lastSynced,
    syncError,
    forceSync,
    deviceId,
  }
}
