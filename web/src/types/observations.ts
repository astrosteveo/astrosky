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
  photos?: string[] // Base64 encoded images or blob URLs
  conditions?: {
    darkness?: string // "Excellent", "Good", etc.
    seeing?: 'poor' | 'fair' | 'good' | 'excellent'
  }
}

// Notification preferences
export interface NotificationPreferences {
  enabled: boolean
  issPass: boolean
  meteorPeak: boolean
  celestialEvent: boolean
  reminderMinutes: number // How many minutes before event
}

export interface ObservationStats {
  totalObservations: number
  uniqueObjects: number
  messierCount: number // out of 110
  planetsObserved: string[]
  firstObservation?: string // ISO date
  lastObservation?: string // ISO date
}

// Session notes - document an entire observing session (night)
export type SeeingCondition = 'poor' | 'fair' | 'good' | 'excellent'
export type TransparencyCondition = 'poor' | 'fair' | 'good' | 'excellent'

export interface SessionConditions {
  seeing?: SeeingCondition
  transparency?: TransparencyCondition
  temperature?: number // Celsius
  humidity?: number // Percentage
  cloudCover?: number // Percentage
  bortleClass?: number // 1-9 scale
}

export interface ObservingSession {
  id: string
  date: string // ISO date (YYYY-MM-DD) - the night of observation
  startTime?: string // ISO datetime when session started
  endTime?: string // ISO datetime when session ended
  location: {
    lat: number
    lon: number
    placeName?: string
    siteName?: string // Custom name like "Backyard" or "Dark Site #2"
  }
  equipment: EquipmentType[] // Multiple equipment can be used in a session
  conditions?: SessionConditions
  notes?: string // General session notes
  highlights?: string // Best sights of the night
}
