import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CurrentSkyStatus } from './CurrentSkyStatus'
import type { SunTimes } from '../types'

describe('CurrentSkyStatus', () => {
  const mockSunTimes: SunTimes = {
    sunrise: '2024-01-01T07:00:00Z',
    sunset: '2024-01-01T17:00:00Z',
    astronomical_twilight_start: '2024-01-01T18:00:00Z',
    astronomical_twilight_end: '2024-01-01T06:00:00Z'
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show "Dark Sky" during night', () => {
    // Set time to 3 AM (night time)
    vi.setSystemTime(new Date('2024-01-01T03:00:00Z'))

    render(<CurrentSkyStatus sun={mockSunTimes} />)

    expect(screen.getByText('Perfect for Observing')).toBeInTheDocument()
    expect(screen.getByText(/Dark sky for/)).toBeInTheDocument()
  })

  it('should show "Morning Twilight" during morning twilight', () => {
    // Set time to 6:30 AM (between twilight end and sunrise)
    vi.setSystemTime(new Date('2024-01-01T06:30:00Z'))

    render(<CurrentSkyStatus sun={mockSunTimes} />)

    expect(screen.getByText('Morning Twilight')).toBeInTheDocument()
    expect(screen.getByText(/Sunrise in/)).toBeInTheDocument()
  })

  it('should show "Daylight" during day', () => {
    // Set time to noon
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))

    render(<CurrentSkyStatus sun={mockSunTimes} />)

    expect(screen.getByText('Daytime')).toBeInTheDocument()
    expect(screen.getByText(/Sunset in/)).toBeInTheDocument()
  })

  it('should show "Evening Twilight" during evening twilight', () => {
    // Set time to 5:30 PM (between sunset and twilight start)
    vi.setSystemTime(new Date('2024-01-01T17:30:00Z'))

    render(<CurrentSkyStatus sun={mockSunTimes} />)

    expect(screen.getByText('Evening Twilight')).toBeInTheDocument()
    expect(screen.getByText(/Dark sky in/)).toBeInTheDocument()
  })

  it('should display LIVE indicator', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))

    render(<CurrentSkyStatus sun={mockSunTimes} />)

    expect(screen.getByText('Live')).toBeInTheDocument()
  })
})
