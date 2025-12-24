// Observation logging types

export type EquipmentType = 'naked-eye' | 'binoculars' | 'telescope'

export type ObservableObjectType =
  | 'planet'
  | 'moon'
  | 'deep-sky'
  | 'meteor-shower'
  | 'iss'
  | 'event'

export interface ObservableObject {
  type: ObservableObjectType
  id: string // e.g., "planet-mars", "dso-M31", "moon"
  name: string
  details?: string // e.g., "Galaxy in Andromeda"
}

export interface Observation {
  id: string
  object: ObservableObject
  timestamp: string // ISO string
  location: {
    lat: number
    lon: number
    placeName?: string // "San Francisco, CA" via reverse geocoding
  }
  equipment: EquipmentType
  notes?: string
  conditions?: {
    darkness?: string // "Excellent", "Good", etc.
    seeing?: 'poor' | 'fair' | 'good' | 'excellent'
  }
}

export interface ObservationStats {
  totalObservations: number
  uniqueObjects: number
  messierCount: number // out of 110
  planetsObserved: string[]
  firstObservation?: string // ISO date
  lastObservation?: string // ISO date
}
