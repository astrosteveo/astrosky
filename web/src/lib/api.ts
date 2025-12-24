import type { Observation } from '../types/observations'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchReport(lat: number, lon: number, date?: string) {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  })
  if (date) {
    params.append('date', date)
  }

  const response = await fetch(`${API_BASE_URL}/api/report?${params}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

// Observation sync API

export interface SyncResponse {
  synced: number
  device_observations: Observation[]
}

export interface NearbyStats {
  object_id: string
  object_name: string
  object_type: string
  observation_count: number
  latest_observation: string
  equipment_breakdown: Record<string, number>
}

export async function syncObservations(
  deviceId: string,
  observations: Observation[]
): Promise<SyncResponse> {
  const response = await fetch(`${API_BASE_URL}/api/observations/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_id: deviceId,
      observations: observations.map(obs => ({
        id: obs.id,
        device_id: deviceId,
        object_type: obs.object.type,
        object_id: obs.object.id,
        object_name: obs.object.name,
        object_details: obs.object.details,
        timestamp: obs.timestamp,
        lat: obs.location.lat,
        lon: obs.location.lon,
        place_name: obs.location.placeName,
        equipment: obs.equipment,
        notes: obs.notes,
      })),
    }),
  })

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchMyObservations(deviceId: string): Promise<Observation[]> {
  const params = new URLSearchParams({ device_id: deviceId })
  const response = await fetch(`${API_BASE_URL}/api/observations/mine?${params}`)

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`)
  }

  const data = await response.json()

  // Transform backend format to frontend format
  return data.map((obs: Record<string, unknown>) => ({
    id: obs.id,
    object: {
      type: obs.object_type,
      id: obs.object_id,
      name: obs.object_name,
      details: obs.object_details,
    },
    timestamp: obs.timestamp,
    location: {
      lat: obs.lat,
      lon: obs.lon,
      placeName: obs.place_name,
    },
    equipment: obs.equipment,
    notes: obs.notes,
  }))
}

export async function fetchNearbyObservations(
  lat: number,
  lon: number,
  radiusKm = 50,
  days = 30
): Promise<NearbyStats[]> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    radius_km: radiusKm.toString(),
    days: days.toString(),
  })

  const response = await fetch(`${API_BASE_URL}/api/observations/nearby?${params}`)

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`)
  }

  return response.json()
}

export async function deleteObservation(observationId: string, deviceId: string): Promise<void> {
  const params = new URLSearchParams({ device_id: deviceId })
  const response = await fetch(
    `${API_BASE_URL}/api/observations/${observationId}?${params}`,
    { method: 'DELETE' }
  )

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`)
  }
}
