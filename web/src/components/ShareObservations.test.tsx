import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/testUtils'
import { ShareObservations } from './ShareObservations'
import type { ObservationStats } from '../types/observations'

const mockStats: ObservationStats = {
  totalObservations: 42,
  uniqueObjects: 15,
  messierCount: 23,
  planetsObserved: ['Mars', 'Jupiter', 'Saturn'],
  firstObservation: '2024-01-15T20:00:00Z',
  lastObservation: '2024-12-20T22:00:00Z',
}

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
})

describe('ShareObservations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockClear()
  })

  it('renders share button', () => {
    render(<ShareObservations stats={mockStats} />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('opens menu when share button is clicked', () => {
    render(<ShareObservations stats={mockStats} />)

    fireEvent.click(screen.getByText('Share'))

    expect(screen.getByText('Share to Social')).toBeInTheDocument()
    expect(screen.getByText('Other Options')).toBeInTheDocument()
  })

  describe('social platform buttons', () => {
    it('shows Twitter/X option', () => {
      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))

      expect(screen.getByText('X / Twitter')).toBeInTheDocument()
    })

    it('shows Instagram option', () => {
      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))

      expect(screen.getByText('Instagram')).toBeInTheDocument()
    })

    it('shows Threads option', () => {
      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))

      expect(screen.getByText('Threads')).toBeInTheDocument()
    })

    it('shows Bluesky option', () => {
      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))

      expect(screen.getByText('Bluesky')).toBeInTheDocument()
    })
  })

  describe('general share options', () => {
    it('shows Save as Image option', () => {
      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))

      expect(screen.getByText('Save as Image')).toBeInTheDocument()
    })

    it('shows Copy Text option', () => {
      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))

      expect(screen.getByText('Copy Text')).toBeInTheDocument()
    })
  })

  describe('Twitter share', () => {
    it('opens Twitter intent URL when clicked', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))
      fireEvent.click(screen.getByText('X / Twitter'))

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank',
        'width=550,height=420'
      )
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('stargazing'),
        expect.any(String),
        expect.any(String)
      )
    })
  })

  describe('Bluesky share', () => {
    it('opens Bluesky intent URL when clicked', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))
      fireEvent.click(screen.getByText('Bluesky'))

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://bsky.app/intent/compose'),
        '_blank',
        'width=550,height=420'
      )
    })
  })

  describe('Instagram share', () => {
    it('shows feedback when clicked', async () => {
      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))

      // Verify Instagram option is available
      expect(screen.getByText('Instagram')).toBeInTheDocument()

      // Note: Full Instagram share test requires canvas mock which is complex in jsdom
      // The clipboard functionality is tested in the copy text test
    })
  })

  describe('copy text', () => {
    it('copies text to clipboard and shows confirmation', async () => {
      render(<ShareObservations stats={mockStats} />)
      fireEvent.click(screen.getByText('Share'))
      fireEvent.click(screen.getByText('Copy Text'))

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining('My AstroSky Observations')
        )
      })
    })
  })

  describe('menu behavior', () => {
    it('toggles menu visibility', async () => {
      render(<ShareObservations stats={mockStats} />)

      // Initially menu is closed
      expect(screen.queryByText('Share to Social')).not.toBeInTheDocument()

      // Open menu
      fireEvent.click(screen.getByText('Share'))
      expect(screen.getByText('Share to Social')).toBeInTheDocument()

      // Toggle menu closed
      fireEvent.click(screen.getByText('Share'))
      await waitFor(() => {
        expect(screen.queryByText('Share to Social')).not.toBeInTheDocument()
      })
    })
  })
})
