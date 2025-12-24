import { useState, useEffect, useCallback } from 'react'
import type { Observation, ObservableObject, EquipmentType, ObservationStats } from '../types/observations'

const STORAGE_KEY = 'astrosky-observations'

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

  // Sync to localStorage whenever observations change
  useEffect(() => {
    saveObservations(observations)
  }, [observations])

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

  const removeObservation = useCallback((id: string) => {
    setObservations(prev => prev.filter(obs => obs.id !== id))
  }, [])

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

  return {
    observations,
    addObservation,
    removeObservation,
    updateObservation,
    hasObserved,
    getObservationsForObject,
    getStats,
  }
}
