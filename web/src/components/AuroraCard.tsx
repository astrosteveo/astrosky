import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { ProBadge } from './ProBadge'
import { useSubscriptionContext } from '../context/SubscriptionContext'
import type { AuroraForecast } from '../types'

interface AuroraCardProps {
  aurora: AuroraForecast | null
  userLat: number
  onUpgradeClick: () => void
}

function KpMeter({ kp, maxKp }: { kp: number; maxKp: number }) {
  // Kp scale is 0-9, but most interesting activity is 3-9
  const segments = 9
  const activeSegments = Math.min(segments, Math.ceil(kp))

  const getSegmentColor = (index: number) => {
    if (index >= activeSegments) return 'bg-[#1e293b]'
    if (index >= 7) return 'bg-[#ef4444]' // Red - severe storm
    if (index >= 5) return 'bg-[#f97316]' // Orange - storm
    if (index >= 3) return 'bg-[#eab308]' // Yellow - active
    return 'bg-[#4ecdc4]' // Teal - quiet
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#94a3b8]">Kp Index</span>
        <span className="text-xs text-[#94a3b8]">24h max: {maxKp.toFixed(1)}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-6 flex-1 rounded-sm ${getSegmentColor(i)}`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-[#94a3b8]">
        <span>0</span>
        <span>Kp {kp.toFixed(1)}</span>
        <span>9</span>
      </div>
    </div>
  )
}

function VisibilityGauge({ probability, latitude }: { probability: number; latitude: number }) {
  const getColor = () => {
    if (probability >= 70) return 'text-[#4ecdc4]'
    if (probability >= 40) return 'text-[#eab308]'
    if (probability >= 15) return 'text-[#f97316]'
    return 'text-[#94a3b8]'
  }

  const getMessage = () => {
    if (probability >= 70) return 'High chance'
    if (probability >= 40) return 'Possible'
    if (probability >= 15) return 'Unlikely'
    return 'Very unlikely'
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a]/50 border border-[#c9a227]/10">
      <div>
        <p className="text-xs text-[#94a3b8] mb-1">Visibility at your location</p>
        <p className={`text-lg font-bold ${getColor()}`}>
          {probability}% - {getMessage()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-[#94a3b8] mb-1">Visible latitude</p>
        <p className="text-sm font-medium text-[#f5f0e1]">{latitude}° {latitude >= 0 ? 'N' : 'S'}</p>
      </div>
    </div>
  )
}

function ActivityBadge({ level, storm, stormLevel }: { level: string; storm: boolean; stormLevel: string }) {
  const getStyle = () => {
    if (storm) {
      return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30 animate-pulse'
    }
    switch (level) {
      case 'Active':
        return 'bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30'
      case 'Unsettled':
        return 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30'
      default:
        return 'bg-[#4ecdc4]/20 text-[#4ecdc4] border-[#4ecdc4]/30'
    }
  }

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStyle()}`}>
      {storm ? `${stormLevel} Storm` : level}
    </span>
  )
}

function AuroraAnimation({ probability }: { probability: number }) {
  // Only show animation if there's some chance of aurora
  if (probability < 10) return null

  const intensity = Math.min(1, probability / 100)

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
      <motion.div
        className="absolute -top-1/2 left-0 right-0 h-full"
        style={{
          background: `linear-gradient(180deg,
            rgba(78, 205, 196, ${0.1 * intensity}) 0%,
            rgba(74, 222, 128, ${0.15 * intensity}) 30%,
            rgba(168, 85, 247, ${0.1 * intensity}) 60%,
            transparent 100%)`,
        }}
        animate={{
          y: ['0%', '10%', '0%'],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

export function AuroraCard({ aurora, userLat, onUpgradeClick }: AuroraCardProps) {
  const { isPro } = useSubscriptionContext()

  if (!aurora) return null

  const auroraName = userLat >= 0 ? 'Aurora Borealis' : 'Aurora Australis'

  // Determine if this is exciting news
  const isExciting = aurora.visibility_probability >= 30 || aurora.geomagnetic_storm

  return (
    <GlassCard
      title={auroraName}
      icon="🌌"
      glowColor={isExciting ? 'aurora' : 'brass'}
      className="relative overflow-hidden"
    >
      <AuroraAnimation probability={aurora.visibility_probability} />

      <div className="relative z-10 space-y-4">
        {/* Activity Status */}
        <div className="flex items-center justify-between">
          <ActivityBadge
            level={aurora.activity_level}
            storm={aurora.geomagnetic_storm}
            stormLevel={aurora.storm_level}
          />
          {!isPro && <ProBadge />}
        </div>

        {/* Kp Meter */}
        <KpMeter kp={aurora.kp_current} maxKp={aurora.kp_24h_max} />

        {/* Visibility for user's location */}
        <VisibilityGauge
          probability={aurora.visibility_probability}
          latitude={aurora.visible_latitude}
        />

        {/* Summary and advice */}
        <div className="space-y-2">
          <p className="text-sm text-[#c4baa6]">{aurora.summary}</p>
          <p className="text-xs text-[#94a3b8]">{aurora.best_time}</p>
        </div>

        {/* Pro upsell for alerts */}
        {!isPro && aurora.visibility_probability > 0 && (
          <motion.button
            onClick={onUpgradeClick}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#4ecdc4]/20 to-[#a855f7]/20 border border-[#4ecdc4]/30 text-[#4ecdc4] hover:from-[#4ecdc4]/30 hover:to-[#a855f7]/30 transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Get Aurora Alerts with Pro
          </motion.button>
        )}

        {/* Storm alert for Pro users */}
        {isPro && aurora.geomagnetic_storm && (
          <motion.div
            className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-medium text-[#ef4444]">
              Geomagnetic Storm Active!
            </p>
            <p className="text-xs text-[#ef4444]/80 mt-1">
              You'll receive a push notification if visibility increases for your location.
            </p>
          </motion.div>
        )}
      </div>
    </GlassCard>
  )
}
