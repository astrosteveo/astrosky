# AstroSky Web Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use agent-workflow:executing-plans to implement this plan task-by-task.

**Goal:** Build a React frontend for AstroSky with Deep Space Glass aesthetic - immersive dark theme with glassmorphism cards floating over an animated star field.

**Architecture:** React SPA using Vite + TypeScript. Custom hooks for geolocation and API fetching. Presentational card components for each data section. Tailwind CSS with custom theme for Deep Space Glass aesthetic.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Vitest + React Testing Library

---

## Design System: Deep Space Glass

**Colors:**
- Background: True black `#000000` with subtle blue tint `#020617`
- Card glass: `rgba(255, 255, 255, 0.03)` with blur backdrop
- Borders: Aurora gradient `from-cyan-500/20 via-purple-500/20 to-pink-500/20`
- Text primary: `#f8fafc` (slate-50)
- Text secondary: `#94a3b8` (slate-400)
- Accent: `#38bdf8` (sky-400)

**Typography:**
- Display: "Space Grotesk" (geometric, space-age feel)
- Body: "IBM Plex Sans" (clean, technical)

**Effects:**
- Glassmorphism: `backdrop-blur-xl bg-white/[0.03] border border-white/10`
- Subtle glow on hover: `shadow-[0_0_30px_rgba(56,189,248,0.15)]`
- Star field: CSS animated particles or canvas

---

## Task 1: Project Setup

**Files:**
- Create: `web/package.json`
- Create: `web/vite.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/index.html`
- Create: `web/src/main.tsx`
- Create: `web/src/App.tsx`
- Create: `web/tailwind.config.js`
- Create: `web/postcss.config.js`
- Create: `web/src/index.css`

**Step 1: Initialize Vite project**

Run:
```bash
cd /home/n78573/workspace/personal/astrosky
npm create vite@latest web -- --template react-ts
```

**Step 2: Install dependencies**

Run:
```bash
cd web
npm install
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
npx tailwindcss init -p
```

**Step 3: Configure Tailwind**

Replace `web/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        space: {
          black: '#000000',
          deep: '#020617',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
```

**Step 4: Configure CSS**

Replace `web/src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-space-black text-slate-50 font-body antialiased;
  }
}

@layer components {
  .glass-card {
    @apply backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl;
  }

  .glass-card-hover {
    @apply transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)];
  }
}
```

**Step 5: Configure Vitest**

Add to `web/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

Create `web/src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Update `web/tsconfig.json` to add:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

**Step 6: Verify setup**

Run:
```bash
cd web && npm run dev
```
Expected: Vite dev server starts on http://localhost:5173

**Step 7: Commit**

```bash
git add web/
git commit -m "feat(web): initialize React + Vite + Tailwind + Vitest"
```

---

## Task 2: API Client Hook

**Files:**
- Create: `web/src/lib/api.ts`
- Create: `web/src/hooks/useReport.ts`
- Create: `web/src/hooks/useReport.test.ts`
- Create: `web/src/types.ts`

**Step 1: Create TypeScript types**

Create `web/src/types.ts`:
```typescript
export interface Location {
  lat: number
  lon: number
}

export interface SunTimes {
  sunrise: string
  sunset: string
  astronomical_twilight_start: string
  astronomical_twilight_end: string
}

export interface MoonInfo {
  phase_name: string
  illumination: number
  darkness_quality: string
  moonrise: string | null
  moonset: string | null
}

export interface PlanetInfo {
  name: string
  direction: string
  altitude: number
  rise_time: string | null
  set_time: string | null
  description: string
}

export interface ISSPass {
  start_time: string
  duration_minutes: number
  max_altitude: number
  start_direction: string
  end_direction: string
  brightness: string
}

export interface ShowerInfo {
  name: string
  zhr: number
  peak_date: string
  radiant_constellation: string
  is_peak: boolean
}

export interface DSOInfo {
  id: string
  name: string
  constellation: string
  mag: number
  size: number
  type: string
  equipment: string
  tip: string
  altitude: number
}

export interface AstroEvent {
  type: string
  date: string
  title: string
  description: string
  bodies: string[]
}

export interface SkyReport {
  date: string
  location: Location
  sun: SunTimes
  moon: MoonInfo
  planets: PlanetInfo[]
  iss_passes: ISSPass[]
  meteors: ShowerInfo[]
  deep_sky: DSOInfo[]
  events: AstroEvent[]
}
```

