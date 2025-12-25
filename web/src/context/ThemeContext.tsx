import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'night'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const THEME_KEY = 'astrosky-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'night') {
      return stored
    }
    return 'dark'
  })

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)

    // Remove all theme classes first
    document.documentElement.classList.remove('light-theme', 'night-theme')

    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme')
    } else if (theme === 'night') {
      document.documentElement.classList.add('night-theme')
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const cycleTheme = () => {
    setThemeState(prev => {
      if (prev === 'dark') return 'light'
      if (prev === 'light') return 'night'
      return 'dark'
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
