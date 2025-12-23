import { useState, useEffect } from 'react'
import type { SkyReport } from '../types'
import { fetchReport } from '../lib/api'

interface UseReportResult {
  data: SkyReport | null
  loading: boolean
  error: string | null
}

export function useReport(
  lat: number | null,
  lon: number | null,
  date?: string
): UseReportResult {
  const [data, setData] = useState<SkyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lat === null || lon === null) {
      return
    }

    setLoading(true)
    setError(null)

    fetchReport(lat, lon, date)
      .then((report) => {
        setData(report)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [lat, lon, date])

  return { data, loading, error }
}
