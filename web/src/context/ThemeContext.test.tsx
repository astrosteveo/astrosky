import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'

// Test component that exposes theme context
function TestComponent() {
  const { theme, setTheme, cycleTheme } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="cycle" onClick={cycleTheme}>Cycle</button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
      <button data-testid="set-night" onClick={() => setTheme('night')}>Night</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('light-theme', 'night-theme')
  })

  describe('default behavior', () => {
    it('provides dark theme by default', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('throws error when useTheme is used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => render(<TestComponent />)).toThrow(
        'useTheme must be used within a ThemeProvider'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('localStorage persistence', () => {
    it('restores dark theme from localStorage', () => {
      localStorage.setItem('astrosky-theme', 'dark')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('restores light theme from localStorage', () => {
      localStorage.setItem('astrosky-theme', 'light')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })

    it('restores night theme from localStorage', () => {
      localStorage.setItem('astrosky-theme', 'night')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('night')
    })

    it('defaults to dark for invalid localStorage value', () => {
      localStorage.setItem('astrosky-theme', 'invalid-theme')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('saves theme changes to localStorage', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      fireEvent.click(screen.getByTestId('set-light'))

      expect(localStorage.getItem('astrosky-theme')).toBe('light')
    })
  })

  describe('cycleTheme', () => {
    it('cycles dark -> light -> night -> dark', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Start at dark
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')

      // Cycle to light
      fireEvent.click(screen.getByTestId('cycle'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')

      // Cycle to night
      fireEvent.click(screen.getByTestId('cycle'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('night')

      // Cycle back to dark
      fireEvent.click(screen.getByTestId('cycle'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('cycles correctly from light starting point', () => {
      localStorage.setItem('astrosky-theme', 'light')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')

      fireEvent.click(screen.getByTestId('cycle'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('night')

      fireEvent.click(screen.getByTestId('cycle'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('cycles correctly from night starting point', () => {
      localStorage.setItem('astrosky-theme', 'night')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('night')

      fireEvent.click(screen.getByTestId('cycle'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })
  })

  describe('setTheme', () => {
    it('sets theme directly to light', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      fireEvent.click(screen.getByTestId('set-light'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })

    it('sets theme directly to night', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      fireEvent.click(screen.getByTestId('set-night'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('night')
    })

    it('sets theme directly to dark', () => {
      localStorage.setItem('astrosky-theme', 'light')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      fireEvent.click(screen.getByTestId('set-dark'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })
  })

  describe('CSS class management', () => {
    it('applies light-theme class for light theme', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      fireEvent.click(screen.getByTestId('set-light'))

      expect(document.documentElement.classList.contains('light-theme')).toBe(true)
      expect(document.documentElement.classList.contains('night-theme')).toBe(false)
    })

    it('applies night-theme class for night theme', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      fireEvent.click(screen.getByTestId('set-night'))

      expect(document.documentElement.classList.contains('night-theme')).toBe(true)
      expect(document.documentElement.classList.contains('light-theme')).toBe(false)
    })

    it('removes theme classes for dark theme', () => {
      localStorage.setItem('astrosky-theme', 'light')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Start with light theme class
      expect(document.documentElement.classList.contains('light-theme')).toBe(true)

      // Switch to dark
      fireEvent.click(screen.getByTestId('set-dark'))

      expect(document.documentElement.classList.contains('light-theme')).toBe(false)
      expect(document.documentElement.classList.contains('night-theme')).toBe(false)
    })

    it('cleans up previous theme classes when switching', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Switch to light
      fireEvent.click(screen.getByTestId('set-light'))
      expect(document.documentElement.classList.contains('light-theme')).toBe(true)

      // Switch to night - should remove light-theme
      fireEvent.click(screen.getByTestId('set-night'))
      expect(document.documentElement.classList.contains('light-theme')).toBe(false)
      expect(document.documentElement.classList.contains('night-theme')).toBe(true)

      // Switch to dark - should remove night-theme
      fireEvent.click(screen.getByTestId('set-dark'))
      expect(document.documentElement.classList.contains('light-theme')).toBe(false)
      expect(document.documentElement.classList.contains('night-theme')).toBe(false)
    })
  })
})
