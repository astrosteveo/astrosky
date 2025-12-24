import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ObservableObject, EquipmentType } from '../types/observations'

interface LogObservationModalProps {
  isOpen: boolean
  onClose: () => void
  onLog: (equipment: EquipmentType, notes?: string) => void
  object: ObservableObject
  placeName?: string
}

const equipmentOptions: { type: EquipmentType; icon: string; label: string }[] = [
  { type: 'naked-eye', icon: '👁️', label: 'Naked Eye' },
  { type: 'binoculars', icon: '🔭', label: 'Binoculars' },
  { type: 'telescope', icon: '🔬', label: 'Telescope' },
]

export function LogObservationModal({
  isOpen,
  onClose,
  onLog,
  object,
  placeName,
}: LogObservationModalProps) {
  const [equipment, setEquipment] = useState<EquipmentType>('naked-eye')
  const [notes, setNotes] = useState('')
  const [isLogging, setIsLogging] = useState(false)

  const handleLog = () => {
    setIsLogging(true)
    onLog(equipment, notes.trim() || undefined)

    // Brief animation delay before closing
    setTimeout(() => {
      setIsLogging(false)
      setNotes('')
      setEquipment('naked-eye')
      onClose()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mx-4 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl font-semibold text-slate-50">
                    Log Observation
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {object.name}
                    {object.details && ` • ${object.details}`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Location display */}
              {placeName && (
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{placeName}</span>
                </div>
              )}

              {/* Equipment selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  How did you observe it?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {equipmentOptions.map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => setEquipment(opt.type)}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                        ${equipment === opt.type
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }
                      `}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Saw the rings clearly! Great seeing conditions..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleLog}
                  disabled={isLogging}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex-1 px-4 py-3 rounded-xl font-medium transition-all
                    ${isLogging
                      ? 'bg-emerald-500 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900'
                    }
                  `}
                >
                  {isLogging ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Logged!
                    </span>
                  ) : (
                    'Log Observation'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
