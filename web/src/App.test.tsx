import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
      moon: {
        phase_name: 'Full Moon',
        illumination: 100,
        darkness_quality: 'Poor',
        moonrise: null,
        moonset: null,
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
  it('renders moon card with data', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Full Moon')).toBeInTheDocument()
    })
  })

  it('displays location coordinates', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/40.71.*-74.01/)).toBeInTheDocument()
    })
  })
})
