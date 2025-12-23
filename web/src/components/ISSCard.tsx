import type { ISSPass } from '../types'
import { GlassCard } from './GlassCard'

interface ISSCardProps {
  passes: ISSPass[]
}

export function ISSCard({ passes }: ISSCardProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const brightnessColor = (brightness: string) => {
    if (brightness === 'bright') return 'text-yellow-400'
    if (brightness === 'very bright') return 'text-amber-300'
    return 'text-slate-400'
  }

  if (passes.length === 0) {
    return (
      <GlassCard title="ISS Passes">
        <p className="text-slate-400 text-center py-4">No ISS passes tonight</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="ISS Passes">
      <div className="space-y-4">
        {passes.map((pass, index) => (
          <div
            key={index}
            className="pb-4 last:pb-0 border-b border-white/10 last:border-0"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-display text-lg font-semibold text-slate-50">
                {formatTime(pass.start_time)}
              </p>
              <span className={`text-sm font-medium ${brightnessColor(pass.brightness)}`}>
                {pass.brightness}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-slate-500 block">Duration</span>
                <p className="text-slate-50">{pass.duration_minutes} min</p>
              </div>
              <div>
                <span className="text-slate-500 block">Max Altitude</span>
                <p className="text-slate-50">{pass.max_altitude}°</p>
              </div>
              <div>
                <span className="text-slate-500 block">Direction</span>
                <p className="text-slate-50">{pass.start_direction} → {pass.end_direction}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
