import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SavedEquipment, EquipmentProfile } from '../types/equipment'
import { calculateLimitingMagnitude } from '../types/equipment'

const STORAGE_KEY = 'astrosky-equipment'

function generateId(): string {
  return `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function loadEquipment(): SavedEquipment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveEquipment(equipment: SavedEquipment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment))
}

export interface UseEquipmentResult {
  equipment: SavedEquipment[]
  defaultEquipment: SavedEquipment | null
  addEquipment: (profile: EquipmentProfile) => SavedEquipment
  removeEquipment: (id: string) => void
  updateEquipment: (id: string, profile: EquipmentProfile) => void
  setDefaultEquipment: (id: string) => void
  getMaxAperture: () => number
  getLimitingMagnitude: () => number
}

export function useEquipment(): UseEquipmentResult {
  const [equipment, setEquipment] = useState<SavedEquipment[]>(() => loadEquipment())

  // Persist to localStorage
  useEffect(() => {
    saveEquipment(equipment)
  }, [equipment])

  const defaultEquipment = useMemo(() => {
    return equipment.find((e) => e.isDefault) || equipment[0] || null
  }, [equipment])

  const addEquipment = useCallback((profile: EquipmentProfile): SavedEquipment => {
    const newEquipment: SavedEquipment = {
      id: generateId(),
      profile,
      isDefault: equipment.length === 0, // First one is default
      createdAt: new Date().toISOString(),
    }

    setEquipment((prev) => [...prev, newEquipment])
    return newEquipment
  }, [equipment.length])

  const removeEquipment = useCallback((id: string) => {
    setEquipment((prev) => {
      const filtered = prev.filter((e) => e.id !== id)
      // If we removed the default, make the first remaining one default
      if (filtered.length > 0 && !filtered.some((e) => e.isDefault)) {
        filtered[0].isDefault = true
      }
      return filtered
    })
  }, [])

  const updateEquipment = useCallback((id: string, profile: EquipmentProfile) => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, profile } : e))
    )
  }, [])

  const setDefaultEquipment = useCallback((id: string) => {
    setEquipment((prev) =>
      prev.map((e) => ({
        ...e,
        isDefault: e.id === id,
      }))
    )
  }, [])

  // Get the maximum aperture across all equipment
  const getMaxAperture = useCallback((): number => {
    if (equipment.length === 0) return 0
    return Math.max(...equipment.map((e) => e.profile.aperture))
  }, [equipment])

  // Get limiting magnitude based on best equipment
  const getLimitingMagnitude = useCallback((): number => {
    const maxAperture = getMaxAperture()
    if (maxAperture === 0) return 6 // Naked eye default
    return calculateLimitingMagnitude(maxAperture)
  }, [getMaxAperture])

  return {
    equipment,
    defaultEquipment,
    addEquipment,
    removeEquipment,
    updateEquipment,
    setDefaultEquipment,
    getMaxAperture,
    getLimitingMagnitude,
  }
}
