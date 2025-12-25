import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'
import { useSessionsContext } from '../context/SessionsContext'
import { getTonightDateKey } from '../hooks/useSessions'
import type { ObservingSession, SeeingCondition, TransparencyCondition, EquipmentType } from '../types/observations'

const seeingLabels: Record<SeeingCondition, { label: string; emoji: string }> = {
  poor: { label: 'Poor', emoji: '😕' },
  fair: { label: 'Fair', emoji: '🙂' },
  good: { label: 'Good', emoji: '😊' },
  excellent: { label: 'Excellent', emoji: '🤩' },
}

const transparencyLabels: Record<TransparencyCondition, { label: string; emoji: string }> = {
  poor: { label: 'Hazy', emoji: '🌫️' },
  fair: { label: 'Fair', emoji: '☁️' },
  good: { label: 'Clear', emoji: '🌤️' },
  excellent: { label: 'Crystal', emoji: '✨' },
}

const equipmentLabels: Record<EquipmentType, { label: string; emoji: string }> = {
  'naked-eye': { label: 'Naked Eye', emoji: '👁️' },
  'binoculars': { label: 'Binoculars', emoji: '🔭' },
  'telescope': { label: 'Telescope', emoji: '🔬' },
}

interface SessionNotesCardProps {
  location?: { lat: number; lon: number; placeName?: string }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = getTonightDateKey()
  if (dateStr === today) return 'Tonight'

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Last Night'

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDuration(startTime?: string, endTime?: string): string {
  if (!startTime) return ''
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function SessionEditor({
  session,
  onUpdate,
  onEnd,
  onDelete,
}: {
  session: ObservingSession
  onUpdate: (updates: Partial<Omit<ObservingSession, 'id'>>) => void
  onEnd: () => void
  onDelete: () => void
}) {
  const [notes, setNotes] = useState(session.notes || '')
  const [highlights, setHighlights] = useState(session.highlights || '')
  const [siteName, setSiteName] = useState(session.location.siteName || '')
  const [showDelete, setShowDelete] = useState(false)

  const isActive = !session.endTime

  // Debounce notes updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== session.notes) {
        onUpdate({ notes: notes || undefined })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [notes, session.notes, onUpdate])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (highlights !== session.highlights) {
        onUpdate({ highlights: highlights || undefined })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [highlights, session.highlights, onUpdate])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (siteName !== session.location.siteName) {
        onUpdate({ location: { ...session.location, siteName: siteName || undefined } })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [siteName, session.location, onUpdate])

  return (
    <div className="space-y-4">
      {/* Session header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isActive ? '🌙' : '📝'}</span>
          <div>
            <p className="font-medium text-[#f5f0e1]">{formatDate(session.date)}</p>
            {session.startTime && (
              <p className="text-xs text-[#c4baa6]/70">
                Started {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {session.endTime ? ` • ${formatDuration(session.startTime, session.endTime)}` : ` • ${formatDuration(session.startTime)} so far`}
              </p>
            )}
          </div>
        </div>
        {isActive && (
          <button
            onClick={onEnd}
            className="px-3 py-1.5 text-xs font-medium bg-[#c9a227]/20 text-[#c9a227] rounded-lg hover:bg-[#c9a227]/30 transition-colors"
          >
            End Session
          </button>
        )}
      </div>

      {/* Site name */}
      <div>
        <label className="block text-xs text-[#c4baa6] mb-1">Location Name</label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder={session.location.placeName || 'e.g., Backyard, Dark Site #1'}
          className="w-full px-3 py-2 bg-[rgba(15,23,42,0.4)] border border-[#c9a227]/20 rounded-lg text-[#f5f0e1] text-sm placeholder-[#c4baa6]/40 focus:outline-none focus:border-[#c9a227]/50"
        />
      </div>

      {/* Equipment used */}
      <div>
        <label className="block text-xs text-[#c4baa6] mb-2">Equipment Used</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(equipmentLabels) as EquipmentType[]).map((eq) => {
            const isSelected = session.equipment?.includes(eq)
            return (
              <button
                key={eq}
                onClick={() => {
                  const current = session.equipment || []
                  const updated = isSelected
                    ? current.filter((e) => e !== eq)
                    : [...current, eq]
                  onUpdate({ equipment: updated })
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#4ecdc4]/20 text-[#4ecdc4] border border-[#4ecdc4]/30'
                    : 'bg-[rgba(15,23,42,0.4)] text-[#c4baa6] border border-transparent hover:border-[#c4baa6]/20'
                }`}
              >
                <span>{equipmentLabels[eq].emoji}</span>
                <span>{equipmentLabels[eq].label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <CardDivider />

      {/* Conditions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Seeing */}
        <div>
          <label className="block text-xs text-[#c4baa6] mb-2">Seeing</label>
          <div className="grid grid-cols-2 gap-1">
            {(Object.keys(seeingLabels) as SeeingCondition[]).map((cond) => {
              const isSelected = session.conditions?.seeing === cond
              return (
                <button
                  key={cond}
                  onClick={() => onUpdate({ conditions: { ...session.conditions, seeing: cond } })}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30'
                      : 'bg-[rgba(15,23,42,0.4)] text-[#c4baa6] hover:bg-[rgba(15,23,42,0.6)]'
                  }`}
                >
                  <span>{seeingLabels[cond].emoji}</span>
                  <span>{seeingLabels[cond].label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Transparency */}
        <div>
          <label className="block text-xs text-[#c4baa6] mb-2">Transparency</label>
          <div className="grid grid-cols-2 gap-1">
            {(Object.keys(transparencyLabels) as TransparencyCondition[]).map((cond) => {
              const isSelected = session.conditions?.transparency === cond
              return (
                <button
                  key={cond}
                  onClick={() => onUpdate({ conditions: { ...session.conditions, transparency: cond } })}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#4ecdc4]/20 text-[#4ecdc4] border border-[#4ecdc4]/30'
                      : 'bg-[rgba(15,23,42,0.4)] text-[#c4baa6] hover:bg-[rgba(15,23,42,0.6)]'
                  }`}
                >
                  <span>{transparencyLabels[cond].emoji}</span>
                  <span>{transparencyLabels[cond].label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bortle Class */}
      <div>
        <label className="block text-xs text-[#c4baa6] mb-2">
          Bortle Class {session.conditions?.bortleClass && `(${session.conditions.bortleClass})`}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bortle) => {
            const isSelected = session.conditions?.bortleClass === bortle
            const color = bortle <= 3 ? '#34d399' : bortle <= 5 ? '#fbbf24' : bortle <= 7 ? '#f97316' : '#ef4444'
            return (
              <button
                key={bortle}
                onClick={() => onUpdate({ conditions: { ...session.conditions, bortleClass: bortle } })}
                className={`flex-1 py-1.5 rounded text-xs font-mono transition-colors ${
                  isSelected
                    ? 'border-2'
                    : 'bg-[rgba(15,23,42,0.4)] text-[#c4baa6] hover:bg-[rgba(15,23,42,0.6)]'
                }`}
                style={isSelected ? { backgroundColor: `${color}20`, borderColor: `${color}60`, color } : {}}
                title={`Bortle Class ${bortle}`}
              >
                {bortle}
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-[#c4baa6]/50 mt-1">1 = Pristine dark sky • 9 = Inner city</p>
      </div>

      <CardDivider />

      {/* Notes */}
      <div>
        <label className="block text-xs text-[#c4baa6] mb-1">Session Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="General notes about tonight's session..."
          rows={3}
          className="w-full px-3 py-2 bg-[rgba(15,23,42,0.4)] border border-[#c9a227]/20 rounded-lg text-[#f5f0e1] text-sm placeholder-[#c4baa6]/40 focus:outline-none focus:border-[#c9a227]/50 resize-none"
        />
      </div>

      {/* Highlights */}
      <div>
        <label className="block text-xs text-[#c4baa6] mb-1">✨ Highlights of the Night</label>
        <textarea
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          placeholder="Best sights, memorable moments..."
          rows={2}
          className="w-full px-3 py-2 bg-[rgba(15,23,42,0.4)] border border-[#c9a227]/20 rounded-lg text-[#f5f0e1] text-sm placeholder-[#c4baa6]/40 focus:outline-none focus:border-[#c9a227]/50 resize-none"
        />
      </div>

      {/* Delete session */}
      <div className="pt-2">
        {showDelete ? (
          <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <span className="text-xs text-red-400">Delete this session?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="px-2 py-1 text-xs text-[#c4baa6] hover:text-[#f5f0e1]"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="text-xs text-[#c4baa6]/50 hover:text-red-400 transition-colors"
          >
            Delete session
          </button>
        )}
      </div>
    </div>
  )
}

function SessionSummary({ session, onClick }: { session: ObservingSession; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left p-3 bg-[rgba(15,23,42,0.3)] rounded-lg hover:bg-[rgba(15,23,42,0.5)] transition-colors"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-[#f5f0e1] text-sm">{formatDate(session.date)}</span>
        {session.startTime && (
          <span className="text-xs text-[#c4baa6]/60">
            {formatDuration(session.startTime, session.endTime)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-[#c4baa6]">
        {session.location.siteName && (
          <span className="flex items-center gap-1">
            📍 {session.location.siteName}
          </span>
        )}
        {session.conditions?.seeing && (
          <span>{seeingLabels[session.conditions.seeing].emoji}</span>
        )}
        {session.conditions?.bortleClass && (
          <span className="font-mono">B{session.conditions.bortleClass}</span>
        )}
        {session.equipment && session.equipment.length > 0 && (
          <span>{session.equipment.map(e => equipmentLabels[e].emoji).join('')}</span>
        )}
      </div>
      {session.highlights && (
        <p className="text-xs text-[#c9a227] mt-1 truncate">✨ {session.highlights}</p>
      )}
    </motion.button>
  )
}

export function SessionNotesCard({ location }: SessionNotesCardProps) {
  const { sessions, createSession, updateSession, deleteSession, endSession, getTonightSession, getRecentSessions } = useSessionsContext()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const tonightSession = getTonightSession()
  const recentSessions = getRecentSessions(5).filter(s => s.id !== tonightSession?.id)

  // Auto-select tonight's session if it exists
  useEffect(() => {
    if (tonightSession && !selectedSessionId) {
      setSelectedSessionId(tonightSession.id)
    }
  }, [tonightSession, selectedSessionId])

  const selectedSession = sessions.find(s => s.id === selectedSessionId)

  const handleStartSession = () => {
    if (!location) return
    const newSession = createSession(location, [], undefined)
    setSelectedSessionId(newSession.id)
  }

  const handleUpdate = (updates: Partial<Omit<ObservingSession, 'id'>>) => {
    if (selectedSessionId) {
      updateSession(selectedSessionId, updates)
    }
  }

  const handleEnd = () => {
    if (selectedSessionId) {
      endSession(selectedSessionId)
    }
  }

  const handleDelete = () => {
    if (selectedSessionId) {
      deleteSession(selectedSessionId)
      setSelectedSessionId(null)
    }
  }

  return (
    <GlassCard title="Session Notes" icon="📓" glowColor="brass">
      {/* No active session - prompt to start */}
      {!selectedSession && !tonightSession && (
        <div className="text-center py-4">
          <p className="text-[#c4baa6] text-sm mb-4">
            Document your observing session with conditions, notes, and highlights.
          </p>
          <button
            onClick={handleStartSession}
            disabled={!location}
            className="px-4 py-2 bg-[#c9a227]/20 text-[#c9a227] rounded-lg font-medium text-sm hover:bg-[#c9a227]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🌙 Start Tonight's Session
          </button>
          {!location && (
            <p className="text-xs text-[#c4baa6]/50 mt-2">Waiting for location...</p>
          )}
        </div>
      )}

      {/* Active session editor */}
      {selectedSession && (
        <SessionEditor
          session={selectedSession}
          onUpdate={handleUpdate}
          onEnd={handleEnd}
          onDelete={handleDelete}
        />
      )}

      {/* Session history */}
      {recentSessions.length > 0 && (
        <>
          <CardDivider />
          <div className="pt-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full text-sm text-[#c4baa6] hover:text-[#f5f0e1] transition-colors"
            >
              <span>Recent Sessions ({recentSessions.length})</span>
              <motion.span
                animate={{ rotate: showHistory ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-3">
                    {recentSessions.map((session) => (
                      <SessionSummary
                        key={session.id}
                        session={session}
                        onClick={() => setSelectedSessionId(session.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </GlassCard>
  )
}
