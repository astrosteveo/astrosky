import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ISSCard } from './ISSCard'
import { ISSPass } from '../types'

const mockPasses: ISSPass[] = [
  {
    start_time: '2025-12-23T19:45:00Z',
    duration_minutes: 6,
    max_altitude: 45,
    start_direction: 'NW',
    end_direction: 'SE',
    brightness: 'bright',
  },
  {
    start_time: '2025-12-23T21:20:00Z',
    duration_minutes: 3,
    max_altitude: 20,
    start_direction: 'W',
    end_direction: 'S',
    brightness: 'dim',
  },
]

describe('ISSCard', () => {
  it('displays ISS passes', () => {
    render(<ISSCard passes={mockPasses} />)

    expect(screen.getByText(/6.*min/)).toBeInTheDocument()
    expect(screen.getByText(/3.*min/)).toBeInTheDocument()
    expect(screen.getByText(/45°/)).toBeInTheDocument()
    expect(screen.getByText(/20°/)).toBeInTheDocument()
  })

  it('shows empty state when no passes', () => {
    render(<ISSCard passes={[]} />)

    expect(screen.getByText('No ISS passes tonight')).toBeInTheDocument()
  })

  it('displays pass directions', () => {
    render(<ISSCard passes={mockPasses} />)

    const directions = screen.getAllByText(/→/)
    expect(directions.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/NW.*→.*SE/)).toBeInTheDocument()
  })
})
