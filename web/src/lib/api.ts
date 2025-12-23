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
