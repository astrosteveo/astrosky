import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeepSkyCard } from './DeepSkyCard'
import type { DSOInfo } from '../types'

const mockObjects: DSOInfo[] = [
  {
    id: 'M31',
    name: 'Andromeda Galaxy',
    constellation: 'Andromeda',
    mag: 3.4,
    size: 178,
    type: 'galaxy',
    equipment: 'binoculars',
    tip: 'Best viewed from dark skies',
    altitude: 65,
  },
  {
    id: 'M42',
    name: 'Orion Nebula',
    constellation: 'Orion',
    mag: 4.0,
    size: 65,
    type: 'nebula',
    equipment: 'naked eye',
    tip: 'Look below Orion belt',
    altitude: 45,
  },
]

describe('DeepSkyCard', () => {
  it('displays deep sky objects', () => {
    render(<DeepSkyCard objects={mockObjects} />)

    expect(screen.getByText(/M31.*Andromeda Galaxy/)).toBeInTheDocument()
    expect(screen.getByText(/M42.*Orion Nebula/)).toBeInTheDocument()
  })

  it('shows empty state when no objects', () => {
    render(<DeepSkyCard objects={[]} />)

    expect(screen.getByText('No deep sky objects visible')).toBeInTheDocument()
  })

  it('displays equipment information', () => {
    render(<DeepSkyCard objects={mockObjects} />)

    expect(screen.getByText(/binoculars/i)).toBeInTheDocument()
    expect(screen.getByText(/naked eye/i)).toBeInTheDocument()
  })

  it('displays observing tips', () => {
    render(<DeepSkyCard objects={mockObjects} />)

    expect(screen.getByText('Best viewed from dark skies')).toBeInTheDocument()
    expect(screen.getByText('Look below Orion belt')).toBeInTheDocument()
  })
})
