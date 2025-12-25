import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../test/testUtils'
import { SkyChart } from './SkyChart'
import type { PlanetInfo, DSOInfo } from '../types'

const mockPlanets: PlanetInfo[] = [
  {
    name: 'Jupiter',
    direction: 'S',
    azimuth: 180,
    altitude: 45,
    rise_time: null,
    set_time: null,
    description: 'Bright in the south',
  },
  {
    name: 'Saturn',
    direction: 'SW',
    azimuth: 220,
    altitude: 30,
    rise_time: null,
    set_time: null,
    description: 'Rings visible',
  },
]

const mockDeepSky: DSOInfo[] = [
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
    azimuth: 45,
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
    altitude: 50,
    azimuth: 180,
  },
]

describe('SkyChart', () => {
  it('renders the chart title', () => {
    render(<SkyChart planets={[]} deepSky={[]} />)
    expect(screen.getByText('Sky Chart')).toBeInTheDocument()
  })

  it('shows 0 visible when no objects', () => {
    render(<SkyChart planets={[]} deepSky={[]} />)
    expect(screen.getByText('0 visible')).toBeInTheDocument()
  })

  it('shows correct count with visible objects', () => {
    render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)
    expect(screen.getByText('4 visible')).toBeInTheDocument()
  })

  it('displays filter toggle buttons', () => {
    render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)
    expect(screen.getByText('🪐 Planets')).toBeInTheDocument()
    expect(screen.getByText('🌌 Deep Sky')).toBeInTheDocument()
  })

  it('displays cardinal direction labels', () => {
    render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('W')).toBeInTheDocument()
  })

  it('displays zenith marker', () => {
    render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)
    expect(screen.getByText('Z')).toBeInTheDocument()
  })

  it('displays horizon label', () => {
    render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)
    expect(screen.getByText('Horizon')).toBeInTheDocument()
  })

  it('displays legend items', () => {
    render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)
    expect(screen.getByText('Planets')).toBeInTheDocument()
    expect(screen.getByText('Galaxies')).toBeInTheDocument()
    expect(screen.getByText('Nebulae')).toBeInTheDocument()
    expect(screen.getByText('Clusters')).toBeInTheDocument()
  })

  it('displays instruction text', () => {
    render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)
    expect(
      screen.getByText('Tap objects to see details • Center = zenith • Edge = horizon')
    ).toBeInTheDocument()
  })

  describe('filter toggles', () => {
    it('hides planets when toggle is clicked', () => {
      render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)

      // Initially 4 visible (2 planets + 2 DSO)
      expect(screen.getByText('4 visible')).toBeInTheDocument()

      // Click planets toggle to hide them
      fireEvent.click(screen.getByText('🪐 Planets'))

      // Now only 2 DSO visible
      expect(screen.getByText('2 visible')).toBeInTheDocument()
    })

    it('hides deep sky objects when toggle is clicked', () => {
      render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)

      // Initially 4 visible
      expect(screen.getByText('4 visible')).toBeInTheDocument()

      // Click DSO toggle to hide them
      fireEvent.click(screen.getByText('🌌 Deep Sky'))

      // Now only 2 planets visible
      expect(screen.getByText('2 visible')).toBeInTheDocument()
    })

    it('shows 0 visible when all filters are off', () => {
      render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)

      fireEvent.click(screen.getByText('🪐 Planets'))
      fireEvent.click(screen.getByText('🌌 Deep Sky'))

      expect(screen.getByText('0 visible')).toBeInTheDocument()
    })

    it('restores objects when toggle is clicked again', () => {
      render(<SkyChart planets={mockPlanets} deepSky={mockDeepSky} />)

      // Hide planets
      fireEvent.click(screen.getByText('🪐 Planets'))
      expect(screen.getByText('2 visible')).toBeInTheDocument()

      // Show planets again
      fireEvent.click(screen.getByText('🪐 Planets'))
      expect(screen.getByText('4 visible')).toBeInTheDocument()
    })
  })

  describe('object filtering', () => {
    it('does not show objects below horizon', () => {
      const belowHorizon: PlanetInfo[] = [
        {
          name: 'Mars',
          direction: 'E',
          azimuth: 90,
          altitude: -10, // Below horizon
          rise_time: null,
          set_time: null,
          description: 'Not visible',
        },
      ]

      render(<SkyChart planets={belowHorizon} deepSky={[]} />)
      expect(screen.getByText('0 visible')).toBeInTheDocument()
    })

    it('shows objects at horizon (0° altitude)', () => {
      const atHorizon: PlanetInfo[] = [
        {
          name: 'Venus',
          direction: 'W',
          azimuth: 270,
          altitude: 0,
          rise_time: null,
          set_time: null,
          description: 'At horizon',
        },
      ]

      render(<SkyChart planets={atHorizon} deepSky={[]} />)
      expect(screen.getByText('0 visible')).toBeInTheDocument() // 0° is not > 0
    })

    it('shows objects just above horizon', () => {
      const justAbove: PlanetInfo[] = [
        {
          name: 'Mercury',
          direction: 'W',
          azimuth: 270,
          altitude: 1,
          rise_time: null,
          set_time: null,
          description: 'Just visible',
        },
      ]

      render(<SkyChart planets={justAbove} deepSky={[]} />)
      expect(screen.getByText('1 visible')).toBeInTheDocument()
    })
  })
})
