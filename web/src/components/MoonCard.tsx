import { MoonInfo } from '../types'
import { GlassCard } from './GlassCard'

interface MoonCardProps {
  moon: MoonInfo
}

function MoonPhaseSVG({ illumination, phaseName }: { illumination: number; phaseName: string }) {
  const isWaxing = phaseName.toLowerCase().includes('waxing')
  const isNew = phaseName.toLowerCase().includes('new')
  const isFull = phaseName.toLowerCase().includes('full')
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
