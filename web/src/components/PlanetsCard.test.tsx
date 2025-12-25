import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/testUtils'
import { PlanetsCard } from './PlanetsCard'
import type { PlanetInfo } from '../types'

const mockPlanets: PlanetInfo[] = [
  {
    name: 'Jupiter',
    direction: 'SE',
    azimuth: 135,
    altitude: 45,
    rise_time: '2025-12-23T18:00:00Z',
    set_time: '2025-12-24T04:00:00Z',
    description: 'Bright, steady light',
  },
  {
    name: 'Saturn',
    direction: 'SW',
    azimuth: 225,
    altitude: 30,
    rise_time: '2025-12-23T16:00:00Z',
    set_time: '2025-12-24T02:00:00Z',
    description: 'Golden, rings in telescope',
  },
]

describe('PlanetsCard', () => {
  it('displays planet names', () => {
    render(<PlanetsCard planets={mockPlanets} />)

    expect(screen.getByText('Jupiter')).toBeInTheDocument()
    expect(screen.getByText('Saturn')).toBeInTheDocument()
  })

  it('displays direction, azimuth, and altitude', () => {
    render(<PlanetsCard planets={mockPlanets} />)

    // New design displays direction, azimuth, and altitude separately
    expect(screen.getByText('SE')).toBeInTheDocument()
    expect(screen.getByText(/Az 135°/)).toBeInTheDocument()
    expect(screen.getByText(/Alt 45°/)).toBeInTheDocument()
  })

  it('shows empty state when no planets visible', () => {
    render(<PlanetsCard planets={[]} />)

    expect(screen.getByText(/no planets visible/i)).toBeInTheDocument()
  })
})
