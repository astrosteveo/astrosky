import { DSOInfo } from '../types'
import { GlassCard } from './GlassCard'

interface DeepSkyCardProps {
  objects: DSOInfo[]
}

export function DeepSkyCard({ objects }: DeepSkyCardProps) {
  if (objects.length === 0) {
    return (
      <GlassCard title="Deep Sky Objects">
        <p className="text-slate-400 text-center py-4">No deep sky objects visible</p>
      </GlassCard>
    )
  }

  const equipmentIcon = (equipment: string) => {
    if (equipment === 'naked eye') return '👁️'
    if (equipment === 'binoculars') return '🔭'
    if (equipment === 'telescope') return '🔬'
    return '✨'
  }

  return (
    <GlassCard title="Deep Sky Objects">
      <div className="space-y-4">
        {objects.map((obj, index) => (
          <div
            key={index}
            className="pb-4 last:pb-0 border-b border-white/10 last:border-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-display text-lg font-semibold text-slate-50">
                  {obj.id} - {obj.name}
                </p>
                <p className="text-sm text-slate-400">
                  {obj.type} in {obj.constellation}
                </p>
              </div>
              <span className="text-slate-400 text-sm">
                mag {obj.mag}
              </span>
            </div>

            <div className="mb-2 text-sm">
              <span className="text-slate-500">Equipment: </span>
              <span className="text-slate-50">
                {equipmentIcon(obj.equipment)} {obj.equipment}
              </span>
            </div>

            <p className="text-sm text-sky-400 italic">
              {obj.tip}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
