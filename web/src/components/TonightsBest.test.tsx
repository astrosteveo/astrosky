import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../test/testUtils'
import { TonightsBest } from './TonightsBest'
import type { SkyReport } from '../types'

// Mock useCurrentTime to return a fixed time
vi.mock('../hooks/useCurrentTime', () => ({
  useCurrentTime: () => new Date('2025-01-15T21:00:00Z'),
}))

const baseSkyReport: SkyReport = {
  date: '2025-01-15',
  location: { lat: 40.7128, lon: -74.006 },
  sun: {
    sunrise: '2025-01-15T12:00:00Z',
    sunset: '2025-01-15T22:00:00Z',
    astronomical_twilight_start: '2025-01-15T10:30:00Z',
    astronomical_twilight_end: '2025-01-15T23:30:00Z',
  },
  moon: {
    phase_name: 'Waning Gibbous',
    illumination: 65,
    darkness_quality: 'Fair',
    moonrise: '2025-01-15T20:00:00Z',
    moonset: '2025-01-16T08:00:00Z',
  },
  weather: null,
  aurora: null,
  satellites: null,
  planets: [],
  iss_passes: [],
  meteors: [],
  deep_sky: [],
  events: [],
}

describe('TonightsBest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders nothing when no objects are visible', () => {
    const { container } = render(<TonightsBest data={baseSkyReport} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays the card title', () => {
    const report: SkyReport = {
      ...baseSkyReport,
      planets: [
        {
          name: 'Jupiter',
          direction: 'S',
          azimuth: 180,
          altitude: 45,
          rise_time: '2025-01-15T18:00:00Z',
          set_time: '2025-01-16T04:00:00Z',
          description: 'Bright in the south',
        },
      ],
    }
    render(<TonightsBest data={report} />)
    expect(screen.getByText("Tonight's Best")).toBeInTheDocument()
  })

  describe('Planet recommendations', () => {
    it('shows visible planets with position info', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        planets: [
          {
            name: 'Jupiter',
            direction: 'S',
            azimuth: 180,
            altitude: 45,
            rise_time: '2025-01-15T18:00:00Z',
            set_time: '2025-01-16T04:00:00Z',
            description: 'Bright in the south',
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('Jupiter')).toBeInTheDocument()
      expect(screen.getByText(/S.*Alt 45°/)).toBeInTheDocument()
    })

    it('shows urgency badge for planet setting soon', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        planets: [
          {
            name: 'Venus',
            direction: 'W',
            azimuth: 270,
            altitude: 15,
            rise_time: '2025-01-15T14:00:00Z',
            set_time: '2025-01-15T21:30:00Z', // Sets in 30 min from mock time
            description: 'Setting soon',
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('Venus')).toBeInTheDocument()
      expect(screen.getByText('NOW')).toBeInTheDocument()
      expect(screen.getByText(/Sets in/)).toBeInTheDocument()
    })

    it('prioritizes bright planets like Venus and Jupiter', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        planets: [
          {
            name: 'Uranus',
            direction: 'E',
            azimuth: 90,
            altitude: 50,
            rise_time: null,
            set_time: null,
            description: 'Dim planet',
          },
          {
            name: 'Jupiter',
            direction: 'S',
            azimuth: 180,
            altitude: 40,
            rise_time: null,
            set_time: null,
            description: 'Bright planet',
          },
        ],
      }
      render(<TonightsBest data={report} />)

      const jupiter = screen.getByText('Jupiter')
      const uranus = screen.getByText('Uranus')

      // Jupiter should appear before Uranus (higher score due to brightness)
      expect(jupiter.compareDocumentPosition(uranus)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })
  })

  describe('ISS pass recommendations', () => {
    it('shows upcoming ISS pass', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        iss_passes: [
          {
            start_time: '2025-01-15T22:00:00Z', // 1 hour from mock time
            duration_minutes: 5,
            max_altitude: 78,
            start_direction: 'SW',
            end_direction: 'NE',
            brightness: 'Very Bright',
            magnitude: -3.5,
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('ISS Pass')).toBeInTheDocument()
      expect(screen.getByText(/78° max.*5min/)).toBeInTheDocument()
      expect(screen.getByText('Exceptionally bright!')).toBeInTheDocument()
    })

    it('shows NOW urgency for imminent ISS pass', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        iss_passes: [
          {
            start_time: '2025-01-15T21:15:00Z', // 15 min from mock time
            duration_minutes: 4,
            max_altitude: 65,
            start_direction: 'W',
            end_direction: 'E',
            brightness: 'Bright',
            magnitude: -2.0,
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('ISS Pass')).toBeInTheDocument()
      expect(screen.getByText('NOW')).toBeInTheDocument()
    })

    it('shows SOON urgency for ISS pass within an hour', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        iss_passes: [
          {
            start_time: '2025-01-15T21:45:00Z', // 45 min from mock time
            duration_minutes: 4,
            max_altitude: 55,
            start_direction: 'S',
            end_direction: 'N',
            brightness: 'Moderate',
            magnitude: -1.0,
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('ISS Pass')).toBeInTheDocument()
      expect(screen.getByText('SOON')).toBeInTheDocument()
    })
  })

  describe('Meteor shower recommendations', () => {
    it('shows active meteor shower at peak', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        meteors: [
          {
            name: 'Quadrantids',
            zhr: 120,
            peak_date: '2025-01-15',
            radiant_constellation: 'Boötes',
            is_peak: true,
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('Quadrantids')).toBeInTheDocument()
      expect(screen.getByText('~120 meteors/hour')).toBeInTheDocument()
      expect(screen.getByText('Peak activity tonight!')).toBeInTheDocument()
    })

    it('does not show meteor shower when not at peak', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        meteors: [
          {
            name: 'Perseids',
            zhr: 100,
            peak_date: '2025-08-12',
            radiant_constellation: 'Perseus',
            is_peak: false,
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.queryByText('Perseids')).not.toBeInTheDocument()
    })
  })

  describe('Deep sky object recommendations', () => {
    it('shows bright deep sky objects', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        deep_sky: [
          {
            id: 'M42',
            name: 'Orion Nebula',
            constellation: 'Orion',
            mag: 4.0,
            size: 65,
            type: 'nebula',
            equipment: 'naked eye',
            tip: 'Look below Orion belt',
            altitude: 55,
            azimuth: 180,
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('M42 - Orion Nebula')).toBeInTheDocument()
      expect(screen.getByText(/nebula.*naked eye/)).toBeInTheDocument()
    })

    it('shows multiple DSOs up to limit', () => {
      const dsos = [
        { id: 'M31', name: 'Andromeda Galaxy', constellation: 'Andromeda', mag: 3.4, size: 178, type: 'galaxy', equipment: 'binoculars', tip: '', altitude: 70, azimuth: 45 },
        { id: 'M42', name: 'Orion Nebula', constellation: 'Orion', mag: 4.0, size: 65, type: 'nebula', equipment: 'naked eye', tip: '', altitude: 55, azimuth: 180 },
        { id: 'M45', name: 'Pleiades', constellation: 'Taurus', mag: 1.6, size: 110, type: 'cluster', equipment: 'naked eye', tip: '', altitude: 60, azimuth: 90 },
      ]
      const report: SkyReport = { ...baseSkyReport, deep_sky: dsos }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('M31 - Andromeda Galaxy')).toBeInTheDocument()
      expect(screen.getByText('M42 - Orion Nebula')).toBeInTheDocument()
      expect(screen.getByText('M45 - Pleiades')).toBeInTheDocument()
    })
  })

  describe('Moon recommendations', () => {
    it('shows dark sky recommendation for new moon', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        moon: {
          phase_name: 'New Moon',
          illumination: 2,
          darkness_quality: 'Excellent',
          moonrise: null,
          moonset: null,
        },
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('Dark Sky Window')).toBeInTheDocument()
      expect(screen.getByText(/New Moon.*2% lit/)).toBeInTheDocument()
      expect(screen.getByText('Excellent for deep sky!')).toBeInTheDocument()
    })

    it('shows lunar observation recommendation for full moon', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        moon: {
          phase_name: 'Full Moon',
          illumination: 99,
          darkness_quality: 'Poor',
          moonrise: '2025-01-15T18:00:00Z',
          moonset: '2025-01-16T07:00:00Z',
        },
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('Full Moon')).toBeInTheDocument()
      expect(screen.getByText(/99% illuminated/)).toBeInTheDocument()
      expect(screen.getByText('Great for lunar observation')).toBeInTheDocument()
    })

    it('does not show moon recommendation for moderate illumination', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        moon: {
          phase_name: 'First Quarter',
          illumination: 50,
          darkness_quality: 'Fair',
          moonrise: '2025-01-15T12:00:00Z',
          moonset: '2025-01-16T00:00:00Z',
        },
        planets: [
          {
            name: 'Mars',
            direction: 'E',
            azimuth: 90,
            altitude: 30,
            rise_time: null,
            set_time: null,
            description: 'Visible',
          },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.queryByText('Dark Sky Window')).not.toBeInTheDocument()
      expect(screen.queryByText('First Quarter')).not.toBeInTheDocument()
    })
  })

  describe('Ranking and display', () => {
    it('shows rank badges for top recommendations', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        planets: [
          { name: 'Jupiter', direction: 'S', azimuth: 180, altitude: 50, rise_time: null, set_time: null, description: '' },
          { name: 'Saturn', direction: 'SW', azimuth: 220, altitude: 35, rise_time: null, set_time: null, description: '' },
          { name: 'Mars', direction: 'E', azimuth: 90, altitude: 25, rise_time: null, set_time: null, description: '' },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('limits recommendations to 5 items', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        planets: [
          { name: 'Jupiter', direction: 'S', azimuth: 180, altitude: 50, rise_time: null, set_time: null, description: '' },
          { name: 'Saturn', direction: 'SW', azimuth: 220, altitude: 35, rise_time: null, set_time: null, description: '' },
          { name: 'Mars', direction: 'E', azimuth: 90, altitude: 25, rise_time: null, set_time: null, description: '' },
          { name: 'Venus', direction: 'W', azimuth: 270, altitude: 20, rise_time: null, set_time: null, description: '' },
          { name: 'Mercury', direction: 'W', azimuth: 280, altitude: 10, rise_time: null, set_time: null, description: '' },
          { name: 'Uranus', direction: 'E', azimuth: 100, altitude: 45, rise_time: null, set_time: null, description: '' },
          { name: 'Neptune', direction: 'SW', azimuth: 230, altitude: 30, rise_time: null, set_time: null, description: '' },
        ],
      }
      render(<TonightsBest data={report} />)

      // Should show rank badges 1-5 but not beyond
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.queryByText('6')).not.toBeInTheDocument()
      expect(screen.queryByText('7')).not.toBeInTheDocument()
    })

    it('displays description about ranking updates', () => {
      const report: SkyReport = {
        ...baseSkyReport,
        planets: [
          { name: 'Jupiter', direction: 'S', azimuth: 180, altitude: 50, rise_time: null, set_time: null, description: '' },
        ],
      }
      render(<TonightsBest data={report} />)

      expect(
        screen.getByText('Rankings update in real-time based on object positions')
      ).toBeInTheDocument()
    })
  })
})
