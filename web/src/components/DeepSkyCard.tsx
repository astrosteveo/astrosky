import type { DSOInfo } from '../types'
import { motion } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'
import { ObservationButton } from './ObservationButton'
import { useObservationsContext } from '../context/ObservationsContext'
import type { EquipmentType } from '../types/observations'

interface DeepSkyCardProps {
  objects: DSOInfo[]
  location?: { lat: number; lon: number }
  placeName?: string
}

const equipmentConfig: Record<string, { icon: string; color: string }> = {
  'naked eye': { icon: '👁️', color: '#34d399' },
  'binoculars': { icon: '🔭', color: '#4ecdc4' },
  'telescope': { icon: '🔬', color: '#a855f7' },
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
      <GlassCard title="Deep Sky Objects" icon="🌌" glowColor="nebula">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#c9a227]/10 flex items-center justify-center">
            <span className="text-2xl opacity-50">🌌</span>
          </div>
          <p className="text-[#c4baa6]">No deep sky objects visible</p>
          <p className="text-[#c4baa6]/60 text-sm mt-1">Wait for darker skies</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Deep Sky Objects" icon="🌌" glowColor="nebula">
      <div className="space-y-4">
        {objects.map((obj, index) => {
          const objectId = `dso-${obj.id}`
          const observed = hasObserved(objectId)
          const count = getObservationsForObject(objectId).length
          const equipment = equipmentConfig[obj.equipment] || { icon: '✨', color: '#c9a227' }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {index > 0 && <div className="h-px bg-[#c9a227]/10 mb-4" />}

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Object header */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-[#c9a227] bg-[rgba(201,162,39,0.1)] px-1.5 py-0.5 rounded">
                      {obj.id}
                    </span>
                    <span className="font-display text-lg font-semibold text-[#f5f0e1]">
                      {obj.name}
                    </span>
                    {observed && (
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20">
                        Observed
                      </span>
                    )}
                  </div>

                  {/* Object type and constellation */}
                  <p className="text-sm text-[#c4baa6]/70 mb-2">
                    {obj.type} in <span className="text-[#a855f7]">{obj.constellation}</span>
                  </p>

                  {/* Equipment and magnitude */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span>{equipment.icon}</span>
                      <span className="text-xs font-mono" style={{ color: equipment.color }}>
                        {obj.equipment}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#c9a227]">✦</span>
                      <span className="text-xs font-mono text-[#c4baa6]">
                        mag {obj.mag}
                      </span>
                    </div>
                  </div>

                  {/* Observation tip */}
                  <p className="text-xs text-[#4ecdc4] italic leading-relaxed">
                    "{obj.tip}"
                  </p>
                </div>

                {/* Observation button */}
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
            </motion.div>
          )
        })}
      </div>

      <CardDivider />
      <div className="flex items-center justify-between text-xs text-[#c4baa6]/60">
        <span>{objects.length} object{objects.length !== 1 ? 's' : ''} visible</span>
        <span className="font-mono">Messier Catalog</span>
      </div>
    </GlassCard>
  )
}
