import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'
import { useObservationsContext } from '../context/ObservationsContext'
import type { Observation, EquipmentType } from '../types/observations'

interface HourData {
  hour: number
  count: number
}

interface EquipmentData {
  equipment: EquipmentType
  count: number
  percentage: number
}

interface MonthlyData {
  month: string
  count: number
}

interface StreakInfo {
  current: number
  longest: number
  lastObservingDate: string | null
}

const equipmentLabels: Record<EquipmentType, string> = {
  'naked-eye': 'Naked Eye',
  'binoculars': 'Binoculars',
  'telescope': 'Telescope',
}

const equipmentColors: Record<EquipmentType, string> = {
  'naked-eye': '#34d399',
  'binoculars': '#4ecdc4',
  'telescope': '#a855f7',
}

function analyzeObservations(observations: Observation[]) {
  // Best observing hours
  const hourCounts: Record<number, number> = {}
  for (let i = 0; i < 24; i++) hourCounts[i] = 0

  // Equipment distribution
  const equipmentCounts: Record<EquipmentType, number> = {
    'naked-eye': 0,
    'binoculars': 0,
    'telescope': 0,
  }

  // Monthly activity (last 6 months)
  const monthlyCounts: Record<string, number> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyCounts[key] = 0
  }

  // Streak tracking
  const observingDates = new Set<string>()

  // Object type counts
  const typeCounts: Record<string, number> = {}

  observations.forEach((obs) => {
    const date = new Date(obs.timestamp)

    // Hour distribution
    const hour = date.getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1

    // Equipment
    equipmentCounts[obs.equipment] = (equipmentCounts[obs.equipment] || 0) + 1

    // Monthly (last 6 months)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (monthKey in monthlyCounts) {
      monthlyCounts[monthKey]++
    }

    // Track unique observing days
    const dateKey = date.toISOString().split('T')[0]
    observingDates.add(dateKey)

    // Object types
    typeCounts[obs.object.type] = (typeCounts[obs.object.type] || 0) + 1
  })

  // Calculate streaks
  const sortedDates = Array.from(observingDates).sort().reverse()
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Current streak: must include today or yesterday
  if (sortedDates.length > 0) {
    const lastDate = sortedDates[0]
    if (lastDate === today || lastDate === yesterday) {
      currentStreak = 1
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1])
        const currDate = new Date(sortedDates[i])
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000)
        if (diffDays === 1) {
          currentStreak++
        } else {
          break
        }
      }
    }
  }

  // Longest streak
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000)
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Format data for charts
  const hourData: HourData[] = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .filter((d) => d.count > 0)

  const totalObs = observations.length
  const equipmentData: EquipmentData[] = (Object.entries(equipmentCounts) as [EquipmentType, number][])
    .filter(([, count]) => count > 0)
    .map(([equipment, count]) => ({
      equipment,
      count,
      percentage: totalObs > 0 ? Math.round((count / totalObs) * 100) : 0,
    }))

  const monthlyData: MonthlyData[] = Object.entries(monthlyCounts).map(([month, count]) => ({
    month,
    count,
  }))

  const streakInfo: StreakInfo = {
    current: currentStreak,
    longest: longestStreak,
    lastObservingDate: sortedDates[0] || null,
  }

  // Peak hour
  const peakHour = Object.entries(hourCounts).reduce(
    (max, [hour, count]) => (count > max.count ? { hour: parseInt(hour), count } : max),
    { hour: 0, count: 0 }
  )

  return {
    hourData,
    equipmentData,
    monthlyData,
    streakInfo,
    typeCounts,
    peakHour,
    totalDays: observingDates.size,
  }
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}

