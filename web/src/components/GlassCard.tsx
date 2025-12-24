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
        y: -3,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      }}
      className={`
        observatory-card observatory-card-hover
        ${noPadding ? '' : compact ? 'p-4' : 'p-6'}
        ${colorConfig.glow}
        ${colorConfig.border}
        ${className}
      `}
    >
      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Card header with title and optional icon */}
        {title && (
          <div className="flex items-center gap-3 mb-5">
            {icon && (
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${colorConfig.accent}15 0%, ${colorConfig.accent}08 100%)`,
                  border: `1px solid ${colorConfig.accent}30`,
                }}
              >
                <span className="text-lg">{icon}</span>
              </div>
            )}
            <div className="flex-1">
              <h2
                className="font-display text-xl font-semibold tracking-wide"
                style={{ color: '#f5f0e1' }}
              >
                {title}
              </h2>
              {/* Decorative underline */}
              <div
                className="mt-1.5 h-px w-16"
                style={{
                  background: `linear-gradient(90deg, ${colorConfig.accent}60 0%, transparent 100%)`,
                }}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        {children}
      </div>

      {/* Corner decoration - top right */}
      <svg
        className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20"
        viewBox="0 0 64 64"
      >
        <path
          d="M64 0 L64 16 L48 16 L48 24 L40 24 L40 32 L32 32 L32 40 L24 40 L24 48 L16 48 L16 64"
          fill="none"
          stroke={colorConfig.accent}
          strokeWidth="0.5"
          opacity="0.3"
        />
        <circle cx="60" cy="4" r="1.5" fill={colorConfig.accent} opacity="0.4" />
        <circle cx="52" cy="4" r="1" fill={colorConfig.accent} opacity="0.3" />
        <circle cx="44" cy="4" r="0.75" fill={colorConfig.accent} opacity="0.2" />
      </svg>

      {/* Corner decoration - bottom left */}
      <svg
        className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none opacity-20 rotate-180"
        viewBox="0 0 64 64"
      >
        <path
          d="M64 0 L64 16 L48 16 L48 24 L40 24 L40 32 L32 32 L32 40 L24 40 L24 48 L16 48 L16 64"
          fill="none"
          stroke={colorConfig.accent}
          strokeWidth="0.5"
          opacity="0.3"
        />
        <circle cx="60" cy="4" r="1.5" fill={colorConfig.accent} opacity="0.4" />
      </svg>
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
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-[rgba(13,26,45,0.8)] to-[rgba(10,22,40,0.9)]
        border border-[rgba(201,162,39,0.15)]
        rounded-lg p-3
        transition-all duration-300
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
    <div className="space-y-1">
      <span className="data-label block">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono text-lg font-medium ${accent ? 'text-[#c9a227]' : 'text-[#f5f0e1]'}`}
        >
          {value}
        </span>
        {unit && <span className="text-[#c4baa6] text-sm">{unit}</span>}
      </div>
    </div>
  )
}

// Divider component matching the observatory theme
export function CardDivider() {
  return <div className="divider-brass my-4" />
}
