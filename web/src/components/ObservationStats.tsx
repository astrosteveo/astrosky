import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { useObservationsContext } from '../context/ObservationsContext'
import type { Observation } from '../types/observations'

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

const equipmentIcons: Record<string, string> = {
  'naked-eye': '👁️',
  'binoculars': '🔭',
  'telescope': '🔬',
}

function ObservationItem({ observation, onRemove }: { observation: Observation; onRemove: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0"
    >
      <span className="text-lg" title={observation.equipment}>
        {equipmentIcons[observation.equipment] || '👁️'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-medium text-slate-200 truncate">
            {observation.object.name}
          </p>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {formatRelativeTime(observation.timestamp)}
          </span>
        </div>
        {observation.object.details && (
          <p className="text-xs text-slate-500 truncate">{observation.object.details}</p>
        )}
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{observation.location.placeName || `${observation.location.lat.toFixed(2)}°, ${observation.location.lon.toFixed(2)}°`}</span>
        </div>
        {observation.notes && (
          <p className="text-xs text-slate-400 mt-1 italic">"{observation.notes}"</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="text-slate-600 hover:text-red-400 transition-colors p-1"
        title="Remove observation"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}

export function ObservationStats() {
  const { observations, removeObservation, getStats } = useObservationsContext()
  const [showHistory, setShowHistory] = useState(false)
  const stats = getStats()

  // If no observations yet, show a welcome prompt
  if (observations.length === 0) {
    return (
      <GlassCard glowColor="purple">
        <div className="text-center py-4">
          <div className="text-4xl mb-3">🔭</div>
          <h3 className="font-display text-lg font-semibold text-slate-50 mb-2">
            Start Your Observation Log
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Tap "I saw this!" on any celestial object to start tracking your observations.
            Your progress is saved locally and will persist across sessions.
          </p>
        </div>
      </GlassCard>
    )
  }

  const messierProgress = (stats.messierCount / 110) * 100

  return (
    <GlassCard glowColor="purple">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-slate-50">
          My Observations
        </h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-slate-50">{stats.totalObservations}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-slate-50">{stats.uniqueObjects}</p>
          <p className="text-xs text-slate-400">Unique Objects</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-slate-50">{stats.planetsObserved.length}/7</p>
          <p className="text-xs text-slate-400">Planets</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-slate-50">{stats.messierCount}/110</p>
          <p className="text-xs text-slate-400">Messier</p>
        </div>
      </div>

      {/* Messier Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Messier Marathon Progress</span>
          <span className="text-cyan-400 font-medium">{stats.messierCount}/110</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${messierProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Observation History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Observations</h3>
              <div className="max-h-64 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {observations.slice(0, 20).map(obs => (
                    <ObservationItem
                      key={obs.id}
                      observation={obs}
                      onRemove={() => removeObservation(obs.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
              {observations.length > 20 && (
                <p className="text-xs text-slate-500 text-center mt-2">
                  Showing 20 of {observations.length} observations
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
