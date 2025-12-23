import { ShowerInfo } from '../types'
import { GlassCard } from './GlassCard'

interface MeteorsCardProps {
  meteors: ShowerInfo[]
}

export function MeteorsCard({ meteors }: MeteorsCardProps) {
  if (meteors.length === 0) {
    return (
      <GlassCard title="Meteor Showers">
        <p className="text-slate-400 text-center py-4">No active meteor showers</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Meteor Showers">
      <div className="space-y-4">
        {meteors.map((shower, index) => (
          <div
            key={index}
            className="pb-4 last:pb-0 border-b border-white/10 last:border-0"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-display text-lg font-semibold text-slate-50">
                {shower.name}
              </p>
              {shower.is_peak && (
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                  PEAK
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 block">ZHR</span>
                <p className="text-slate-50">{shower.zhr} ZHR</p>
              </div>
              <div>
                <span className="text-slate-500 block">Radiant</span>
                <p className="text-slate-50">{shower.radiant_constellation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
