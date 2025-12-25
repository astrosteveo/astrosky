import { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'

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
  layer: 'back' | 'mid' | 'front'
  color: string
}

interface ConstellationLine {
  id: number
  x1: number
  y1: number
  x2: number
  y2: number
  opacity: number
}

// Generate constellation-like line connections
function generateConstellationLines(count: number): ConstellationLine[] {
  const lines: ConstellationLine[] = []
  const points: { x: number; y: number }[] = []

  // Generate random star points for constellations
  for (let i = 0; i < count * 2; i++) {
    points.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
    })
  }

  // Connect nearby points to form constellation patterns
  for (let i = 0; i < count; i++) {
    const p1 = points[i]
    // Find a relatively close point (but not too close)
    const nearbyPoints = points
      .filter((_, idx) => idx !== i)
      .map(p => ({
        point: p,
        dist: Math.sqrt(Math.pow(p.x - p1.x, 2) + Math.pow(p.y - p1.y, 2)),
      }))
      .filter(p => p.dist > 5 && p.dist < 20)
      .sort((a, b) => a.dist - b.dist)

    if (nearbyPoints.length > 0) {
      const p2 = nearbyPoints[0].point
      lines.push({
        id: i,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        opacity: 0.03 + Math.random() * 0.04,
      })
    }
  }

  return lines
}

export function StarField({ starCount = 200 }: StarFieldProps) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => {
      const layer = i < starCount * 0.5 ? 'back' : i < starCount * 0.8 ? 'mid' : 'front'

      // Varied star colors - mostly white/silver with occasional warm tones
      const colorChance = Math.random()
      let color: string
      if (colorChance > 0.95) {
        color = '#fef3c7' // Warm yellow (like Betelgeuse)
      } else if (colorChance > 0.92) {
        color = '#fed7aa' // Orange tint
      } else if (colorChance > 0.88) {
        color = '#bfdbfe' // Blue tint (like Rigel)
      } else if (colorChance > 0.85) {
        color = '#c9a227' // Brass/gold accent
      } else {
        color = '#f5f0e1' // Parchment white
      }

      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: layer === 'back' ? Math.random() * 1 + 0.5 : layer === 'mid' ? Math.random() * 1.5 + 0.8 : Math.random() * 2 + 1.2,
        opacity: layer === 'back' ? Math.random() * 0.25 + 0.1 : layer === 'mid' ? Math.random() * 0.35 + 0.25 : Math.random() * 0.5 + 0.4,
        animationDelay: Math.random() * 8,
        animationDuration: Math.random() * 4 + 3,
        layer,
        color,
      }
    })
  }, [starCount])

  const constellationLines = useMemo(() => generateConstellationLines(15), [])

  const getStarStyle = useCallback((star: Star) => ({
    left: `${star.x}%`,
    top: `${star.y}%`,
    width: `${star.size}px`,
    height: `${star.size}px`,
    background: star.layer === 'front'
      ? `radial-gradient(circle, ${star.color} 0%, ${star.color}80 40%, transparent 100%)`
      : star.color,
    boxShadow: star.layer === 'front'
      ? `0 0 ${star.size * 3}px ${star.color}60, 0 0 ${star.size * 6}px ${star.color}30`
      : star.layer === 'mid'
        ? `0 0 ${star.size * 2}px ${star.color}40`
        : 'none',
  }), [])

  return (
    <div
      data-testid="star-field"
      className="starfield fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-700"
    >
      {/* Deep space gradient - rich midnight blues */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 0%, #0a1628 0%, #050a14 50%, #020408 100%)
          `
        }}
      />

      {/* Subtle nebula clouds */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 15% 30%, rgba(201, 162, 39, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 50% 35% at 85% 70%, rgba(78, 205, 196, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 50% 20%, rgba(168, 85, 247, 0.025) 0%, transparent 50%)
          `
        }}
      />

      {/* Aurora borealis effect - subtle waves */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'linear-gradient(180deg, transparent 60%, rgba(78, 205, 196, 0.05) 75%, rgba(168, 85, 247, 0.03) 85%, transparent 100%)',
            'linear-gradient(180deg, transparent 55%, rgba(78, 205, 196, 0.07) 70%, rgba(168, 85, 247, 0.04) 82%, transparent 100%)',
            'linear-gradient(180deg, transparent 60%, rgba(78, 205, 196, 0.05) 75%, rgba(168, 85, 247, 0.03) 85%, transparent 100%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Constellation lines - subtle connections */}
      <svg className="absolute inset-0 w-full h-full">
        {constellationLines.map((line) => (
          <motion.line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="#c9a227"
            strokeWidth="0.5"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{
              opacity: [0, line.opacity, line.opacity, 0],
              pathLength: [0, 1, 1, 0],
            }}
            transition={{
              duration: 12,
              delay: line.id * 0.8,
              repeat: Infinity,
              repeatDelay: 8,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Star layers */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          data-testid="star"
          className="absolute rounded-full"
          style={getStarStyle(star)}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
          }}
          transition={{
            duration: star.animationDuration,
            repeat: Infinity,
            delay: star.animationDelay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Occasional bright star twinkle */}
      <BrightStar />

      {/* Shooting star */}
      <ShootingStar />

      {/* Vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(5, 10, 20, 0.6) 100%)'
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

// Bright star that appears occasionally
function BrightStar() {
  const position = useMemo(() => ({
    x: 20 + Math.random() * 60,
    y: 10 + Math.random() * 40,
  }), [])

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: '4px',
        height: '4px',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 0, 0.8, 1, 0.8, 0, 0],
        scale: [0.5, 0.5, 1, 1.5, 1, 0.5, 0.5],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatDelay: 12,
        ease: 'easeInOut',
      }}
    >
      {/* Star core */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, #fff 0%, #f5f0e1 40%, transparent 100%)',
          boxShadow: '0 0 20px #f5f0e1, 0 0 40px rgba(201, 162, 39, 0.5), 0 0 60px rgba(201, 162, 39, 0.3)',
        }}
      />
      {/* Star rays */}
      <div
        className="absolute"
        style={{
          left: '-8px',
          top: '1px',
          width: '20px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #f5f0e180 50%, transparent 100%)',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '1px',
          top: '-8px',
          width: '2px',
          height: '20px',
          background: 'linear-gradient(180deg, transparent 0%, #f5f0e180 50%, transparent 100%)',
        }}
      />
    </motion.div>
  )
}

// Shooting star with trail
function ShootingStar() {
  return (
    <motion.div
      className="absolute"
      style={{
        width: '3px',
        height: '3px',
        background: 'radial-gradient(circle, #fff 0%, #f5f0e1 50%, transparent 100%)',
        boxShadow: `
          0 0 6px #fff,
          0 0 12px rgba(245, 240, 225, 0.8),
          -10px 0 8px rgba(245, 240, 225, 0.5),
          -25px 0 6px rgba(201, 162, 39, 0.4),
          -45px 0 4px rgba(201, 162, 39, 0.2),
          -70px 0 2px rgba(201, 162, 39, 0.1)
        `,
        borderRadius: '50%',
      }}
      initial={{
        x: '120vw',
        y: '-10vh',
        opacity: 0,
        rotate: 35,
      }}
      animate={{
        x: [null, '-30vw'],
        y: [null, '70vh'],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 18,
        ease: [0.4, 0, 0.2, 1],
      }}
    />
  )
}