**Step 2: Write failing test for useReport hook**

Create `web/src/hooks/useReport.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useReport } from './useReport'

const mockReport = {
  date: '2025-12-23T00:00:00Z',
  location: { lat: 40.7128, lon: -74.006 },
  sun: {
    sunrise: '2025-12-23T12:00:00Z',
    sunset: '2025-12-23T21:30:00Z',
    astronomical_twilight_start: '2025-12-23T23:00:00Z',
    astronomical_twilight_end: '2025-12-24T10:00:00Z',
  },
  moon: {
    phase_name: 'Waxing Crescent',
    illumination: 15.5,
    darkness_quality: 'Excellent',
    moonrise: '2025-12-23T14:00:00Z',
    moonset: '2025-12-24T02:00:00Z',
  },
  planets: [],
  iss_passes: [],
  meteors: [],
  deep_sky: [],
  events: [],
}

describe('useReport', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches report for given coordinates', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReport),
    })

    const { result } = renderHook(() => useReport(40.7128, -74.006))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockReport)
    expect(result.current.error).toBeNull()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('lat=40.7128&lon=-74.006')
    )
  })

  it('handles fetch errors', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useReport(40.7128, -74.006))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network error')
  })

  it('does not fetch when coordinates are null', () => {
    global.fetch = vi.fn()

    const { result } = renderHook(() => useReport(null, null))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })
})
```

**Step 3: Run test to verify it fails**

Run:
```bash
cd web && npx vitest run src/hooks/useReport.test.ts
```
Expected: FAIL - module './useReport' not found

**Step 4: Create API config**

Create `web/src/lib/api.ts`:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchReport(lat: number, lon: number, date?: string) {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  })
  if (date) {
    params.append('date', date)
  }

  const response = await fetch(`${API_BASE_URL}/api/report?${params}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}
```

**Step 5: Implement useReport hook**

Create `web/src/hooks/useReport.ts`:
```typescript
import { useState, useEffect } from 'react'
import { SkyReport } from '../types'
import { fetchReport } from '../lib/api'

interface UseReportResult {
  data: SkyReport | null
  loading: boolean
  error: string | null
}

export function useReport(
  lat: number | null,
  lon: number | null,
  date?: string
): UseReportResult {
  const [data, setData] = useState<SkyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lat === null || lon === null) {
      return
    }

    setLoading(true)
    setError(null)

    fetchReport(lat, lon, date)
      .then((report) => {
        setData(report)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [lat, lon, date])

  return { data, loading, error }
}
```

**Step 6: Run test to verify it passes**

Run:
```bash
cd web && npx vitest run src/hooks/useReport.test.ts
```
Expected: PASS (3 tests)

**Step 7: Commit**

```bash
git add web/src/
git commit -m "feat(web): add useReport hook with tests"
```

---

## Task 3: Geolocation Hook

**Files:**
- Create: `web/src/hooks/useGeolocation.ts`
- Create: `web/src/hooks/useGeolocation.test.ts`

**Step 1: Write failing test**

Create `web/src/hooks/useGeolocation.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useGeolocation } from './useGeolocation'

describe('useGeolocation', () => {
  const mockPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns location on success', async () => {
    const mockGetCurrentPosition = vi.fn((success) => {
      success(mockPosition)
    })

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.lat).toBe(40.7128)
      expect(result.current.lon).toBe(-74.006)
    })

    expect(result.current.error).toBeNull()
  })

  it('returns error on failure', async () => {
    const mockGetCurrentPosition = vi.fn((_, error) => {
      error({ message: 'User denied geolocation' })
    })

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.error).toBe('User denied geolocation')
    })

    expect(result.current.lat).toBeNull()
    expect(result.current.lon).toBeNull()
  })
})
```

**Step 2: Run test to verify it fails**

Run:
```bash
cd web && npx vitest run src/hooks/useGeolocation.test.ts
```
Expected: FAIL - module './useGeolocation' not found

**Step 3: Implement useGeolocation hook**

Create `web/src/hooks/useGeolocation.ts`:
```typescript
import { useState, useEffect } from 'react'

interface UseGeolocationResult {
  lat: number | null
  lon: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation(): UseGeolocationResult {
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude)
        setLon(position.coords.longitude)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
  }, [])

  return { lat, lon, error, loading }
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
cd web && npx vitest run src/hooks/useGeolocation.test.ts
```
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add web/src/hooks/
git commit -m "feat(web): add useGeolocation hook with tests"
```

---

## Task 4: Star Field Background Component

**Files:**
- Create: `web/src/components/StarField.tsx`
- Create: `web/src/components/StarField.test.tsx`

**Step 1: Write failing test**

Create `web/src/components/StarField.test.tsx`:
```typescript
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
```

**Step 2: Run test to verify it fails**

Run:
```bash
cd web && npx vitest run src/components/StarField.test.tsx
```
Expected: FAIL - module './StarField' not found

**Step 3: Implement StarField component**

Create `web/src/components/StarField.tsx`:
```typescript
import { useMemo } from 'react'

interface StarFieldProps {
  starCount?: number
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  animationDelay: number
  animationDuration: number
}

export function StarField({ starCount = 100 }: StarFieldProps) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 3 + 2,
    }))
  }, [starCount])

  return (
    <div
      data-testid="star-field"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ background: 'linear-gradient(to bottom, #000000, #020617)' }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          data-testid="star"
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`,
          }}
        />
      ))}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
cd web && npx vitest run src/components/StarField.test.tsx
```
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add web/src/components/
git commit -m "feat(web): add StarField background component"
```

---

## Task 5: Glass Card Component

**Files:**
- Create: `web/src/components/GlassCard.tsx`
- Create: `web/src/components/GlassCard.test.tsx`

**Step 1: Write failing test**

Create `web/src/components/GlassCard.test.tsx`:
```typescript
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
    expect(card).toHaveClass('backdrop-blur-xl')
  })
})
```

**Step 2: Run test to verify it fails**

Run:
```bash
cd web && npx vitest run src/components/GlassCard.test.tsx
```
Expected: FAIL - module './GlassCard' not found

**Step 3: Implement GlassCard component**

Create `web/src/components/GlassCard.tsx`:
```typescript
import { ReactNode } from 'react'

