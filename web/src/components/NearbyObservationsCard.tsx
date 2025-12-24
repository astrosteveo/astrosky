import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { fetchNearbyObservations, type NearbyStats } from '../lib/api'

interface NearbyObservationsCardProps {
  location?: { lat: number; lon: number }
}

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
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const typeIcons: Record<string, string> = {
  'moon': '🌙',
  'planet': '🪐',
  'deep-sky': '✨',
  'dso': '✨',
}

const equipmentLabels: Record<string, string> = {
  'naked-eye': 'Naked Eye',
  'binoculars': 'Binoculars',
  'telescope': 'Telescope',
}

function NearbyItem({ stat }: { stat: NearbyStats }) {
  const [expanded, setExpanded] = useState(false)
  const icon = typeIcons[stat.object_type] || '⭐'

  return (
    <motion.div
      layout
      className="py-3 border-b border-white/5 last:border-0"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 text-left"
      >
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-medium text-slate-200 truncate">
              {stat.object_name}
            </p>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {formatRelativeTime(stat.latest_observation)}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {stat.observation_count} observation{stat.observation_count !== 1 ? 's' : ''} nearby
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-8 text-xs text-slate-400 space-y-1">
              {Object.entries(stat.equipment_breakdown).map(([eq, count]) => (
                <div key={eq} className="flex items-center gap-2">
                  <span className="w-20">{equipmentLabels[eq] || eq}:</span>
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${(count / stat.observation_count) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function NearbyObservationsCard({ location }: NearbyObservationsCardProps) {
  const [stats, setStats] = useState<NearbyStats[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!location) return

    const loadNearby = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchNearbyObservations(location.lat, location.lon, 100, 30)
        // Sort by observation count descending
        data.sort((a, b) => b.observation_count - a.observation_count)
        setStats(data)
      } catch {
        setError('Could not load nearby observations')
      } finally {
        setLoading(false)
      }
    }

    loadNearby()
  }, [location?.lat, location?.lon])

  if (!location) {
    return null
  }

  if (loading) {
    return (
      <GlassCard glowColor="aurora">
        <div className="flex items-center justify-center py-8">
          <svg className="w-6 h-6 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </GlassCard>
    )
  }

  if (error) {
    return null // Silently fail - not critical
  }

  if (stats.length === 0) {
    return (
      <GlassCard glowColor="aurora">
        <div className="text-center py-4">
          <div className="text-4xl mb-3">👀</div>
          <h3 className="font-display text-lg font-semibold text-slate-50 mb-2">
            Be the First!
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            No observations logged in your area yet. Start observing to put your region on the map!
          </p>
        </div>
      </GlassCard>
    )
  }

  const totalObservations = stats.reduce((sum, s) => sum + s.observation_count, 0)

  return (
    <GlassCard glowColor="aurora">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-slate-50">
          What Others Are Seeing
        </h2>
        <span className="text-xs text-slate-400">
          within 100km
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-slate-50">{totalObservations}</p>
          <p className="text-xs text-slate-400">Total Sightings</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-slate-50">{stats.length}</p>
          <p className="text-xs text-slate-400">Unique Objects</p>
        </div>
      </div>

      {/* Top observations */}
      <div className="max-h-64 overflow-y-auto">
        {stats.slice(0, 10).map(stat => (
          <NearbyItem key={stat.object_id} stat={stat} />
        ))}
      </div>

      {stats.length > 10 && (
        <p className="text-xs text-slate-500 text-center mt-2">
          Showing top 10 of {stats.length} observed objects
        </p>
      )}

      <p className="text-xs text-slate-500 text-center mt-3">
        Last 30 days • Privacy-first: only aggregated stats shown
      </p>
    </GlassCard>
  )
}
