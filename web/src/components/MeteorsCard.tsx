import type { ShowerInfo } from '../types'
import { motion } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'

interface MeteorsCardProps {
  meteors: ShowerInfo[]
}

export function MeteorsCard({ meteors }: MeteorsCardProps) {
  if (meteors.length === 0) {
    return (
      <GlassCard title="Meteor Showers" icon="☄️" glowColor="mars">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#c9a227]/10 flex items-center justify-center">
            <span className="text-2xl opacity-50">☄️</span>
          </div>
          <p className="text-[#c4baa6]">No active meteor showers</p>
          <p className="text-[#c4baa6]/60 text-sm mt-1">Check the calendar for upcoming showers</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Meteor Showers" icon="☄️" glowColor="mars">
      <div className="space-y-4">
        {meteors.map((shower, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {index > 0 && <div className="h-px bg-[#c9a227]/10 mb-4" />}

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center relative"
                  style={{
                    background: shower.is_peak
                      ? 'linear-gradient(135deg, rgba(226,88,34,0.2) 0%, rgba(226,88,34,0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(201,162,39,0.1) 0%, rgba(201,162,39,0.03) 100%)',
                    border: shower.is_peak
                      ? '1px solid rgba(226,88,34,0.4)'
                      : '1px solid rgba(201,162,39,0.2)',
                  }}
                >
                  <span className="text-lg">☄️</span>
                  {shower.is_peak && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        border: '1px solid rgba(226,88,34,0.4)',
                      }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-[#f5f0e1]">
                    {shower.name}
                  </p>
                  <p className="text-xs text-[#c4baa6]/60">
                    from {shower.radiant_constellation}
                  </p>
                </div>
              </div>
              {shower.is_peak && (
                <motion.span
                  className="font-mono text-xs px-2 py-1 rounded uppercase tracking-wider"
                  style={{
                    color: '#e25822',
                    background: 'rgba(226,88,34,0.15)',
                    border: '1px solid rgba(226,88,34,0.3)',
                  }}
                  animate={{
                    boxShadow: ['0 0 0 rgba(226,88,34,0)', '0 0 15px rgba(226,88,34,0.3)', '0 0 0 rgba(226,88,34,0)'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  Peak Tonight
                </motion.span>
              )}
            </div>

            {/* Shower details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgba(201,162,39,0.03)] rounded-lg p-3">
                <span className="data-label block mb-1">ZHR</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl font-bold text-[#e25822]">
                    {shower.zhr}
                  </span>
                  <span className="text-[#c4baa6]/60 text-xs">meteors/hr</span>
                </div>
              </div>
              <div className="bg-[rgba(201,162,39,0.03)] rounded-lg p-3">
                <span className="data-label block mb-1">Radiant</span>
                <p className="font-mono text-[#f5f0e1] font-medium">
                  {shower.radiant_constellation}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <CardDivider />
      <p className="text-xs text-[#c4baa6]/60 flex items-center gap-2">
        <span className="text-[#e25822]">★</span>
        ZHR = Zenithal Hourly Rate under ideal conditions
      </p>
    </GlassCard>
  )
}
