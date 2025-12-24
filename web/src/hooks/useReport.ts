import { useState, useEffect, useCallback, useRef } from 'react'
import type { SkyReport } from '../types'
import { fetchReport } from '../lib/api'

interface UseReportResult {
  data: SkyReport | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function useReport(
  lat: number | null,
  lon: number | null,
  date?: string
): UseReportResult {
  const [data, setData] = useState<SkyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const refreshIntervalRef = useRef<number | null>(null)

  const fetchData = useCallback(async () => {
    if (lat === null || lon === null) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const report = await fetchReport(lat, lon, date)
      setData(report)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }, [lat, lon, date])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (lat === null || lon === null) {
      return
    }

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(() => {
      fetchData()
    }, REFRESH_INTERVAL_MS)

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [lat, lon, fetchData])

  return { data, loading, error, lastUpdated, refresh: fetchData }
}
