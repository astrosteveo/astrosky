import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { staggerChildVariants } from './motion'

interface GlassCardProps {
  title?: string
  children: ReactNode
  className?: string
  glowColor?: 'cyan' | 'purple' | 'amber' | 'emerald' | 'rose'
  noPadding?: boolean
}

const glowColors = {
  cyan: 'hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]',
  purple: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
  amber: 'hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]',
  emerald: 'hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
  rose: 'hover:shadow-[0_0_40px_rgba(251,113,133,0.15)]',
}

const borderColors = {
  cyan: 'hover:border-cyan-500/30',
  purple: 'hover:border-purple-500/30',
  amber: 'hover:border-amber-500/30',
  emerald: 'hover:border-emerald-500/30',
  rose: 'hover:border-rose-500/30',
}

export function GlassCard({
  title,
  children,
  className = '',
  glowColor = 'cyan',
  noPadding = false
}: GlassCardProps) {
  return (
    <motion.div
      data-testid="glass-card"
      variants={staggerChildVariants}
      whileHover={{
        scale: 1.015,
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      className={`
        relative overflow-hidden
        backdrop-blur-xl bg-white/[0.03]
        border border-white/10 rounded-2xl
        ${noPadding ? '' : 'p-6'}
        transition-all duration-300
        hover:bg-white/[0.06]
        ${borderColors[glowColor]}
        ${glowColors[glowColor]}
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {title && (
          <h2 className="font-display text-xl font-semibold text-slate-50 mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </motion.div>
  )
}
