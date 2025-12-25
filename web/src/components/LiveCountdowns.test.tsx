import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveCountdowns } from './LiveCountdowns'
import type { SunTimes, ISSPass, ShowerInfo } from '../types'

describe('LiveCountdowns', () => {
  const mockSunTimes: SunTimes = {
    sunrise: '2024-01-01T07:00:00Z',
    sunset: '2024-01-01T17:00:00Z',
    astronomical_twilight_start: '2024-01-01T18:00:00Z',
    astronomical_twilight_end: '2024-01-01T06:00:00Z'
  }

  const mockISSPass: ISSPass = {
    start_time: '2024-01-01T20:00:00Z',
    duration_minutes: 5,
    max_altitude: 68,
    start_direction: 'NW',
    end_direction: 'SE',
    brightness: 'bright',
    magnitude: -3.2
  }

  const mockMeteorShower: ShowerInfo = {
    name: 'Perseids',
    zhr: 100,
    peak_date: '2024-01-01T22:00:00Z',
    radiant_constellation: 'Perseus',
    is_peak: true
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render upcoming sun events', () => {
    vi.setSystemTime(new Date('2024-01-01T05:00:00Z'))

    render(<LiveCountdowns sun={mockSunTimes} />)

    expect(screen.getByText('Twilight Ends')).toBeInTheDocument()
    expect(screen.getByText('Sunrise')).toBeInTheDocument()
  })

  it('should render upcoming ISS pass', () => {
    vi.setSystemTime(new Date('2024-01-01T19:00:00Z'))

    render(<LiveCountdowns sun={mockSunTimes} issPass={mockISSPass} />)

    expect(screen.getByText('ISS Pass')).toBeInTheDocument()
    expect(screen.getByText(/Max 68°/)).toBeInTheDocument()
  })

  it('should render upcoming meteor shower', () => {
    vi.setSystemTime(new Date('2024-01-01T21:00:00Z'))

    render(<LiveCountdowns sun={mockSunTimes} meteorShower={mockMeteorShower} />)

    expect(screen.getByText(/Perseids Peak/)).toBeInTheDocument()
    expect(screen.getByText(/Up to 100\/hour/)).toBeInTheDocument()
  })

  it('should not render past events', () => {
    // Set time after all events
    vi.setSystemTime(new Date('2024-01-02T00:00:00Z'))

    const { container } = render(<LiveCountdowns sun={mockSunTimes} />)

    // Should not render the card at all when no upcoming events
    expect(container.firstChild).toBeNull()
  })

  it('should display LIVE indicator', () => {
    vi.setSystemTime(new Date('2024-01-01T05:00:00Z'))

    render(<LiveCountdowns sun={mockSunTimes} />)

    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('should show countdowns in correct format', () => {
    vi.setSystemTime(new Date('2024-01-01T05:00:00Z'))

    render(<LiveCountdowns sun={mockSunTimes} />)

    // Should have countdown time unit labels (h, m, s)
    expect(screen.getAllByText('h').length).toBeGreaterThan(0)
    expect(screen.getAllByText('m').length).toBeGreaterThan(0)
    expect(screen.getAllByText('s').length).toBeGreaterThan(0)
  })
})
