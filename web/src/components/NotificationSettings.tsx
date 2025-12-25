import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { useNotifications } from '../hooks/useNotifications'

const reminderOptions = [
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
]

export function NotificationSettings() {
  const {
    preferences,
    permission,
    supported,
    enabled,
    enableNotifications,
    disableNotifications,
    updatePreferences,
  } = useNotifications()

  const [enabling, setEnabling] = useState(false)

  const handleToggle = async () => {
    if (enabled) {
      disableNotifications()
    } else {
      setEnabling(true)
      await enableNotifications()
      setEnabling(false)
    }
  }

  if (!supported) {
    return (
      <GlassCard title="Notifications" icon="🔔">
        <div className="text-center py-4">
          <p className="text-sm text-[#c4baa6]/60">
            Push notifications are not supported in this browser
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Notifications" icon="🔔">
      <div className="space-y-4">
        {/* Main toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#f5f0e1]">Push Notifications</p>
            <p className="text-xs text-[#c4baa6]/60">
              Get alerts for celestial events
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={enabling}
            className={`
              relative w-14 h-8 rounded-full transition-all
              ${enabled
                ? 'bg-[#4ecdc4]'
                : 'bg-[#1e293b]'
              }
            `}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
              animate={{ left: enabled ? '1.75rem' : '0.25rem' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Permission denied message */}
        {permission === 'denied' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20"
          >
            <p className="text-xs text-[#ef4444]">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </motion.div>
        )}

        {/* Notification types */}
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t border-[#c9a227]/10"
            >
              {/* ISS Passes */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛰️</span>
                  <div>
                    <p className="text-sm text-[#f5f0e1]">ISS Passes</p>
                    <p className="text-xs text-[#c4baa6]/60">Alert before visible passes</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.issPass}
                  onChange={(e) => updatePreferences({ issPass: e.target.checked })}
                  className="w-5 h-5 rounded bg-[#1e293b] border-[#c9a227]/30 text-[#4ecdc4] focus:ring-[#4ecdc4] focus:ring-offset-0"
                />
              </label>

              {/* Meteor Showers */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-xl">☄️</span>
                  <div>
                    <p className="text-sm text-[#f5f0e1]">Meteor Showers</p>
                    <p className="text-xs text-[#c4baa6]/60">Alert on peak nights</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.meteorPeak}
                  onChange={(e) => updatePreferences({ meteorPeak: e.target.checked })}
                  className="w-5 h-5 rounded bg-[#1e293b] border-[#c9a227]/30 text-[#4ecdc4] focus:ring-[#4ecdc4] focus:ring-offset-0"
                />
              </label>

              {/* Celestial Events */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✨</span>
                  <div>
                    <p className="text-sm text-[#f5f0e1]">Celestial Events</p>
                    <p className="text-xs text-[#c4baa6]/60">Eclipses, conjunctions, etc.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.celestialEvent}
                  onChange={(e) => updatePreferences({ celestialEvent: e.target.checked })}
                  className="w-5 h-5 rounded bg-[#1e293b] border-[#c9a227]/30 text-[#4ecdc4] focus:ring-[#4ecdc4] focus:ring-offset-0"
                />
              </label>

              {/* Reminder timing */}
              <div className="pt-3 border-t border-[#c9a227]/10">
                <label className="block">
                  <p className="text-sm text-[#f5f0e1] mb-2">Reminder Time</p>
                  <select
                    value={preferences.reminderMinutes}
                    onChange={(e) => updatePreferences({ reminderMinutes: parseInt(e.target.value) })}
                    className="w-full bg-[#1e293b] border border-[#c9a227]/20 rounded-lg px-3 py-2 text-sm text-[#f5f0e1] focus:border-[#4ecdc4] focus:ring-1 focus:ring-[#4ecdc4] focus:outline-none"
                  >
                    {reminderOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Test notification button */}
              <div className="pt-3">
                <TestNotificationButton />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}

function TestNotificationButton() {
  const { showNotification } = useNotifications()
  const [sent, setSent] = useState(false)

  const handleTest = () => {
    showNotification(
      'AstroSky Test',
      'Notifications are working! You\'ll be notified about celestial events.',
      { tag: 'test' }
    )
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <button
      onClick={handleTest}
      className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-[#c9a227]/10 text-[#c9a227] border border-[#c9a227]/20 hover:bg-[#c9a227]/20 transition-all"
    >
      {sent ? '✓ Notification Sent!' : 'Send Test Notification'}
    </button>
  )
}
