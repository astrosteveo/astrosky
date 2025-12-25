import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextEvent } from './NextEvent'
import type { SkyReport } from '../types'

describe('NextEvent', () => {
  const mockData: SkyReport = {
    date: '2024-01-01',
    location: { lat: 40.7128, lon: -74.0060 },
    sun: {
      sunrise: '2024-01-01T07:00:00Z',
      sunset: '2024-01-01T17:00:00Z',
      astronomical_twilight_start: '2024-01-01T18:00:00Z',
      astronomical_twilight_end: '2024-01-01T06:00:00Z'
    },
    moon: {
      phase_name: 'Full Moon',
      illumination: 100,
      darkness_quality: 'Poor',
      moonrise: '2024-01-01T18:00:00Z',
      moonset: '2024-01-01T08:00:00Z'
    },
    weather: {
      cloud_cover: 10,
      humidity: 45,
      visibility: 20,
      wind_speed: 5,
      temperature: 15,
      condition: 'Excellent',
      summary: 'Clear skies. Perfect for deep sky observing!'
    },
    planets: [],
    iss_passes: [
      {
        start_time: '2024-01-01T20:00:00Z',
        duration_minutes: 5,
        max_altitude: 68,
        start_direction: 'NW',
        end_direction: 'SE',
        brightness: 'bright'
      }
    ],
    meteors: [
      {
        name: 'Perseids',
        zhr: 100,
        peak_date: '2024-01-01T22:00:00Z',
        radiant_constellation: 'Perseus',
        is_peak: true
      }
    ],
    deep_sky: [],
    events: [
      {
        type: 'conjunction',
        date: '2024-01-01T23:00:00Z',
        title: 'Moon-Jupiter Conjunction',
        description: 'Moon and Jupiter appear close together',
        bodies: ['Moon', 'Jupiter']
      }
    ]
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should display the next upcoming event', () => {
    // Set time to 5 AM
    vi.setSystemTime(new Date('2024-01-01T05:00:00Z'))

    render(<NextEvent data={mockData} />)

    // Sunrise should be the next event
    expect(screen.getByText('Sunrise')).toBeInTheDocument()
    expect(screen.getByText('Day begins')).toBeInTheDocument()
  })

  it('should show ISS pass when it is next', () => {
    // Set time to 7:30 PM (after sunset, before ISS)
    vi.setSystemTime(new Date('2024-01-01T19:30:00Z'))

    render(<NextEvent data={mockData} />)

    expect(screen.getByText('ISS Pass')).toBeInTheDocument()
    expect(screen.getByText(/Max altitude 68°/)).toBeInTheDocument()
  })

  it('should show countdown timer', () => {
    vi.setSystemTime(new Date('2024-01-01T05:00:00Z'))

    render(<NextEvent data={mockData} />)

    expect(screen.getByText('Starts in')).toBeInTheDocument()
    // Should have countdown time unit labels (h, m, s)
    expect(screen.getByText('h')).toBeInTheDocument()
    expect(screen.getByText('m')).toBeInTheDocument()
    expect(screen.getByText('s')).toBeInTheDocument()
  })

  it('should display LIVE indicator', () => {
    vi.setSystemTime(new Date('2024-01-01T05:00:00Z'))

    render(<NextEvent data={mockData} />)

    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('should display event time', () => {
    vi.setSystemTime(new Date('2024-01-01T05:00:00Z'))

    render(<NextEvent data={mockData} />)

    // Should show formatted date/time
    expect(screen.getByText(/Jan/)).toBeInTheDocument()
  })

  it('should not render when no upcoming events', () => {
    // Set time after all events
    vi.setSystemTime(new Date('2024-01-02T00:00:00Z'))

    const { container } = render(<NextEvent data={mockData} />)

    expect(container.firstChild).toBeNull()
  })

  it('should prioritize events by time', () => {
    // Set time to 6:30 AM (after twilight end, before sunrise)
    vi.setSystemTime(new Date('2024-01-01T06:30:00Z'))

    render(<NextEvent data={mockData} />)

    // Sunrise at 7 AM should be next, not dark sky at 6 PM
    expect(screen.getByText('Sunrise')).toBeInTheDocument()
  })
})
