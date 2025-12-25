import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './GlassCard'
import type { PlanetInfo, DSOInfo } from '../types'

interface SkyChartProps {
  planets: PlanetInfo[]
  deepSky: DSOInfo[]
}

// Sky chart object for rendering
interface SkyObject {
  id: string
  name: string
  type: 'planet' | 'dso'
  altitude: number
  azimuth: number
  magnitude?: number
  details?: string
  color: string
  size: number
}

// Planet colors for visualization
const planetColors: Record<string, string> = {
  Mercury: '#b8b8b8',
  Venus: '#ffe4b5',
  Mars: '#e25822',
  Jupiter: '#d4a574',
  Saturn: '#f4d59e',
  Uranus: '#b5e3e3',
  Neptune: '#5b7ebe',
}

// DSO type colors
const dsoColors: Record<string, string> = {
  galaxy: '#a855f7',
  nebula: '#4ecdc4',
  cluster: '#fbbf24',
  'globular cluster': '#f97316',
  'open cluster': '#34d399',
  'planetary nebula': '#ec4899',
}

// Convert altitude/azimuth to x,y coordinates
// Uses stereographic projection: center = zenith, edge = horizon
function altAzToXY(altitude: number, azimuth: number, radius: number, centerX: number, centerY: number) {
  // Distance from center: 0 at zenith (90°), radius at horizon (0°)
  // Using linear projection for simplicity
  const r = ((90 - altitude) / 90) * radius

  // Azimuth: 0° = North (top), 90° = East (right), 180° = South (bottom), 270° = West (left)
  // Convert to radians, with 0° at top and increasing clockwise
  const theta = ((azimuth - 90) * Math.PI) / 180

  return {
    x: centerX + r * Math.cos(theta),
    y: centerY + r * Math.sin(theta),
  }
}

// Object tooltip popup
function ObjectTooltip({ object, x, y, onClose }: { object: SkyObject; x: number; y: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute z-20 pointer-events-auto"
      style={{ left: x, top: y, transform: 'translate(-50%, -100%) translateY(-10px)' }}
    >
      <div
        className="bg-[#0a0a0f]/95 border border-[#c9a227]/30 rounded-lg p-3 shadow-xl backdrop-blur-sm min-w-[140px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-semibold text-[#f5f0e1] text-sm">{object.name}</span>
          <button
            onClick={onClose}
            className="text-[#c4baa6]/50 hover:text-[#c4baa6] text-xs ml-2"
          >
            ✕
          </button>
        </div>
        <div className="space-y-1 text-xs text-[#c4baa6]">
          <p>Alt: {object.altitude}° • Az: {object.azimuth}°</p>
          {object.details && <p className="text-[#c9a227]">{object.details}</p>}
          {object.magnitude !== undefined && (
            <p>Magnitude: {object.magnitude.toFixed(1)}</p>
          )}
        </div>
        {/* Tooltip arrow */}
        <div
          className="absolute left-1/2 bottom-0 w-2 h-2 bg-[#0a0a0f]/95 border-r border-b border-[#c9a227]/30 transform rotate-45 translate-y-1 -translate-x-1/2"
        />
      </div>
    </motion.div>
  )
}

