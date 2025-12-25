import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import App from './App'

vi.mock('./hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    lat: 40.7128,
    lon: -74.006,
    error: null,
    loading: false,
  }),
}))

vi.mock('./hooks/useReport', () => ({
  useReport: () => ({
    data: {
      sun: {
        sunrise: '2024-01-15T07:00:00Z',
        sunset: '2024-01-15T17:00:00Z',
        astronomical_twilight_start: '2024-01-15T18:30:00Z',
        astronomical_twilight_end: '2024-01-15T05:30:00Z',
      },
      moon: {
        phase_name: 'Full Moon',
        illumination: 100,
        darkness_quality: 'Poor',
        moonrise: null,
        moonset: null,
      },
      weather: {
        cloud_cover: 15,
        humidity: 50,
        visibility: 20,
        wind_speed: 8,
        temperature: 12,
        condition: 'Good',
        summary: 'Mostly clear. Good night for astronomy.',
      },
      planets: [],
      iss_passes: [],
      meteors: [],
      deep_sky: [],
      events: [],
    },
    loading: false,
    error: null,
  }),
}))

describe('App', () => {
  it('renders tonight tab with sky status', async () => {
    render(<App />)

    await waitFor(() => {
      // Tonight tab is default - look for sky status content
      expect(screen.getByText('Tonight')).toBeInTheDocument()
      expect(screen.getByText('Live')).toBeInTheDocument()
    })
  })

  it('displays location coordinates', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/40.71.*-74.01/)).toBeInTheDocument()
    })
  })

  it('renders moon card when sky tab is clicked', async () => {
    render(<App />)

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Sky')).toBeInTheDocument()
    })

    // Click on Sky tab
    fireEvent.click(screen.getByText('Sky'))

    // Now moon card should be visible
    await waitFor(() => {
      expect(screen.getByText('Full Moon')).toBeInTheDocument()
    })
  })
})
