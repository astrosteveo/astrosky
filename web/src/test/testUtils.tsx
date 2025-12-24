import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { ObservationsProvider } from '../context/ObservationsContext'

// Wrapper component that provides all contexts needed for testing
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ObservationsProvider>
      {children}
    </ObservationsProvider>
  )
}

// Custom render function that wraps components with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override the render function
export { customRender as render }
