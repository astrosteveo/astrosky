import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { ProBadge } from './ProBadge'
import { useSubscriptionContext } from '../context/SubscriptionContext'
import { useObservationsContext } from '../context/ObservationsContext'
import { useEquipmentContext } from '../context/EquipmentContext'
import { generateObservationPlan, type PlannedObservation } from '../hooks/useObservationPlanner'
import type { SkyReport } from '../types'

interface ObservationPlannerCardProps {
  report: SkyReport | null
  onUpgradeClick: () => void
}

function PriorityBadge({ priority }: { priority: number }) {
  const colors = {
    5: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
    4: 'bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30',
    3: 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30',
    2: 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30',
    1: 'bg-[#94a3b8]/20 text-[#94a3b8] border-[#94a3b8]/30',
  }
  const labels = {
    5: 'Must See',
    4: 'Top Pick',
    3: 'Recommended',
    2: 'Worth It',
    1: 'Optional',
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[priority as keyof typeof colors]}`}>
      {labels[priority as keyof typeof labels]}
    </span>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: PlannedObservation['difficulty'] }) {
  const colors = {
    Easy: 'text-[#4ecdc4]',
    Moderate: 'text-[#fbbf24]',
    Challenging: 'text-[#f97316]',
  }

  return (
    <span className={`text-xs ${colors[difficulty]}`}>
      {difficulty}
    </span>
  )
}

function ObjectIcon({ type }: { type: PlannedObservation['type'] }) {
  const icons = {
    moon: '🌙',
    planet: '🪐',
    dso: '✨',
  }
  return <span className="text-xl">{icons[type]}</span>
}

function ObservationItem({
  observation,
  onLog,
  isLogging,
}: {
  observation: PlannedObservation
  onLog: () => void
  isLogging: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      className={`p-3 rounded-xl border transition-all ${
        observation.hasObserved
          ? 'bg-[#0f172a]/30 border-[#94a3b8]/10'
          : 'bg-[#0f172a]/50 border-[#c9a227]/20 hover:border-[#c9a227]/40'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <ObjectIcon type={observation.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`font-medium ${observation.hasObserved ? 'text-[#94a3b8]' : 'text-[#f5f0e1]'}`}>
              {observation.name}
            </h4>
            <PriorityBadge priority={observation.priority} />
            {observation.hasObserved && (
              <span className="text-xs text-[#4ecdc4]">✓ Observed</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#94a3b8]">
            <DifficultyBadge difficulty={observation.difficulty} />
            <span>•</span>
            <span>{observation.equipment}</span>
            {observation.magnitude && (
              <>
                <span>•</span>
                <span>mag {observation.magnitude.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
        <motion.svg
          className="w-4 h-4 text-[#94a3b8] flex-shrink-0 mt-1"
          animate={{ rotate: expanded ? 180 : 0 }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-[#c9a227]/10"
          >
            <div className="space-y-2">
              <p className="text-sm text-[#c4baa6]">{observation.bestTime}</p>

              {observation.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {observation.reasons.map((reason, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs rounded-full bg-[#c9a227]/10 text-[#c9a227]"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}

              {observation.constellation && (
                <p className="text-xs text-[#94a3b8]">
                  In {observation.constellation} • Alt: {observation.altitude.toFixed(0)}°
                </p>
              )}

              {!observation.hasObserved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onLog()
                  }}
                  disabled={isLogging}
                  className="mt-2 w-full px-3 py-2 text-sm font-medium rounded-lg bg-[#4ecdc4]/20 text-[#4ecdc4] border border-[#4ecdc4]/30 hover:bg-[#4ecdc4]/30 transition-all disabled:opacity-50"
                >
                  {isLogging ? 'Logging...' : 'Log Observation'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ObservationPlannerCard({ report, onUpgradeClick }: ObservationPlannerCardProps) {
  const { isPro } = useSubscriptionContext()
  const { observations } = useObservationsContext()
  const { getLimitingMagnitude } = useEquipmentContext()
  const [loggingId, setLoggingId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  // Get list of observed object IDs
  const observedIds = useMemo(() => {
    return observations.map(o => o.object.id)
  }, [observations])

  // Generate observation plan
  const plan = useMemo(() => {
    if (!report) return null
    return generateObservationPlan(report, {
      limitingMagnitude: getLimitingMagnitude(),
      observedObjectIds: observedIds,
      includeObserved: true,
      maxResults: 15,
    })
  }, [report, observedIds, getLimitingMagnitude])

  const handleLog = (observation: PlannedObservation) => {
    // For now, just show it's logging - in a full implementation,
    // this would open the LogObservationModal
    setLoggingId(observation.id)
    setTimeout(() => setLoggingId(null), 1000)
  }

  if (!report || !plan) return null

  const displayedObservations = showAll ? plan.allRecommendations : plan.topPicks

  return (
    <GlassCard
      title="Observation Planner"
      icon="🎯"
      glowColor={isPro ? 'nebula' : 'brass'}
    >
      <div className="space-y-4">
        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0f172a]/50 border border-[#c9a227]/10">
          <div className="text-center">
            <p className="text-xl font-bold text-[#f5f0e1]">{plan.stats.totalAvailable}</p>
            <p className="text-xs text-[#94a3b8]">Visible Tonight</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#4ecdc4]">{plan.stats.newToYou}</p>
            <p className="text-xs text-[#94a3b8]">New to You</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#c9a227]">{plan.stats.easyTargets}</p>
            <p className="text-xs text-[#94a3b8]">Easy Targets</p>
          </div>
        </div>

        {/* Pro gate for detailed plan */}
        {!isPro ? (
          <div className="space-y-3">
            {/* Show 2 items as preview */}
            {plan.topPicks.slice(0, 2).map(obs => (
              <div
                key={obs.id}
                className="p-3 rounded-xl bg-[#0f172a]/30 border border-[#94a3b8]/10 opacity-75"
              >
                <div className="flex items-center gap-3">
                  <ObjectIcon type={obs.type} />
                  <div>
                    <h4 className="font-medium text-[#f5f0e1]">{obs.name}</h4>
                    <p className="text-xs text-[#94a3b8]">{obs.difficulty} • {obs.equipment}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Blurred additional items */}
            <div className="relative">
              <div className="space-y-3 blur-[3px] opacity-50 pointer-events-none">
                {plan.topPicks.slice(2, 4).map(obs => (
                  <div
                    key={obs.id}
                    className="p-3 rounded-xl bg-[#0f172a]/30 border border-[#94a3b8]/10"
                  >
                    <div className="flex items-center gap-3">
                      <ObjectIcon type={obs.type} />
                      <div>
                        <h4 className="font-medium text-[#f5f0e1]">{obs.name}</h4>
                        <p className="text-xs text-[#94a3b8]">{obs.difficulty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              onClick={onUpgradeClick}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#c9a227]/20 to-[#e8c547]/20 border border-[#c9a227]/30 text-[#c9a227] hover:from-[#c9a227]/30 hover:to-[#e8c547]/30 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <ProBadge />
              <span>Unlock Full Observation Planner</span>
            </motion.button>
          </div>
        ) : (
          <>
            {/* Full list for Pro users */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#c9a227]">
                  {showAll ? 'All Recommendations' : 'Tonight\'s Top Picks'}
                </h3>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-[#4ecdc4] hover:underline"
                >
                  {showAll ? 'Show Top 5' : `Show All (${plan.allRecommendations.length})`}
                </button>
              </div>

              <div className="space-y-2">
                {displayedObservations.map(obs => (
                  <ObservationItem
                    key={obs.id}
                    observation={obs}
                    onLog={() => handleLog(obs)}
                    isLogging={loggingId === obs.id}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  )
}
