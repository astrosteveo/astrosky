import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { ProBadge } from './ProBadge'
import { useSubscriptionContext } from '../context/SubscriptionContext'
import { useNotifications } from '../hooks/useNotifications'
import { useSmartAlerts, calculateObservabilityScore, type ObservabilityScore } from '../hooks/useSmartAlerts'
import type { SkyReport } from '../types'

interface SmartAlertsCardProps {
  report: SkyReport | null
  onUpgradeClick: () => void
}

const CLOUD_COVER_OPTIONS = [
  { value: 10, label: 'Crystal clear (<10%)' },
  { value: 20, label: 'Very clear (<20%)' },
  { value: 30, label: 'Mostly clear (<30%)' },
  { value: 50, label: 'Partly cloudy (<50%)' },
]

const ALERT_TIME_OPTIONS = [
  { value: 'sunset', label: 'At sunset' },
  { value: '1h-before-sunset', label: '1 hour before sunset' },
  { value: 'astronomical-twilight', label: 'At astronomical twilight' },
]

function ScoreDisplay({ score }: { score: ObservabilityScore }) {
  const getScoreColor = (grade: ObservabilityScore['grade']) => {
    switch (grade) {
      case 'Excellent': return 'text-[#4ecdc4]'
      case 'Good': return 'text-[#34d399]'
      case 'Fair': return 'text-[#fbbf24]'
      case 'Poor': return 'text-[#94a3b8]'
    }
  }

  const getScoreBg = (grade: ObservabilityScore['grade']) => {
    switch (grade) {
      case 'Excellent': return 'bg-[#4ecdc4]/20 border-[#4ecdc4]/30'
      case 'Good': return 'bg-[#34d399]/20 border-[#34d399]/30'
      case 'Fair': return 'bg-[#fbbf24]/20 border-[#fbbf24]/30'
      case 'Poor': return 'bg-[#94a3b8]/20 border-[#94a3b8]/30'
    }
  }

  return (
    <motion.div
      className={`p-4 rounded-xl border ${getScoreBg(score.grade)} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-[#94a3b8] uppercase tracking-wide mb-1">Tonight's Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(score.grade)}`}>
              {score.score}
            </span>
            <span className="text-[#94a3b8]">/100</span>
            <span className={`text-sm font-medium ${getScoreColor(score.grade)}`}>
              {score.grade}
            </span>
          </div>
        </div>
        <div className="text-4xl">
          {score.grade === 'Excellent' && '🌟'}
          {score.grade === 'Good' && '✨'}
          {score.grade === 'Fair' && '🌙'}
          {score.grade === 'Poor' && '☁️'}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-[#0f172a]/50">
          <p className="text-xs text-[#94a3b8]">Weather</p>
          <p className="text-sm font-semibold text-[#f5f0e1]">{score.factors.weather}/50</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#0f172a]/50">
          <p className="text-xs text-[#94a3b8]">Moon</p>
          <p className="text-sm font-semibold text-[#f5f0e1]">{score.factors.moonPhase}/30</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#0f172a]/50">
          <p className="text-xs text-[#94a3b8]">Events</p>
          <p className="text-sm font-semibold text-[#f5f0e1]">{score.factors.events}/20</p>
        </div>
      </div>

      {/* Highlights */}
      {score.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {score.highlights.map((highlight, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs rounded-full bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/30"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-[#94a3b8]">{score.recommendation}</p>
    </motion.div>
  )
}

export function SmartAlertsCard({ report, onUpgradeClick }: SmartAlertsCardProps) {
  const { isPro } = useSubscriptionContext()
  const { permission, supported, enableNotifications } = useNotifications()
  const { preferences, updatePreferences, enableSmartAlerts, disableSmartAlerts } = useSmartAlerts()
  const [enabling, setEnabling] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Calculate current observability score
  const score = useMemo(() => {
    if (!report) return null
    return calculateObservabilityScore(
      report.weather,
      report.moon.illumination,
      report.events
    )
  }, [report])

  const handleToggle = async () => {
    if (!isPro) {
      onUpgradeClick()
      return
    }

    if (preferences.enabled) {
      disableSmartAlerts()
    } else {
      setEnabling(true)
      // Ensure notifications are enabled first
      if (permission !== 'granted') {
        await enableNotifications()
      }
      enableSmartAlerts()
      setEnabling(false)
    }
  }

  if (!supported) {
    return null
  }

  return (
    <GlassCard
      title="Smart Clear Sky Alerts"
      icon="🌤️"
      glowColor={isPro ? 'aurora' : 'brass'}
    >
      <div className="space-y-4">
        {/* Current Score Preview */}
        {score && <ScoreDisplay score={score} />}

        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-[#f5f0e1]">Smart Alerts</p>
                {!isPro && <ProBadge />}
              </div>
              <p className="text-xs text-[#c4baa6]/60">
                Get notified when conditions are perfect
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={enabling}
            className={`
              relative w-14 h-8 rounded-full transition-all
              ${preferences.enabled && isPro
                ? 'bg-[#4ecdc4]'
                : 'bg-[#1e293b]'
              }
              ${!isPro ? 'opacity-75' : ''}
            `}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
              animate={{ left: preferences.enabled && isPro ? '1.75rem' : '0.25rem' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Settings (Pro only, when enabled) */}
        <AnimatePresence>
          {preferences.enabled && isPro && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-[#c9a227]/10"
            >
              {/* Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm font-medium text-[#c9a227]">
                  Alert Settings
                </span>
                <motion.svg
                  className="w-4 h-4 text-[#c9a227]"
                  animate={{ rotate: showSettings ? 180 : 0 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Cloud Cover Threshold */}
                    <div>
                      <label className="block text-sm text-[#f5f0e1] mb-2">
                        Alert when cloud cover is...
                      </label>
                      <select
                        value={preferences.maxCloudCover}
                        onChange={(e) => updatePreferences({ maxCloudCover: parseInt(e.target.value) })}
                        className="w-full bg-[#1e293b] border border-[#c9a227]/20 rounded-lg px-3 py-2 text-sm text-[#f5f0e1] focus:border-[#4ecdc4] focus:ring-1 focus:ring-[#4ecdc4] focus:outline-none"
                      >
                        {CLOUD_COVER_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Alert Time */}
                    <div>
                      <label className="block text-sm text-[#f5f0e1] mb-2">
                        Send alert...
                      </label>
                      <select
                        value={preferences.alertTime}
                        onChange={(e) => updatePreferences({ alertTime: e.target.value as 'sunset' | '1h-before-sunset' | 'astronomical-twilight' })}
                        className="w-full bg-[#1e293b] border border-[#c9a227]/20 rounded-lg px-3 py-2 text-sm text-[#f5f0e1] focus:border-[#4ecdc4] focus:ring-1 focus:ring-[#4ecdc4] focus:outline-none"
                      >
                        {ALERT_TIME_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Include in alerts */}
                    <div>
                      <p className="text-sm text-[#f5f0e1] mb-2">Include in alerts:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.includeEvents}
                            onChange={(e) => updatePreferences({ includeEvents: e.target.checked })}
                            className="w-4 h-4 rounded bg-[#1e293b] border-[#c9a227]/30 text-[#4ecdc4] focus:ring-[#4ecdc4] focus:ring-offset-0"
                          />
                          <span className="text-sm text-[#c4baa6]">Celestial events</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.includePlanets}
                            onChange={(e) => updatePreferences({ includePlanets: e.target.checked })}
                            className="w-4 h-4 rounded bg-[#1e293b] border-[#c9a227]/30 text-[#4ecdc4] focus:ring-[#4ecdc4] focus:ring-offset-0"
                          />
                          <span className="text-sm text-[#c4baa6]">Visible planets</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.includeDeepSky}
                            onChange={(e) => updatePreferences({ includeDeepSky: e.target.checked })}
                            className="w-4 h-4 rounded bg-[#1e293b] border-[#c9a227]/30 text-[#4ecdc4] focus:ring-[#4ecdc4] focus:ring-offset-0"
                          />
                          <span className="text-sm text-[#c4baa6]">Deep sky highlights</span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sample Alert Preview */}
              {score && score.grade !== 'Poor' && (
                <div className="p-3 rounded-lg bg-[#0f172a]/50 border border-[#c9a227]/10">
                  <p className="text-xs text-[#94a3b8] mb-1">Sample alert:</p>
                  <p className="text-sm text-[#f5f0e1]">
                    {score.grade === 'Excellent' && '🌟'}
                    {score.grade === 'Good' && '✨'}
                    {score.grade === 'Fair' && '🌙'}
                    {' '}{score.grade} Stargazing Tonight!
                  </p>
                  <p className="text-xs text-[#c4baa6]/80 mt-1">
                    {score.recommendation}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upgrade prompt for non-Pro users */}
        {!isPro && (
          <motion.button
            onClick={onUpgradeClick}
            className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#c9a227]/20 to-[#e8c547]/20 border border-[#c9a227]/30 text-[#c9a227] hover:from-[#c9a227]/30 hover:to-[#e8c547]/30 transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Upgrade to Pro for Smart Alerts
          </motion.button>
        )}
      </div>
    </GlassCard>
  )
}
