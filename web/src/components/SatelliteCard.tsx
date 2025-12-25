import { motion } from 'framer-motion'
import type { SatelliteInfo, SatellitePass } from '../types'
import { GlassCard, CardDivider } from './GlassCard'
import { useSubscriptionContext } from '../context/SubscriptionContext'

interface SatelliteCardProps {
  satellites: SatelliteInfo | null
  onUpgradeClick?: () => void
}

// Satellite type icons and colors
const satelliteConfig: Record<string, { icon: string; color: string; label: string }> = {
  starlink: { icon: '🛜', color: '#00b4d8', label: 'Starlink' },
  station: { icon: '🏠', color: '#fbbf24', label: 'Space Station' },
  telescope: { icon: '🔭', color: '#a78bfa', label: 'Telescope' },
  other: { icon: '🛰️', color: '#4ecdc4', label: 'Satellite' },
}

const brightnessConfig = (brightness: string, magnitude: number) => {
  if (brightness === 'Brilliant!' || magnitude <= -4.0) {
    return { color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', glow: true }
  }
  if (brightness === 'Bright' || magnitude <= -2.5) {
    return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', glow: false }
  }
  if (brightness === 'Moderate' || magnitude <= -1.0) {
    return { color: '#4ecdc4', bg: 'rgba(78,205,196,0.1)', glow: false }
  }
  return { color: '#c4baa6', bg: 'rgba(196,186,166,0.1)', glow: false }
}

function PassItem({ pass, index }: { pass: SatellitePass; index: number }) {
  const config = satelliteConfig[pass.satellite_type] || satelliteConfig.other
  const brightness = brightnessConfig(pass.brightness, pass.magnitude)

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative"
    >
      {index > 0 && <div className="h-px bg-[#c9a227]/10 mb-3" />}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${config.color}20 0%, ${config.color}08 100%)`,
              border: `1px solid ${config.color}40`,
            }}
          >
            <span className="text-base">{config.icon}</span>
            {brightness.glow && (
              <div
                className="absolute inset-0 rounded-lg animate-pulse"
                style={{ boxShadow: `0 0 12px ${brightness.color}40` }}
              />
            )}
          </div>
          <div>
            <p className="font-medium text-[#f5f0e1] text-sm leading-tight">
              {pass.satellite_name.replace('Starlink-', 'SL-')}
            </p>
            <p className="text-xs text-[#c4baa6]/60">{config.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold" style={{ color: config.color }}>
            {formatTime(pass.start_time)}
          </p>
          <p className="text-xs text-[#c4baa6]/60">{formatDate(pass.start_time)}</p>
        </div>
      </div>

      {/* Pass details */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="bg-[rgba(201,162,39,0.03)] rounded px-2 py-1.5">
          <span className="text-[#c4baa6]/60 block">Duration</span>
          <span className="font-mono text-[#f5f0e1]">{pass.duration_minutes}m</span>
        </div>
        <div className="bg-[rgba(201,162,39,0.03)] rounded px-2 py-1.5">
          <span className="text-[#c4baa6]/60 block">Max Alt</span>
          <span className="font-mono text-[#f5f0e1]">{pass.max_altitude}°</span>
        </div>
        <div className="bg-[rgba(201,162,39,0.03)] rounded px-2 py-1.5">
          <span className="text-[#c4baa6]/60 block">Mag</span>
          <span className="font-mono" style={{ color: brightness.color }}>
            {pass.magnitude > 0 ? '+' : ''}
            {pass.magnitude}
          </span>
        </div>
        <div className="bg-[rgba(201,162,39,0.03)] rounded px-2 py-1.5">
          <span className="text-[#c4baa6]/60 block">Path</span>
          <span className="font-mono text-[#f5f0e1]">
            {pass.start_direction}→{pass.end_direction}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function SatelliteCard({ satellites, onUpgradeClick }: SatelliteCardProps) {
  const { isPro } = useSubscriptionContext()

  if (!satellites || satellites.total_passes === 0) {
    return (
      <GlassCard title="Satellites" icon="📡" glowColor="brass">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#c9a227]/10 flex items-center justify-center">
            <span className="text-2xl opacity-50">📡</span>
          </div>
          <p className="text-[#c4baa6]">No bright satellite passes predicted</p>
          <p className="text-[#c4baa6]/60 text-sm mt-1">Starlink, Hubble, and more</p>
        </div>
      </GlassCard>
    )
  }

  // Show next bright pass prominently for free users, full list for Pro
  const visiblePasses = isPro ? satellites.passes : satellites.passes.slice(0, 2)
  const hasMore = satellites.passes.length > visiblePasses.length

  return (
    <GlassCard
      title="Satellites"
      icon="📡"
      glowColor={satellites.next_bright_pass ? 'aurora' : 'brass'}
    >
      {/* Summary stats */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[#00b4d8]">🛜</span>
          <span className="text-[#c4baa6]">
            {satellites.starlink_passes} Starlink
          </span>
        </div>
        {satellites.station_passes > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[#fbbf24]">🏠</span>
            <span className="text-[#c4baa6]">
              {satellites.station_passes} Station
            </span>
          </div>
        )}
        <div className="flex-1" />
        <span className="text-[#c4baa6]/60">
          {satellites.total_passes} total
        </span>
      </div>

      {/* Next bright pass highlight */}
      {satellites.next_bright_pass && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 rounded-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(251,191,36,0.05) 100%)',
            border: '1px solid rgba(255,107,107,0.3)',
          }}
        >
          <div className="absolute top-0 right-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#ff6b6b]/20 text-[#ff6b6b] rounded-bl">
            Bright Pass
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-2xl">
              {satelliteConfig[satellites.next_bright_pass.satellite_type]?.icon || '🛰️'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#f5f0e1]">
                {satellites.next_bright_pass.satellite_name}
              </p>
              <p className="text-sm text-[#c4baa6]">
                Magnitude {satellites.next_bright_pass.magnitude} • Very visible
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold text-[#ff6b6b]">
                {new Date(satellites.next_bright_pass.start_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pass list */}
      <div className="space-y-3">
        {visiblePasses.map((pass, index) => (
          <PassItem key={`${pass.norad_id}-${pass.start_time}`} pass={pass} index={index} />
        ))}
      </div>

      {/* Pro upsell */}
      {hasMore && !isPro && (
        <>
          <CardDivider />
          <button
            onClick={onUpgradeClick}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0.05) 100%)',
              border: '1px solid rgba(201,162,39,0.3)',
              color: '#c9a227',
            }}
          >
            Unlock {satellites.passes.length - visiblePasses.length} more passes with Pro
          </button>
        </>
      )}

      <CardDivider />
      <p className="text-xs text-[#c4baa6]/60 flex items-center gap-2">
        <span className="text-[#00b4d8]">◉</span>
        Starlink satellites orbit at 550km altitude
      </p>
    </GlassCard>
  )
}
