import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MoonCard } from './MoonCard'
import { MoonInfo } from '../types'

const mockMoon: MoonInfo = {
  phase_name: 'Waxing Crescent',
  illumination: 15.5,
  darkness_quality: 'Excellent',
  moonrise: '2025-12-23T14:00:00Z',
  moonset: '2025-12-24T02:00:00Z',
}

describe('MoonCard', () => {
  it('displays phase name', () => {
    render(<MoonCard moon={mockMoon} />)

    expect(screen.getByText('Waxing Crescent')).toBeInTheDocument()
  })

  it('displays illumination percentage', () => {
    render(<MoonCard moon={mockMoon} />)

    expect(screen.getByText(/15.5%/)).toBeInTheDocument()
  })

  it('displays darkness quality', () => {
    render(<MoonCard moon={mockMoon} />)

    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('renders moon phase SVG', () => {
    render(<MoonCard moon={mockMoon} />)

    expect(screen.getByTestId('moon-phase-svg')).toBeInTheDocument()
  })
})
