import { useMemo } from 'react'
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
}

export function StarField({ starCount = 150 }: StarFieldProps) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => {
      const layer = i < starCount * 0.5 ? 'back' : i < starCount * 0.8 ? 'mid' : 'front'
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: layer === 'back' ? Math.random() * 1.5 + 0.5 : layer === 'mid' ? Math.random() * 2 + 1 : Math.random() * 2.5 + 1.5,
        opacity: layer === 'back' ? Math.random() * 0.3 + 0.1 : layer === 'mid' ? Math.random() * 0.4 + 0.3 : Math.random() * 0.5 + 0.5,
        animationDelay: Math.random() * 5,
        animationDuration: Math.random() * 3 + 2,
        layer,
      }
    })
  }, [starCount])

  return (
    <div
      data-testid="star-field"
      className="starfield fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-500"
    >
      {/* Deep space gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #000000 0%, #020617 50%, #0a0a1a 100%)'
        }}
      />

      {/* Aurora/Nebula effect - subtle animated gradients */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
            'radial-gradient(ellipse 80% 50% at 25% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 75% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
            'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary aurora - pink/rose tones */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(ellipse 50% 30% at 70% 80%, rgba(244, 114, 182, 0.06) 0%, transparent 50%)',
            'radial-gradient(ellipse 50% 30% at 65% 75%, rgba(244, 114, 182, 0.08) 0%, transparent 50%)',
            'radial-gradient(ellipse 50% 30% at 70% 80%, rgba(244, 114, 182, 0.06) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />

      {/* Stars with layered depth */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          data-testid="star"
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.layer === 'front'
              ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200,220,255,0.8) 50%, transparent 100%)'
              : 'white',
            boxShadow: star.layer === 'front'
              ? `0 0 ${star.size * 2}px rgba(200, 220, 255, 0.5)`
              : 'none',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
          }}
          transition={{
            duration: star.animationDuration,
            repeat: Infinity,
            delay: star.animationDelay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Occasional shooting star */}
      <ShootingStar />
    </div>
  )
}

function ShootingStar() {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white rounded-full"
      style={{
        boxShadow: '0 0 4px #fff, -20px 0 10px rgba(255,255,255,0.5), -40px 0 6px rgba(255,255,255,0.3)',
      }}
      initial={{
        x: '120vw',
        y: '-10vh',
        opacity: 0,
      }}
      animate={{
        x: [null, '-20vw'],
        y: [null, '60vh'],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 15,
        ease: 'easeIn',
      }}
    />
  )
}
