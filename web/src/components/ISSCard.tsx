import type { ISSPass } from '../types'
import { motion } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'

interface ISSCardProps {
  passes: ISSPass[]
}

export function ISSCard({ passes }: ISSCardProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const brightnessConfig = (brightness: string) => {
    if (brightness === 'very bright') return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: 'Very Bright' }
    if (brightness === 'bright') return { color: '#facc15', bg: 'rgba(250,204,21,0.1)', label: 'Bright' }
    return { color: '#c4baa6', bg: 'rgba(196,186,166,0.1)', label: brightness }
  }

  if (passes.length === 0) {
    return (
      <GlassCard title="ISS Passes" icon="🛰️" glowColor="aurora">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#c9a227]/10 flex items-center justify-center">
            <span className="text-2xl opacity-50">🛰️</span>
          </div>
          <p className="text-[#c4baa6]">No ISS passes tonight</p>
          <p className="text-[#c4baa6]/60 text-sm mt-1">Check back tomorrow</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="ISS Passes" icon="🛰️" glowColor="aurora">
      <div className="space-y-4">
        {passes.map((pass, index) => {
          const brightness = brightnessConfig(pass.brightness)

          return (
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
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(78,205,196,0.15) 0%, rgba(78,205,196,0.05) 100%)',
                      border: '1px solid rgba(78,205,196,0.3)',
                    }}
                  >
                    <span className="text-lg">🛰️</span>
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold text-[#4ecdc4]">
                      {formatTime(pass.start_time)}
                    </p>
                    <p className="text-xs text-[#c4baa6]/60">Pass #{index + 1}</p>
                  </div>
                </div>
                <span
                  className="font-mono text-xs px-2 py-1 rounded uppercase tracking-wider"
                  style={{
                    color: brightness.color,
                    background: brightness.bg,
                    border: `1px solid ${brightness.color}30`,
                  }}
                >
                  {brightness.label}
                </span>
              </div>

              {/* Pass details grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-[rgba(201,162,39,0.03)] rounded-lg p-2.5">
                  <span className="data-label block mb-1">Duration</span>
                  <p className="font-mono text-[#f5f0e1] font-medium">
                    {pass.duration_minutes}<span className="text-[#c4baa6]/60 text-sm ml-1">min</span>
                  </p>
                </div>
                <div className="bg-[rgba(201,162,39,0.03)] rounded-lg p-2.5">
                  <span className="data-label block mb-1">Max Alt</span>
                  <p className="font-mono text-[#f5f0e1] font-medium">
                    {pass.max_altitude}<span className="text-[#c4baa6]/60 text-sm ml-1">°</span>
                  </p>
                </div>
                <div className="bg-[rgba(201,162,39,0.03)] rounded-lg p-2.5">
                  <span className="data-label block mb-1">Magnitude</span>
                  <p className="font-mono font-medium" style={{ color: brightness.color }}>
                    {pass.magnitude > 0 ? '+' : ''}{pass.magnitude}
                  </p>
                </div>
                <div className="bg-[rgba(201,162,39,0.03)] rounded-lg p-2.5">
                  <span className="data-label block mb-1">Direction</span>
                  <p className="font-mono text-[#f5f0e1] font-medium text-sm">
                    {pass.start_direction} → {pass.end_direction}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {passes.length > 0 && (
        <>
          <CardDivider />
          <p className="text-xs text-[#c4baa6]/60 flex items-center gap-2">
            <span className="text-[#4ecdc4]">◉</span>
            ISS orbits Earth every 90 minutes at 17,500 mph
          </p>
        </>
      )}
    </GlassCard>
  )
}