export function ObservationAnalytics() {
  const { observations } = useObservationsContext()

  const analytics = useMemo(() => analyzeObservations(observations), [observations])

  if (observations.length < 3) {
    return (
      <GlassCard title="Observing Insights" icon="📊" glowColor="aurora">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#4ecdc4]/10 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-[#c4baa6]">Log at least 3 observations to unlock insights</p>
          <p className="text-[#c4baa6]/60 text-sm mt-1">
            {observations.length}/3 observations recorded
          </p>
        </div>
      </GlassCard>
    )
  }

  const maxMonthlyCount = Math.max(...analytics.monthlyData.map((d) => d.count), 1)
  const maxHourCount = Math.max(...analytics.hourData.map((d) => d.count), 1)

  return (
    <GlassCard title="Observing Insights" icon="📊" glowColor="aurora">
      {/* Streaks & Summary Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-[rgba(78,205,196,0.1)] rounded-xl border border-[rgba(78,205,196,0.2)]">
          <p className="text-2xl font-bold text-[#4ecdc4]">{analytics.streakInfo.current}</p>
          <p className="text-xs text-[#c4baa6]">Day Streak</p>
        </div>
        <div className="text-center p-3 bg-[rgba(201,162,39,0.1)] rounded-xl border border-[rgba(201,162,39,0.2)]">
          <p className="text-2xl font-bold text-[#c9a227]">{analytics.streakInfo.longest}</p>
          <p className="text-xs text-[#c4baa6]">Best Streak</p>
        </div>
        <div className="text-center p-3 bg-[rgba(168,85,247,0.1)] rounded-xl border border-[rgba(168,85,247,0.2)]">
          <p className="text-2xl font-bold text-[#a855f7]">{analytics.totalDays}</p>
          <p className="text-xs text-[#c4baa6]">Active Days</p>
        </div>
      </div>

      {/* Peak Time */}
      {analytics.peakHour.count > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[rgba(15,23,42,0.4)] rounded-lg">
          <span className="text-lg">🌙</span>
          <span className="text-sm text-[#c4baa6]">
            You observe most around{' '}
            <span className="text-[#f5f0e1] font-medium">{formatHour(analytics.peakHour.hour)}</span>
          </span>
        </div>
      )}

      <CardDivider />

      {/* Equipment Distribution */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#f5f0e1] mb-3">Equipment Used</h3>
        <div className="space-y-2">
          {analytics.equipmentData.map((item) => (
            <div key={item.equipment} className="flex items-center gap-3">
              <span className="w-20 text-xs text-[#c4baa6]">{equipmentLabels[item.equipment]}</span>
              <div className="flex-1 h-4 bg-[rgba(15,23,42,0.4)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: equipmentColors[item.equipment] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="w-12 text-xs font-mono text-[#c4baa6] text-right">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <CardDivider />

      {/* Monthly Activity */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#f5f0e1] mb-3">Monthly Activity</h3>
        <div className="flex items-end justify-between gap-1 h-20">
          {analytics.monthlyData.map((item) => {
            const height = maxMonthlyCount > 0 ? (item.count / maxMonthlyCount) * 100 : 0
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full bg-gradient-to-t from-[#4ecdc4] to-[#a855f7] rounded-t"
                  style={{ minHeight: item.count > 0 ? '8px' : '2px' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 3)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <span className="text-[10px] text-[#c4baa6]">{formatMonth(item.month)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <CardDivider />

      {/* Observing Hours Distribution */}
      <div>
        <h3 className="text-sm font-medium text-[#f5f0e1] mb-3">When You Observe</h3>
        <div className="flex items-end justify-between gap-px h-12">
          {Array.from({ length: 24 }, (_, hour) => {
            const data = analytics.hourData.find((d) => d.hour === hour)
            const count = data?.count || 0
            const height = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0
            const isNight = hour >= 18 || hour < 6
            return (
              <motion.div
                key={hour}
                className={`flex-1 rounded-t ${
                  isNight ? 'bg-[#a855f7]' : 'bg-[#c9a227]/50'
                }`}
                style={{ minHeight: count > 0 ? '4px' : '1px' }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 2)}%` }}
                transition={{ duration: 0.3, delay: hour * 0.02 }}
                title={`${formatHour(hour)}: ${count} observations`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#c4baa6]">12am</span>
          <span className="text-[10px] text-[#c4baa6]">6am</span>
          <span className="text-[10px] text-[#c4baa6]">12pm</span>
          <span className="text-[10px] text-[#c4baa6]">6pm</span>
          <span className="text-[10px] text-[#c4baa6]">12am</span>
        </div>
      </div>
    </GlassCard>
  )
}
