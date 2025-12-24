import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ObservableObject, EquipmentType } from '../types/observations'
import { LogObservationModal } from './LogObservationModal'

interface ObservationButtonProps {
  object: ObservableObject
  hasObserved: boolean
  observationCount: number
  onLog: (equipment: EquipmentType, notes?: string) => void
  placeName?: string
  compact?: boolean
}

export function ObservationButton({
  object,
  hasObserved,
  observationCount,
  onLog,
  placeName,
  compact = false,
}: ObservationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (compact) {
    // Compact inline button for lists
    return (
      <>
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            setIsModalOpen(true)
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all
            ${hasObserved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30'
            }
          `}
          title={hasObserved ? `Observed ${observationCount} time${observationCount !== 1 ? 's' : ''}` : 'Log observation'}
        >
          {hasObserved ? (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <span>{observationCount}</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Log</span>
            </>
          )}
        </motion.button>

        <LogObservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLog={onLog}
          object={object}
          placeName={placeName}
        />
      </>
    )
  }

  // Full button style
  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-medium transition-all
          ${hasObserved
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30'
          }
        `}
      >
        {hasObserved ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <span>Observed {observationCount} time{observationCount !== 1 ? 's' : ''}</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>I saw this!</span>
          </>
        )}
      </motion.button>

      <LogObservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLog={onLog}
        object={object}
        placeName={placeName}
      />
    </>
  )
}
