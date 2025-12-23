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
