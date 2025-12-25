import { useState, useEffect } from 'react'

interface UseGeolocationResult {
  lat: number | null
  lon: number | null
  error: string | null
  loading: boolean
}

const GEOLOCATION_TIMEOUT_MS = 10000

export function useGeolocation(): UseGeolocationResult {
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    // Fallback timeout in case browser geolocation hangs
    const timeoutId = setTimeout(() => {
      setError('Location request timed out. Try using manual coordinates with ?lat=X&lon=Y')
      setLoading(false)
    }, GEOLOCATION_TIMEOUT_MS)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        setLat(position.coords.latitude)
        setLon(position.coords.longitude)
        setLoading(false)
      },
      (err) => {
        clearTimeout(timeoutId)
        setError(err.message)
        setLoading(false)
      },
      {
        timeout: GEOLOCATION_TIMEOUT_MS,
        enableHighAccuracy: false,
        maximumAge: 300000, // Cache position for 5 minutes
      }
    )

    return () => clearTimeout(timeoutId)
  }, [])

  return { lat, lon, error, loading }
}
