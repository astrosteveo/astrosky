import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCurrentTime } from './useCurrentTime'

describe('useCurrentTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return current time', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)

    const { result } = renderHook(() => useCurrentTime())

    expect(result.current.getTime()).toBe(now.getTime())
  })

  it('should update time every second', () => {
    const startTime = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(startTime)

    const { result } = renderHook(() => useCurrentTime())

    expect(result.current.getTime()).toBe(startTime.getTime())

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.getTime()).toBe(startTime.getTime() + 1000)

    // Advance another 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.getTime()).toBe(startTime.getTime() + 6000)
  })

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    const { unmount } = renderHook(() => useCurrentTime())

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
