import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MeteorsCard } from './MeteorsCard'
import type { ShowerInfo } from '../types'

const mockShowers: ShowerInfo[] = [
  {
    name: 'Geminids',
    zhr: 120,
    peak_date: '2025-12-13',
    radiant_constellation: 'Gemini',
    is_peak: true,
  },
  {
    name: 'Perseids',
    zhr: 80,
    peak_date: '2025-08-12',
    radiant_constellation: 'Perseus',
    is_peak: false,
  },
]

describe('MeteorsCard', () => {
  it('displays meteor showers', () => {
    render(<MeteorsCard meteors={mockShowers} />)

    expect(screen.getByText('Geminids')).toBeInTheDocument()
    expect(screen.getByText('Perseids')).toBeInTheDocument()
    // New design displays ZHR values separately
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
  })

  it('shows empty state when no showers', () => {
    render(<MeteorsCard meteors={[]} />)

    expect(screen.getByText('No active meteor showers')).toBeInTheDocument()
  })

  it('highlights peak showers', () => {
    render(<MeteorsCard meteors={mockShowers} />)

    expect(screen.getByText('Peak Tonight')).toBeInTheDocument()
  })

  it('displays radiant constellations', () => {
    render(<MeteorsCard meteors={mockShowers} />)

    expect(screen.getByText('Gemini')).toBeInTheDocument()
    expect(screen.getByText('Perseus')).toBeInTheDocument()
  })
})
