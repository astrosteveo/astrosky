import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useReport } from './useReport'

const mockReport = {
  date: '2025-12-23T00:00:00Z',
  location: { lat: 40.7128, lon: -74.006 },
  sun: {
    sunrise: '2025-12-23T12:00:00Z',
    sunset: '2025-12-23T21:30:00Z',
    astronomical_twilight_start: '2025-12-23T23:00:00Z',
    astronomical_twilight_end: '2025-12-24T10:00:00Z',
  },
  moon: {
    phase_name: 'Waxing Crescent',
    illumination: 15.5,
    darkness_quality: 'Excellent',
    moonrise: '2025-12-23T14:00:00Z',
    moonset: '2025-12-24T02:00:00Z',
  },
  planets: [],
  iss_passes: [],
  meteors: [],
  deep_sky: [],
  events: [],
}

describe('useReport', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches report for given coordinates', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReport),
    })

    const { result } = renderHook(() => useReport(40.7128, -74.006))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockReport)
    expect(result.current.error).toBeNull()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('lat=40.7128&lon=-74.006')
    )
  })

  it('handles fetch errors', async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useReport(40.7128, -74.006))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network error')
  })

  it('does not fetch when coordinates are null', () => {
    globalThis.fetch = vi.fn()

    const { result } = renderHook(() => useReport(null, null))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })
})
