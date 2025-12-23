import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StarField } from './StarField'

describe('StarField', () => {
  it('renders star field container', () => {
    render(<StarField />)

    const container = screen.getByTestId('star-field')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('fixed', 'inset-0')
  })

  it('renders multiple stars', () => {
    render(<StarField starCount={50} />)

    const stars = screen.getAllByTestId('star')
    expect(stars.length).toBe(50)
  })
})