export function SkyChart({ planets, deepSky }: SkyChartProps) {
  const [selectedObject, setSelectedObject] = useState<{ object: SkyObject; x: number; y: number } | null>(null)
  const [showPlanets, setShowPlanets] = useState(true)
  const [showDSO, setShowDSO] = useState(true)

  // Chart dimensions
  const size = 280
  const center = size / 2
  const radius = (size - 40) / 2 // Leave margin for labels

  // Combine all objects for rendering
  const objects = useMemo(() => {
    const result: SkyObject[] = []

    if (showPlanets) {
      planets.forEach((planet) => {
        if (planet.altitude > 0) {
          result.push({
            id: `planet-${planet.name}`,
            name: planet.name,
            type: 'planet',
            altitude: planet.altitude,
            azimuth: planet.azimuth,
            details: planet.description,
            color: planetColors[planet.name] || '#c9a227',
            size: planet.name === 'Venus' || planet.name === 'Jupiter' ? 8 : 6,
          })
        }
      })
    }

    if (showDSO) {
      deepSky.forEach((dso) => {
        if (dso.altitude > 0) {
          result.push({
            id: `dso-${dso.id}`,
            name: `${dso.id} - ${dso.name}`,
            type: 'dso',
            altitude: dso.altitude,
            azimuth: dso.azimuth,
            magnitude: dso.mag,
            details: `${dso.type} in ${dso.constellation}`,
            color: dsoColors[dso.type.toLowerCase()] || '#a855f7',
            size: Math.max(4, 8 - dso.mag / 2), // Brighter = larger
          })
        }
      })
    }

    return result
  }, [planets, deepSky, showPlanets, showDSO])

  const handleObjectClick = (object: SkyObject, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const svgRect = (event.currentTarget.closest('svg') as SVGElement)?.getBoundingClientRect()
    if (svgRect) {
      setSelectedObject({
        object,
        x: rect.left - svgRect.left + rect.width / 2,
        y: rect.top - svgRect.top,
      })
    }
  }

  // Cardinal direction markers
  const cardinals = [
    { label: 'N', azimuth: 0 },
    { label: 'E', azimuth: 90 },
    { label: 'S', azimuth: 180 },
    { label: 'W', azimuth: 270 },
  ]

  return (
    <GlassCard title="Sky Chart" icon="🌌" glowColor="nebula">
      {/* Filter toggles */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setShowPlanets(!showPlanets)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
            showPlanets
              ? 'bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/30'
              : 'bg-[rgba(15,23,42,0.4)] text-[#c4baa6]/60 border border-transparent'
          }`}
        >
          🪐 Planets
        </button>
        <button
          onClick={() => setShowDSO(!showDSO)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
            showDSO
              ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30'
              : 'bg-[rgba(15,23,42,0.4)] text-[#c4baa6]/60 border border-transparent'
          }`}
        >
          🌌 Deep Sky
        </button>
        <span className="text-xs text-[#c4baa6]/50 ml-auto">
          {objects.length} visible
        </span>
      </div>

      {/* Sky chart SVG */}
      <div className="relative flex justify-center" onClick={() => setSelectedObject(null)}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[280px] aspect-square"
        >
          <defs>
            {/* Background gradient */}
            <radialGradient id="skyGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0.7" />
            </radialGradient>
            {/* Glow filter for planets */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sky background */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#skyGradient)"
            stroke="#c9a227"
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          {/* Altitude circles (30°, 60°) */}
          {[30, 60].map((alt) => {
            const r = ((90 - alt) / 90) * radius
            return (
              <circle
                key={alt}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="#c9a227"
                strokeWidth="0.5"
                strokeOpacity="0.2"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Zenith marker */}
          <circle
            cx={center}
            cy={center}
            r="3"
            fill="#c9a227"
            opacity="0.4"
          />
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            className="text-[8px] fill-[#c9a227]/60"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            Z
          </text>

          {/* Azimuth lines (N-S, E-W) */}
          <line
            x1={center}
            y1={center - radius}
            x2={center}
            y2={center + radius}
            stroke="#c9a227"
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />
          <line
            x1={center - radius}
            y1={center}
            x2={center + radius}
            y2={center}
            stroke="#c9a227"
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />

          {/* Cardinal direction labels */}
          {cardinals.map(({ label, azimuth }) => {
            const pos = altAzToXY(0, azimuth, radius + 12, center, center)
            return (
              <text
                key={label}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-mono font-bold fill-[#c9a227]"
              >
                {label}
              </text>
            )
          })}

          {/* Render celestial objects */}
          {objects.map((obj) => {
            const pos = altAzToXY(obj.altitude, obj.azimuth, radius, center, center)
            const isSelected = selectedObject?.object.id === obj.id

            return (
              <g key={obj.id}>
                {/* Object marker */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={obj.size}
                  fill={obj.color}
                  filter={obj.type === 'planet' ? 'url(#glow)' : undefined}
                  opacity={isSelected ? 1 : 0.85}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleObjectClick(obj, e)
                  }}
                />
                {/* Selection ring */}
                {isSelected && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={obj.size + 4}
                    fill="none"
                    stroke={obj.color}
                    strokeWidth="1.5"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  />
                )}
                {/* DSO shape indicators */}
                {obj.type === 'dso' && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={obj.size + 2}
                    fill="none"
                    stroke={obj.color}
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                  />
                )}
              </g>
            )
          })}

          {/* Horizon label */}
          <text
            x={center}
            y={size - 5}
            textAnchor="middle"
            className="text-[7px] fill-[#c4baa6]/40"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            Horizon
          </text>
        </svg>

        {/* Object tooltip */}
        <AnimatePresence>
          {selectedObject && (
            <ObjectTooltip
              object={selectedObject.object}
              x={selectedObject.x}
              y={selectedObject.y}
              onClose={() => setSelectedObject(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-[#c9a227]/10">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#c4baa6]/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#d4a574]" /> Planets
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Galaxies
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4ecdc4]" /> Nebulae
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#fbbf24]" /> Clusters
          </span>
        </div>
        <p className="text-[10px] text-[#c4baa6]/40 mt-2">
          Tap objects to see details • Center = zenith • Edge = horizon
        </p>
      </div>
    </GlassCard>
  )
}