interface GlassCardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function GlassCard({ title, children, className = '' }: GlassCardProps) {
  return (
    <div
      data-testid="glass-card"
      className={`
        backdrop-blur-xl bg-white/[0.03]
        border border-white/10 rounded-2xl
        p-6 transition-all duration-300
        hover:bg-white/[0.05] hover:border-white/20
        hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]
        ${className}
      `}
    >
      {title && (
        <h2 className="font-display text-xl font-semibold text-slate-50 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
cd web && npx vitest run src/components/GlassCard.test.tsx
```
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add web/src/components/
git commit -m "feat(web): add GlassCard component with glass morphism styling"
```

---

## Task 6: Moon Phase Card

**Files:**
- Create: `web/src/components/MoonCard.tsx`
- Create: `web/src/components/MoonCard.test.tsx`

**Step 1: Write failing test**

Create `web/src/components/MoonCard.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MoonCard } from './MoonCard'
import { MoonInfo } from '../types'

const mockMoon: MoonInfo = {
  phase_name: 'Waxing Crescent',
  illumination: 15.5,
  darkness_quality: 'Excellent',
  moonrise: '2025-12-23T14:00:00Z',
  moonset: '2025-12-24T02:00:00Z',
}

describe('MoonCard', () => {
  it('displays phase name', () => {
    render(<MoonCard moon={mockMoon} />)

    expect(screen.getByText('Waxing Crescent')).toBeInTheDocument()
  })

  it('displays illumination percentage', () => {
    render(<MoonCard moon={mockMoon} />)

    expect(screen.getByText(/15.5%/)).toBeInTheDocument()
  })

  it('displays darkness quality', () => {
    render(<MoonCard moon={mockMoon} />)

    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('renders moon phase SVG', () => {
    render(<MoonCard moon={mockMoon} />)

    expect(screen.getByTestId('moon-phase-svg')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run:
```bash
cd web && npx vitest run src/components/MoonCard.test.tsx
```
Expected: FAIL - module './MoonCard' not found

**Step 3: Implement MoonCard component**

Create `web/src/components/MoonCard.tsx`:
```typescript
import { MoonInfo } from '../types'
import { GlassCard } from './GlassCard'

interface MoonCardProps {
  moon: MoonInfo
}

function MoonPhaseSVG({ illumination, phaseName }: { illumination: number; phaseName: string }) {
  // Calculate the terminator position based on illumination
  // 0% = new moon (all dark), 100% = full moon (all light)
  const isWaxing = phaseName.toLowerCase().includes('waxing')
  const isWaning = phaseName.toLowerCase().includes('waning')
  const isNew = phaseName.toLowerCase().includes('new')
  const isFull = phaseName.toLowerCase().includes('full')

  // Illumination fraction (0 to 1)
  const fraction = illumination / 100

  return (
    <svg
      data-testid="moon-phase-svg"
      viewBox="0 0 100 100"
      className="w-24 h-24 mx-auto"
    >
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
        </radialGradient>
        <clipPath id="moonClip">
          <circle cx="50" cy="50" r="40" />
        </clipPath>
      </defs>

      {/* Outer glow */}
      <circle cx="50" cy="50" r="48" fill="url(#moonGlow)" />

      {/* Moon base (dark side) */}
      <circle cx="50" cy="50" r="40" fill="#1e293b" />

      {/* Illuminated portion */}
      <g clipPath="url(#moonClip)">
        {isFull ? (
          <circle cx="50" cy="50" r="40" fill="#fef9c3" />
        ) : isNew ? null : (
          <ellipse
            cx={isWaxing ? 50 + (1 - fraction) * 40 : 50 - (1 - fraction) * 40}
            cy="50"
            rx={40 * fraction}
            ry="40"
            fill="#fef9c3"
          />
        )}
      </g>

      {/* Crater details */}
      <circle cx="35" cy="40" r="5" fill="#e2e8f0" fillOpacity="0.2" />
      <circle cx="55" cy="55" r="8" fill="#e2e8f0" fillOpacity="0.15" />
      <circle cx="45" cy="65" r="4" fill="#e2e8f0" fillOpacity="0.1" />
    </svg>
  )
}

export function MoonCard({ moon }: MoonCardProps) {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const qualityColor = {
    Excellent: 'text-emerald-400',
    Good: 'text-sky-400',
    Fair: 'text-amber-400',
    Poor: 'text-red-400',
  }[moon.darkness_quality] || 'text-slate-400'

  return (
    <GlassCard title="Moon Phase">
      <div className="flex items-center gap-6">
        <MoonPhaseSVG
          illumination={moon.illumination}
          phaseName={moon.phase_name}
        />

        <div className="flex-1 space-y-2">
          <p className="font-display text-2xl font-semibold text-slate-50">
            {moon.phase_name}
          </p>

          <p className="text-slate-400">
            <span className="text-slate-50 font-medium">{moon.illumination}%</span> illuminated
          </p>

          <p className="text-slate-400">
            Sky darkness: <span className={`font-medium ${qualityColor}`}>{moon.darkness_quality}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex gap-6 text-sm text-slate-400">
        <div>
          <span className="text-slate-500">Moonrise</span>
          <p className="text-slate-50">{formatTime(moon.moonrise)}</p>
        </div>
        <div>
          <span className="text-slate-500">Moonset</span>
          <p className="text-slate-50">{formatTime(moon.moonset)}</p>
        </div>
      </div>
    </GlassCard>
  )
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
cd web && npx vitest run src/components/MoonCard.test.tsx
```
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add web/src/components/
git commit -m "feat(web): add MoonCard with phase visualization"
```

---

## Task 7: Planets Card

**Files:**
- Create: `web/src/components/PlanetsCard.tsx`
- Create: `web/src/components/PlanetsCard.test.tsx`

**Step 1: Write failing test**

Create `web/src/components/PlanetsCard.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlanetsCard } from './PlanetsCard'
import { PlanetInfo } from '../types'

const mockPlanets: PlanetInfo[] = [
  {
    name: 'Jupiter',
    direction: 'SE',
    altitude: 45,
    rise_time: '2025-12-23T18:00:00Z',
    set_time: '2025-12-24T04:00:00Z',
    description: 'Bright, steady light',
  },
  {
    name: 'Saturn',
    direction: 'SW',
    altitude: 30,
    rise_time: '2025-12-23T16:00:00Z',
    set_time: '2025-12-24T02:00:00Z',
    description: 'Golden, rings in telescope',
  },
]

describe('PlanetsCard', () => {
  it('displays planet names', () => {
    render(<PlanetsCard planets={mockPlanets} />)

    expect(screen.getByText('Jupiter')).toBeInTheDocument()
    expect(screen.getByText('Saturn')).toBeInTheDocument()
  })

  it('displays direction and altitude', () => {
    render(<PlanetsCard planets={mockPlanets} />)

    expect(screen.getByText(/SE.*45°/)).toBeInTheDocument()
  })

  it('shows empty state when no planets visible', () => {
    render(<PlanetsCard planets={[]} />)

    expect(screen.getByText(/no planets visible/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run:
```bash
cd web && npx vitest run src/components/PlanetsCard.test.tsx
```
Expected: FAIL - module './PlanetsCard' not found

**Step 3: Implement PlanetsCard component**

Create `web/src/components/PlanetsCard.tsx`:
```typescript
import { PlanetInfo } from '../types'
import { GlassCard } from './GlassCard'

interface PlanetsCardProps {
  planets: PlanetInfo[]
}

const planetColors: Record<string, string> = {
  Mercury: 'bg-slate-400',
  Venus: 'bg-amber-200',
  Mars: 'bg-red-500',
  Jupiter: 'bg-orange-300',
  Saturn: 'bg-yellow-200',
  Uranus: 'bg-cyan-300',
  Neptune: 'bg-blue-400',
}

export function PlanetsCard({ planets }: PlanetsCardProps) {
  if (planets.length === 0) {
    return (
      <GlassCard title="Planets">
        <p className="text-slate-400 text-center py-4">
          No planets visible tonight
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Planets">
      <div className="space-y-4">
        {planets.map((planet) => (
          <div key={planet.name} className="flex items-center gap-4">
            <div
              className={`w-4 h-4 rounded-full ${planetColors[planet.name] || 'bg-slate-400'}`}
            />

            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-semibold text-slate-50">
                  {planet.name}
                </span>
                <span className="text-sm text-slate-400">
                  {planet.direction} • {planet.altitude}°
                </span>
              </div>
              <p className="text-sm text-slate-500">{planet.description}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
cd web && npx vitest run src/components/PlanetsCard.test.tsx
```
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add web/src/components/
git commit -m "feat(web): add PlanetsCard component"
```

---

## Task 8: Remaining Card Components

Create similar test-first implementations for:

- `ISSCard` - ISS passes with times and directions
- `MeteorsCard` - Active meteor showers with ZHR
- `DeepSkyCard` - Visible Messier objects with equipment tips
- `EventsCard` - Upcoming astronomical events

(Follow same RED-GREEN-REFACTOR pattern as Tasks 5-7)

---

## Task 9: Main App Integration

**Files:**
- Modify: `web/src/App.tsx`
- Create: `web/src/App.test.tsx`

**Step 1: Write failing test**

Create `web/src/App.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    lat: 40.7128,
    lon: -74.006,
    error: null,
    loading: false,
  }),
}))

vi.mock('./hooks/useReport', () => ({
  useReport: () => ({
    data: {
      moon: {
        phase_name: 'Full Moon',
        illumination: 100,
        darkness_quality: 'Poor',
        moonrise: null,
        moonset: null,
      },
      planets: [],
      iss_passes: [],
      meteors: [],
      deep_sky: [],
      events: [],
    },
    loading: false,
    error: null,
  }),
}))

describe('App', () => {
  it('renders moon card with data', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Full Moon')).toBeInTheDocument()
    })
  })

  it('displays location coordinates', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/40.71.*-74.01/)).toBeInTheDocument()
    })
  })
})
```

**Step 2-6: Implement and verify** (follow TDD cycle)

---

## Task 10: Final Polish

- Add loading skeleton states
- Add error boundary
- Verify mobile responsiveness
- Run full test suite: `npm test`
- Build production: `npm run build`

---

## Execution

Plan saved. Two execution options:

**1. Subagent-Driven (this session)** - Dispatch fresh subagent per task, review between tasks

**2. Parallel Session (separate)** - Open new session with executing-plans skill

Which approach?
