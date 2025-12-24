import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { staggerChildVariants } from './motion'

interface GlassCardProps {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  glowColor?: 'brass' | 'aurora' | 'nebula' | 'mars' | 'success'
  noPadding?: boolean
  compact?: boolean
}

const glowColors = {
  brass: {
    glow: 'hover:shadow-[0_0_50px_rgba(201,162,39,0.12)]',
    border: 'hover:border-[rgba(201,162,39,0.4)]',
    accent: '#c9a227',
  },
  aurora: {
    glow: 'hover:shadow-[0_0_50px_rgba(78,205,196,0.12)]',
    border: 'hover:border-[rgba(78,205,196,0.3)]',
    accent: '#4ecdc4',
  },
  nebula: {
    glow: 'hover:shadow-[0_0_50px_rgba(168,85,247,0.12)]',
    border: 'hover:border-[rgba(168,85,247,0.3)]',
    accent: '#a855f7',
  },
  mars: {
    glow: 'hover:shadow-[0_0_50px_rgba(226,88,34,0.12)]',
    border: 'hover:border-[rgba(226,88,34,0.3)]',
    accent: '#e25822',
  },
  success: {
    glow: 'hover:shadow-[0_0_50px_rgba(52,211,153,0.12)]',
    border: 'hover:border-[rgba(52,211,153,0.3)]',
    accent: '#34d399',
  },
}

export function GlassCard({
  title,
  icon,
  children,
  className = '',
  glowColor = 'brass',
  noPadding = false,
  compact = false,
}: GlassCardProps) {
  const colorConfig = glowColors[glowColor]

  return (
    <motion.div
      data-testid="glass-card"
      variants={staggerChildVariants}
      whileHover={{
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      }}
      className={`
        observatory-card observatory-card-hover
        ${noPadding ? '' : compact ? 'p-4' : 'p-5'}
        ${colorConfig.glow}
        ${colorConfig.border}
        ${className}
      `}
    >
      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Card header with title and optional icon */}
        {title && (
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{
                  background: `${colorConfig.accent}12`,
                }}
              >
                <span className="text-xl">{icon}</span>
              </div>
            )}
            <h2
              className="font-display text-lg font-semibold text-[#f0f4f8]"
            >
              {title}
            </h2>
          </div>
        )}

        {/* Main content */}
        {children}
      </div>
    </motion.div>
  )
}

// Compact card variant for smaller sections
export function CompactCard({
  children,
  className = '',
  glowColor = 'brass',
}: {
  children: ReactNode
  className?: string
  glowColor?: 'brass' | 'aurora' | 'nebula' | 'mars' | 'success'
}) {
  const colorConfig = glowColors[glowColor]

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`
        relative overflow-hidden
        bg-[rgba(15,23,42,0.6)]
        border border-[rgba(148,163,184,0.1)]
        rounded-xl p-3
        transition-all duration-200
        ${colorConfig.glow}
        ${colorConfig.border}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// Stat display component for use within cards
export function StatDisplay({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string
  value: string | number
  unit?: string
  accent?: boolean
}) {
  return (
    <div className="space-y-0.5">
      <span className="data-label block">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono text-lg font-semibold ${accent ? 'text-[#c9a227]' : 'text-[#f0f4f8]'}`}
        >
          {value}
        </span>
        {unit && <span className="text-[#94a3b8] text-sm">{unit}</span>}
      </div>
    </div>
  )
}

// Divider component matching the observatory theme
export function CardDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-[rgba(148,163,184,0.15)] to-transparent my-4" />
}
