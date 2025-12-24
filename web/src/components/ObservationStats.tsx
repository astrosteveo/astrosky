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

type FilterType = 'all' | 'moon' | 'planet' | 'deep-sky'

const filterLabels: Record<FilterType, string> = {
  'all': 'All',
  'moon': 'Moon',
  'planet': 'Planets',
  'deep-sky': 'Deep Sky',
}

function exportObservations(observations: Observation[], format: 'json' | 'csv') {
  let content: string
  let filename: string
  let mimeType: string

  if (format === 'json') {
    content = JSON.stringify(observations, null, 2)
    filename = `astrosky-observations-${new Date().toISOString().split('T')[0]}.json`
    mimeType = 'application/json'
  } else {
    // CSV format
    const headers = ['Date', 'Time', 'Object', 'Type', 'Equipment', 'Location', 'Notes']
    const rows = observations.map(obs => {
      const date = new Date(obs.timestamp)
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        obs.object.name,
        obs.object.type,
        obs.equipment,
        obs.location.placeName || `${obs.location.lat.toFixed(4)}, ${obs.location.lon.toFixed(4)}`,
        obs.notes || '',
      ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    })
    content = [headers.join(','), ...rows].join('\n')
    filename = `astrosky-observations-${new Date().toISOString().split('T')[0]}.csv`
    mimeType = 'text/csv'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ObservationStats() {
  const { observations, removeObservation, getStats, syncing, lastSynced, syncError } = useObservationsContext()
  const [showHistory, setShowHistory] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const stats = getStats()

  const filteredObservations = filter === 'all'
    ? observations
    : observations.filter(obs => obs.object.type === filter)

  // Sync status indicator
  const SyncStatus = () => {
    if (syncing) {
      return (
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Syncing...
        </span>
      )
    }
    if (syncError) {
      return <span className="text-xs text-amber-400">Local only</span>
    }
    if (lastSynced) {
      return <span className="text-xs text-emerald-400">Synced</span>
    }
    return null
  }

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
            Your progress syncs across devices automatically.
          </p>
        </div>
      </GlassCard>
    )
  }

  const messierProgress = (stats.messierCount / 110) * 100

  return (
    <GlassCard glowColor="purple">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-semibold text-slate-50">
            My Observations
          </h2>
          <SyncStatus />
        </div>
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
              {/* Filter tabs and export */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex gap-1">
                  {(Object.keys(filterLabels) as FilterType[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        filter === f
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {filterLabels[f]}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                  <AnimatePresence>
                    {showExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-10"
                      >
                        <button
                          onClick={() => { exportObservations(filteredObservations, 'csv'); setShowExportMenu(false) }}
                          className="block w-full px-4 py-2 text-xs text-left text-slate-300 hover:bg-white/5"
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={() => { exportObservations(filteredObservations, 'json'); setShowExportMenu(false) }}
                          className="block w-full px-4 py-2 text-xs text-left text-slate-300 hover:bg-white/5"
                        >
                          Export as JSON
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {filteredObservations.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No {filter === 'all' ? '' : filterLabels[filter].toLowerCase()} observations yet
                    </p>
                  ) : (
                    filteredObservations.map(obs => (
                      <ObservationItem
                        key={obs.id}
                        observation={obs}
                        onRemove={() => removeObservation(obs.id)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
