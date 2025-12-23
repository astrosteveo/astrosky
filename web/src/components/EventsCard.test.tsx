import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventsCard } from './EventsCard'
import { AstroEvent } from '../types'

const mockEvents: AstroEvent[] = [
  {
    type: 'lunar eclipse',
    date: '2025-12-31T23:00:00Z',
    title: 'Total Lunar Eclipse',
    description: 'Moon passes through Earth shadow',
    bodies: ['Earth', 'Moon'],
  },
  {
    type: 'planetary conjunction',
    date: '2025-12-28T10:00:00Z',
    title: 'Venus-Jupiter Conjunction',
    description: 'Venus and Jupiter appear close together',
    bodies: ['Venus', 'Jupiter'],
  },
]

describe('EventsCard', () => {
  it('displays astronomical events', () => {
    render(<EventsCard events={mockEvents} />)

    expect(screen.getByText('Total Lunar Eclipse')).toBeInTheDocument()
    expect(screen.getByText('Venus-Jupiter Conjunction')).toBeInTheDocument()
    expect(screen.getByText('Moon passes through Earth shadow')).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    render(<EventsCard events={[]} />)

    expect(screen.getByText('No upcoming events')).toBeInTheDocument()
  })

  it('displays event types', () => {
    render(<EventsCard events={mockEvents} />)

    const types = screen.getAllByText(/eclipse|conjunction/i)
    expect(types.length).toBeGreaterThanOrEqual(2)
  })

  it('displays involved bodies', () => {
    render(<EventsCard events={mockEvents} />)

    expect(screen.getByText('Earth, Moon')).toBeInTheDocument()
    expect(screen.getByText('Venus, Jupiter')).toBeInTheDocument()
  })
})
