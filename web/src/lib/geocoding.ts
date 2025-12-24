// Reverse geocoding utility using OpenStreetMap Nominatim (free, no API key needed)

interface GeocodingResult {
  placeName: string
  city?: string
  state?: string
  country?: string
}

// Cache to avoid repeated API calls for same coordinates
const geocodeCache = new Map<string, GeocodingResult>()

function getCacheKey(lat: number, lon: number): string {
  // Round to 2 decimal places for caching (about 1km precision)
  return `${lat.toFixed(2)},${lon.toFixed(2)}`
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
  const cacheKey = getCacheKey(lat, lon)

  // Check cache first
  const cached = geocodeCache.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AstroSky/1.0 (astronomy observation app)',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()
    const address = data.address || {}

    const city = address.city || address.town || address.village || address.municipality
    const state = address.state || address.province || address.region
    const country = address.country

    // Build a friendly place name
    let placeName = ''
    if (city && state) {
      placeName = `${city}, ${state}`
    } else if (city) {
      placeName = city
    } else if (state) {
      placeName = state
    } else if (country) {
      placeName = country
    } else {
      placeName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
    }

    const result: GeocodingResult = {
      placeName,
      city,
      state,
      country,
    }

    // Cache the result
    geocodeCache.set(cacheKey, result)

    return result
  } catch (error) {
    // Fallback to coordinates if geocoding fails
    const fallback: GeocodingResult = {
      placeName: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    }
    return fallback
  }
}

// Hook for reactive geocoding
import { useState, useEffect } from 'react'

export function useReverseGeocode(lat: number | null, lon: number | null) {
  const [placeName, setPlaceName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lat === null || lon === null) {
      setPlaceName(null)
      return
    }

    setLoading(true)
    reverseGeocode(lat, lon)
      .then(result => {
        setPlaceName(result.placeName)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [lat, lon])

  return { placeName, loading }
}
