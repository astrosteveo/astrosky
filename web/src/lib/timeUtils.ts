/**
 * Time utility functions for countdowns and relative time calculations
 */

export interface TimeUntil {
  isPast: boolean
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

/**
 * Calculate time remaining until a future date
 */
export function calculateTimeUntil(from: Date, to: string | Date): TimeUntil {
  const fromMs = from.getTime()
  const toMs = typeof to === 'string' ? new Date(to).getTime() : to.getTime()
  const diffMs = toMs - fromMs

  if (diffMs <= 0) {
    return { isPast: true, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { isPast: false, hours, minutes, seconds, totalSeconds }
}

/**
 * Format time until as a human-readable string
 */
export function formatTimeUntil(timeUntil: TimeUntil): string {
  if (timeUntil.isPast) {
    return 'Past'
  }

  const { hours, minutes, seconds } = timeUntil

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Format time until as a compact string (no seconds for long durations)
 */
export function formatTimeUntilCompact(timeUntil: TimeUntil): string {
  if (timeUntil.isPast) {
    return 'Past'
  }

  const { hours, minutes } = timeUntil

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return 'Soon'
  }
}

/**
 * Check if current time is between two dates (e.g., during twilight)
 */
export function isBetween(now: Date, start: string | Date, end: string | Date): boolean {
  const nowMs = now.getTime()
  const startMs = typeof start === 'string' ? new Date(start).getTime() : start.getTime()
  const endMs = typeof end === 'string' ? new Date(end).getTime() : end.getTime()
  return nowMs >= startMs && nowMs <= endMs
}

/**
 * Check if current time is after a date
 */
export function isAfter(now: Date, date: string | Date): boolean {
  const nowMs = now.getTime()
  const dateMs = typeof date === 'string' ? new Date(date).getTime() : date.getTime()
  return nowMs >= dateMs
}

/**
 * Check if current time is before a date
 */
export function isBefore(now: Date, date: string | Date): boolean {
  const nowMs = now.getTime()
  const dateMs = typeof date === 'string' ? new Date(date).getTime() : date.getTime()
  return nowMs < dateMs
}

/**
 * Format a date as local time string
 */
export function formatLocalTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/**
 * Format a date as local time without seconds
 */
export function formatLocalTimeShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
