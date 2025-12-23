import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useGeolocation } from './useGeolocation'

describe('useGeolocation', () => {
  const mockPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns location on success', async () => {
    const mockGetCurrentPosition = vi.fn((success) => {
      success(mockPosition)
    })

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.lat).toBe(40.7128)
      expect(result.current.lon).toBe(-74.006)
    })

    expect(result.current.error).toBeNull()
  })

  it('returns error on failure', async () => {
    const mockGetCurrentPosition = vi.fn((_, error) => {
      error({ message: 'User denied geolocation' })
    })

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.error).toBe('User denied geolocation')
    })

    expect(result.current.lat).toBeNull()
    expect(result.current.lon).toBeNull()
  })
})
