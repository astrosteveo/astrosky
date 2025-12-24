import type { DSOInfo } from '../types'
import { GlassCard } from './GlassCard'
import { ObservationButton } from './ObservationButton'
import { useObservationsContext } from '../context/ObservationsContext'
import type { EquipmentType } from '../types/observations'

interface DeepSkyCardProps {
  objects: DSOInfo[]
  location?: { lat: number; lon: number }
  placeName?: string
}

export function DeepSkyCard({ objects, location, placeName }: DeepSkyCardProps) {
  const { addObservation, hasObserved, getObservationsForObject } = useObservationsContext()

  const handleLog = (obj: DSOInfo) => (equipment: EquipmentType, notes?: string) => {
    if (location) {
      const objectId = `dso-${obj.id}`
      addObservation(
        { type: 'deep-sky', id: objectId, name: `${obj.id} - ${obj.name}`, details: `${obj.type} in ${obj.constellation}` },
        { ...location, placeName },
        equipment,
        notes
      )
    }
  }

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
        {objects.map((obj, index) => {
          const objectId = `dso-${obj.id}`
          const observed = hasObserved(objectId)
          const count = getObservationsForObject(objectId).length

          return (
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
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">
                    mag {obj.mag}
                  </span>
                  {location && (
                    <ObservationButton
                      object={{ type: 'deep-sky', id: objectId, name: `${obj.id} - ${obj.name}`, details: `${obj.type} in ${obj.constellation}` }}
                      hasObserved={observed}
                      observationCount={count}
                      onLog={handleLog(obj)}
                      placeName={placeName}
                      compact
                    />
                  )}
                </div>
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
          )
        })}
      </div>
    </GlassCard>
  )
}
