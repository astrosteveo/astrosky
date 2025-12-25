import { useState, useMemo } from 'react'
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

type MagnitudeFilter = 'all' | 'bright' | 'medium' | 'faint'

const magnitudeFilters: Record<MagnitudeFilter, { label: string; range: [number, number]; icon: string }> = {
  all: { label: 'All', range: [-Infinity, Infinity], icon: '✦' },
  bright: { label: 'Bright (≤6)', range: [-Infinity, 6], icon: '🌟' },
  medium: { label: 'Medium (6-8)', range: [6, 8], icon: '⭐' },
  faint: { label: 'Faint (>8)', range: [8, Infinity], icon: '✨' },
}

const equipmentConfig: Record<string, { icon: string; color: string }> = {
  'naked eye': { icon: '👁️', color: '#34d399' },
  'binoculars': { icon: '🔭', color: '#4ecdc4' },
  'telescope': { icon: '🔬', color: '#a855f7' },
}

export function DeepSkyCard({ objects, location, placeName }: DeepSkyCardProps) {
  const { addObservation, hasObserved, getObservationsForObject } = useObservationsContext()
  const [magFilter, setMagFilter] = useState<MagnitudeFilter>('all')
  const [groupByConstellation, setGroupByConstellation] = useState(false)

  // Filter objects by magnitude
  const filteredObjects = useMemo(() => {
    const [min, max] = magnitudeFilters[magFilter].range
    return objects.filter(obj => obj.mag > min && obj.mag <= max)
  }, [objects, magFilter])

  // Group objects by constellation
  const groupedObjects = useMemo(() => {
    if (!groupByConstellation) return null
    const groups: Record<string, DSOInfo[]> = {}
    filteredObjects.forEach(obj => {
      if (!groups[obj.constellation]) groups[obj.constellation] = []
      groups[obj.constellation].push(obj)
    })
    // Sort constellations alphabetically
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredObjects, groupByConstellation])

  const handleLog = (obj: DSOInfo) => (equipment: EquipmentType, notes?: string, photos?: string[]) => {
    if (location) {
      const objectId = `dso-${obj.id}`
      addObservation(
        { type: 'deep-sky', id: objectId, name: `${obj.id} - ${obj.name}`, details: `${obj.type} in ${obj.constellation}` },
        { ...location, placeName },
        equipment,
        notes,
        photos
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
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Magnitude Filter */}
        {(Object.keys(magnitudeFilters) as MagnitudeFilter[]).map((key) => {
          const filter = magnitudeFilters[key]
          const isActive = magFilter === key
          const count = key === 'all' ? objects.length :
            objects.filter(o => o.mag > filter.range[0] && o.mag <= filter.range[1]).length

          return (
            <button
              key={key}
              onClick={() => setMagFilter(key)}
              className={`
                px-2.5 py-1 rounded-lg text-xs font-mono transition-all
                flex items-center gap-1.5
                ${isActive
                  ? 'bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/40'
                  : 'bg-[#1e293b]/50 text-[#c4baa6]/70 border border-transparent hover:border-[#c9a227]/20'
                }
              `}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
              <span className="opacity-60">({count})</span>
            </button>
          )
        })}

        {/* Divider */}
        <div className="h-4 w-px bg-[#c9a227]/20 mx-1" />

        {/* Group by Constellation Toggle */}
        <button
          onClick={() => setGroupByConstellation(!groupByConstellation)}
          className={`
            px-2.5 py-1 rounded-lg text-xs font-mono transition-all
            flex items-center gap-1.5
            ${groupByConstellation
              ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/40'
              : 'bg-[#1e293b]/50 text-[#c4baa6]/70 border border-transparent hover:border-[#a855f7]/20'
            }
          `}
        >
          <span>⭐</span>
          <span>Group by Constellation</span>
        </button>
      </div>

      {filteredObjects.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-[#c4baa6]/60 text-sm">No objects match this filter</p>
        </div>
      ) : groupedObjects ? (
        /* Grouped View */
        <div className="space-y-6">
          {groupedObjects.map(([constellation, objs]) => (
            <div key={constellation}>
              {/* Constellation header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#a855f7]/20">
                <span className="text-[#a855f7]">⭐</span>
                <span className="font-display text-sm font-semibold text-[#a855f7]">
                  {constellation}
                </span>
                <span className="text-xs text-[#c4baa6]/50">
                  ({objs.length} object{objs.length !== 1 ? 's' : ''})
                </span>
              </div>
              {/* Objects in constellation */}
              <div className="space-y-3 pl-2">
                {objs.map((obj) => {
                  const objectId = `dso-${obj.id}`
                  const observed = hasObserved(objectId)
                  const obsCount = getObservationsForObject(objectId).length
                  const equipment = equipmentConfig[obj.equipment] || { icon: '✨', color: '#c9a227' }

                  return (
                    <div key={obj.id} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-[#c9a227] bg-[rgba(201,162,39,0.1)] px-1.5 py-0.5 rounded">
                            {obj.id}
                          </span>
                          <span className="font-display font-medium text-[#f5f0e1]">
                            {obj.name}
                          </span>
                          <span className="text-xs text-[#c4baa6]/60">{obj.type}</span>
                          {observed && (
                            <span className="text-xs font-mono px-1 py-0.5 rounded bg-[#34d399]/10 text-[#34d399]">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span style={{ color: equipment.color }}>{equipment.icon} {obj.equipment}</span>
                          <span className="text-[#c4baa6]/60">mag {obj.mag}</span>
                        </div>
                      </div>
                      {location && (
                        <ObservationButton
                          object={{ type: 'deep-sky', id: objectId, name: `${obj.id} - ${obj.name}`, details: `${obj.type} in ${obj.constellation}` }}
                          hasObserved={observed}
                          observationCount={obsCount}
                          onLog={handleLog(obj)}
                          placeName={placeName}
                          compact
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredObjects.map((obj, index) => {
            const objectId = `dso-${obj.id}`
            const observed = hasObserved(objectId)
            const obsCount = getObservationsForObject(objectId).length
            const equipment = equipmentConfig[obj.equipment] || { icon: '✨', color: '#c9a227' }

            return (
              <motion.div
                key={obj.id}
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
                      observationCount={obsCount}
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
      )}

      <CardDivider />
      <div className="flex items-center justify-between text-xs text-[#c4baa6]/60">
        <span>
          {filteredObjects.length === objects.length
            ? `${objects.length} object${objects.length !== 1 ? 's' : ''} visible`
            : `${filteredObjects.length} of ${objects.length} shown`
          }
        </span>
        <span className="font-mono">Messier Catalog</span>
      </div>
    </GlassCard>
  )
}
