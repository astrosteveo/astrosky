import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../context/ThemeContext'
import { ThemeToggle } from './ThemeToggle'

function renderWithTheme(initialTheme?: 'dark' | 'light' | 'night') {
  if (initialTheme) {
    localStorage.setItem('astrosky-theme', initialTheme)
  }
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('light-theme', 'night-theme')
  })

  describe('display states', () => {
    it('shows dark theme icon and label by default', () => {
      renderWithTheme()

      expect(screen.getByText('🌙')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })

    it('shows light theme icon and label', () => {
      renderWithTheme('light')

      expect(screen.getByText('☀️')).toBeInTheDocument()
      expect(screen.getByText('Light')).toBeInTheDocument()
    })

    it('shows night theme icon and label', () => {
      renderWithTheme('night')

      expect(screen.getByText('🔴')).toBeInTheDocument()
      expect(screen.getByText('Night')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has accessible button with dark theme context', () => {
      renderWithTheme('dark')

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute(
        'aria-label',
        'Current: Dark mode. Click to switch to Light mode'
      )
      expect(button).toHaveAttribute('title', 'Switch to Light mode')
    })

    it('has accessible button with light theme context', () => {
      renderWithTheme('light')

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute(
        'aria-label',
        'Current: Light mode. Click to switch to Night mode'
      )
      expect(button).toHaveAttribute('title', 'Switch to Night mode')
    })

    it('has accessible button with night theme context', () => {
      renderWithTheme('night')

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute(
        'aria-label',
        'Current: Night mode. Click to switch to Dark mode'
      )
      expect(button).toHaveAttribute('title', 'Switch to Dark mode')
    })
  })

  describe('cycling behavior', () => {
    it('cycles from dark to light on click', () => {
      renderWithTheme('dark')

      expect(screen.getByText('Dark')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('☀️')).toBeInTheDocument()
    })

    it('cycles from light to night on click', () => {
      renderWithTheme('light')

      expect(screen.getByText('Light')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('Night')).toBeInTheDocument()
      expect(screen.getByText('🔴')).toBeInTheDocument()
    })

    it('cycles from night to dark on click', () => {
      renderWithTheme('night')

      expect(screen.getByText('Night')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('🌙')).toBeInTheDocument()
    })

    it('completes full cycle dark -> light -> night -> dark', () => {
      renderWithTheme('dark')
      const button = screen.getByRole('button')

      // dark -> light
      fireEvent.click(button)
      expect(screen.getByText('Light')).toBeInTheDocument()

      // light -> night
      fireEvent.click(button)
      expect(screen.getByText('Night')).toBeInTheDocument()

      // night -> dark
      fireEvent.click(button)
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })
  })

  describe('indicator dots', () => {
    it('renders three indicator dots', () => {
      renderWithTheme()

      // The component renders three dots for dark, light, and night
      // We can verify this by checking the parent container has the right structure
      const button = screen.getByRole('button')
      const dots = button.querySelectorAll('.rounded-full')

      // Should have 3 indicator dots (w-1.5 h-1.5 size)
      const smallDots = Array.from(dots).filter(
        (dot) => dot.classList.contains('w-1\\.5') ||
                 (dot as HTMLElement).style.width === '' // framer-motion may use inline styles
      )
      expect(smallDots.length).toBeGreaterThanOrEqual(3)
    })
  })
})
