import { AstroEvent } from '../types'
import { GlassCard } from './GlassCard'

interface EventsCardProps {
  events: AstroEvent[]
}

export function EventsCard({ events }: EventsCardProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const eventTypeColor = (type: string) => {
    if (type.includes('eclipse')) return 'text-purple-400'
    if (type.includes('conjunction')) return 'text-amber-400'
    if (type.includes('meteor')) return 'text-sky-400'
    return 'text-emerald-400'
  }

  if (events.length === 0) {
    return (
      <GlassCard title="Upcoming Events">
        <p className="text-slate-400 text-center py-4">No upcoming events</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Upcoming Events">
      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={index}
            className="pb-4 last:pb-0 border-b border-white/10 last:border-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-display text-lg font-semibold text-slate-50">
                  {event.title}
                </p>
                <p className={`text-sm ${eventTypeColor(event.type)}`}>
                  {event.type}
                </p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p>{formatDate(event.date)}</p>
                <p>{formatTime(event.date)}</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-2">
              {event.description}
            </p>

            <div className="text-xs text-slate-500">
              Involves: <span className="text-slate-400">{event.bodies.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
