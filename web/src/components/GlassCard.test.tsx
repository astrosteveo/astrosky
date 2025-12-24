import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from './GlassCard'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Card content</GlassCard>)

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(<GlassCard title="Moon Phase">Content</GlassCard>)

    expect(screen.getByText('Moon Phase')).toBeInTheDocument()
  })

  it('applies glass styling', () => {
    render(<GlassCard>Content</GlassCard>)

    const card = screen.getByTestId('glass-card')
    expect(card).toHaveClass('observatory-card')
  })
})
