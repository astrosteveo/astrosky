import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import type { ReactNode } from 'react'

// Stagger container for orchestrating child animations
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function StaggerContainer({ children, className = '', delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Fade in from below with spring physics
interface FadeInUpProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeInUp({ children, className = '', delay = 0 }: FadeInUpProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

// For use inside StaggerContainer
export const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

// Motion card with hover effects
interface MotionCardProps {
  children: ReactNode
  className?: string
}

export function MotionCard({ children, className = '' }: MotionCardProps) {
  return (
    <motion.div
      className={className}
      variants={staggerChildVariants}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

// Animated number for countdowns
interface AnimatedNumberProps {
  value: number
  className?: string
}

export function AnimatedNumber({ value, className = '' }: AnimatedNumberProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        className={className}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {value.toString().padStart(2, '0')}
      </motion.span>
    </AnimatePresence>
  )
}

// Pulsing glow effect for urgency
interface PulsingGlowProps {
  children: ReactNode
  color?: string
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function PulsingGlow({ children, color = 'cyan', intensity = 'medium', className = '' }: PulsingGlowProps) {
  const glowSizes = {
    low: '0 0 20px',
    medium: '0 0 40px',
    high: '0 0 60px',
  }

  const colorMap: Record<string, string> = {
    cyan: 'rgba(34, 211, 238, 0.4)',
    emerald: 'rgba(52, 211, 153, 0.4)',
    amber: 'rgba(251, 191, 36, 0.4)',
    red: 'rgba(248, 113, 113, 0.4)',
    purple: 'rgba(168, 85, 247, 0.4)',
  }

  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `${glowSizes[intensity]} ${colorMap[color] || colorMap.cyan}`,
          `${glowSizes[intensity]} transparent`,
          `${glowSizes[intensity]} ${colorMap[color] || colorMap.cyan}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// Circular progress ring
interface ProgressRingProps {
  progress: number // 0 to 1
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  className?: string
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 3,
  color = '#22d3ee',
  bgColor = 'rgba(255,255,255,0.1)',
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - progress * circumference

  return (
    <svg width={size} height={size} className={className}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
    </svg>
  )
}

// Shimmer loading effect
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      }}
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// Export AnimatePresence for use elsewhere
export { AnimatePresence, motion }
