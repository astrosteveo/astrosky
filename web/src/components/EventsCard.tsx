import type { AstroEvent } from '../types'
import { motion } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'

interface EventsCardProps {
  events: AstroEvent[]
}

const eventTypeConfig: Record<string, { color: string; icon: string }> = {
  eclipse: { color: '#a855f7', icon: '🌑' },
  conjunction: { color: '#fbbf24', icon: '⚹' },
  meteor: { color: '#e25822', icon: '☄️' },
  opposition: { color: '#ef4444', icon: '☍' },
  equinox: { color: '#4ecdc4', icon: '☯' },
  solstice: { color: '#c9a227', icon: '☀️' },
}

export function EventsCard({ events }: EventsCardProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventConfig = (type: string) => {
    const lowerType = type.toLowerCase()
    for (const [key, config] of Object.entries(eventTypeConfig)) {
      if (lowerType.includes(key)) return config
    }
    return { color: '#34d399', icon: '✨' }
  }

  if (events.length === 0) {
    return (
      <GlassCard title="Upcoming Events" icon="✨">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#c9a227]/10 flex items-center justify-center">
            <span className="text-2xl opacity-50">✨</span>
          </div>
          <p className="text-[#c4baa6]">No upcoming events</p>
          <p className="text-[#c4baa6]/60 text-sm mt-1">Check back soon for celestial highlights</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Upcoming Events" icon="✨">
      <div className="space-y-4">
        {events.map((event, index) => {
          const config = getEventConfig(event.type)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {index > 0 && <div className="h-px bg-[#c9a227]/10 mb-4" />}

              <div className="flex items-start gap-4">
                {/* Event icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}05 100%)`,
                    border: `1px solid ${config.color}30`,
                  }}
                >
                  <span className="text-xl">{config.icon}</span>
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#f5f0e1]">
                        {event.title}
                      </h3>
                      <span
                        className="font-mono text-xs uppercase tracking-wider"
                        style={{ color: config.color }}
                      >
                        {event.type}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-sm text-[#c9a227]">
                        {formatDate(event.date)}
                      </p>
                      <p className="font-mono text-xs text-[#c4baa6]/60">
                        {formatTime(event.date)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[#c4baa6] mb-2 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Celestial bodies involved */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-[#c4baa6]/50">Involves:</span>
                    {event.bodies.map((body, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(201,162,39,0.08)',
                          color: '#d4a574',
                        }}
                      >
                        {body}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {events.length > 3 && (
        <>
          <CardDivider />
          <p className="text-xs text-[#c4baa6]/60 text-center">
            Showing {events.length} upcoming celestial events
          </p>
        </>
      )}
    </GlassCard>
  )
}
