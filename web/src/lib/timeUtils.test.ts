import { describe, it, expect } from 'vitest'
import {
  calculateTimeUntil,
  formatTimeUntil,
  formatTimeUntilCompact,
  isBetween,
  isAfter,
  isBefore,
  formatLocalTime,
  formatLocalTimeShort
} from './timeUtils'

describe('timeUtils', () => {
  describe('calculateTimeUntil', () => {
    it('should calculate time until future date', () => {
      const from = new Date('2024-01-01T12:00:00Z')
      const to = new Date('2024-01-01T13:30:45Z')

      const result = calculateTimeUntil(from, to)

      expect(result.isPast).toBe(false)
      expect(result.hours).toBe(1)
      expect(result.minutes).toBe(30)
      expect(result.seconds).toBe(45)
      expect(result.totalSeconds).toBe(5445)
    })

    it('should handle past dates', () => {
      const from = new Date('2024-01-01T12:00:00Z')
      const to = new Date('2024-01-01T11:00:00Z')

      const result = calculateTimeUntil(from, to)

      expect(result.isPast).toBe(true)
      expect(result.hours).toBe(0)
      expect(result.minutes).toBe(0)
      expect(result.seconds).toBe(0)
    })

    it('should handle string dates', () => {
      const from = new Date('2024-01-01T12:00:00Z')
      const to = '2024-01-01T12:05:00Z'

      const result = calculateTimeUntil(from, to)

      expect(result.isPast).toBe(false)
      expect(result.minutes).toBe(5)
    })
  })

  describe('formatTimeUntil', () => {
    it('should format hours, minutes, and seconds', () => {
      const timeUntil = {
        isPast: false,
        hours: 2,
        minutes: 30,
        seconds: 15,
        totalSeconds: 9015
      }

      expect(formatTimeUntil(timeUntil)).toBe('2h 30m 15s')
    })

    it('should format minutes and seconds when no hours', () => {
      const timeUntil = {
        isPast: false,
        hours: 0,
        minutes: 45,
        seconds: 30,
        totalSeconds: 2730
      }

      expect(formatTimeUntil(timeUntil)).toBe('45m 30s')
    })

    it('should format only seconds when less than a minute', () => {
      const timeUntil = {
        isPast: false,
        hours: 0,
        minutes: 0,
        seconds: 30,
        totalSeconds: 30
      }

      expect(formatTimeUntil(timeUntil)).toBe('30s')
    })

    it('should return "Past" for past times', () => {
      const timeUntil = {
        isPast: true,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0
      }

      expect(formatTimeUntil(timeUntil)).toBe('Past')
    })
  })

  describe('formatTimeUntilCompact', () => {
    it('should format without seconds for long durations', () => {
      const timeUntil = {
        isPast: false,
        hours: 2,
        minutes: 30,
        seconds: 15,
        totalSeconds: 9015
      }

      expect(formatTimeUntilCompact(timeUntil)).toBe('2h 30m')
    })

    it('should return "Soon" for less than a minute', () => {
      const timeUntil = {
        isPast: false,
        hours: 0,
        minutes: 0,
        seconds: 45,
        totalSeconds: 45
      }

      expect(formatTimeUntilCompact(timeUntil)).toBe('Soon')
    })
  })

  describe('isBetween', () => {
    it('should return true when time is between start and end', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      const start = new Date('2024-01-01T11:00:00Z')
      const end = new Date('2024-01-01T13:00:00Z')

      expect(isBetween(now, start, end)).toBe(true)
    })

    it('should return false when time is before start', () => {
      const now = new Date('2024-01-01T10:00:00Z')
      const start = new Date('2024-01-01T11:00:00Z')
      const end = new Date('2024-01-01T13:00:00Z')

      expect(isBetween(now, start, end)).toBe(false)
    })

    it('should return false when time is after end', () => {
      const now = new Date('2024-01-01T14:00:00Z')
      const start = new Date('2024-01-01T11:00:00Z')
      const end = new Date('2024-01-01T13:00:00Z')

      expect(isBetween(now, start, end)).toBe(false)
    })
  })

  describe('isAfter', () => {
    it('should return true when now is after date', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      const date = new Date('2024-01-01T11:00:00Z')

      expect(isAfter(now, date)).toBe(true)
    })

    it('should return false when now is before date', () => {
      const now = new Date('2024-01-01T10:00:00Z')
      const date = new Date('2024-01-01T11:00:00Z')

      expect(isAfter(now, date)).toBe(false)
    })

    it('should return true when times are equal', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      const date = new Date('2024-01-01T12:00:00Z')

      expect(isAfter(now, date)).toBe(true)
    })
  })

  describe('isBefore', () => {
    it('should return true when now is before date', () => {
      const now = new Date('2024-01-01T10:00:00Z')
      const date = new Date('2024-01-01T11:00:00Z')

      expect(isBefore(now, date)).toBe(true)
    })

    it('should return false when now is after date', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      const date = new Date('2024-01-01T11:00:00Z')

      expect(isBefore(now, date)).toBe(false)
    })
  })

  describe('formatLocalTime', () => {
    it('should format date with seconds', () => {
      const date = new Date('2024-01-01T12:30:45Z')
      const result = formatLocalTime(date)

      // Format depends on locale, just check it includes time components
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/)
    })

    it('should handle string dates', () => {
      const result = formatLocalTime('2024-01-01T12:30:45Z')

      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/)
    })
  })

  describe('formatLocalTimeShort', () => {
    it('should format date without seconds', () => {
      const date = new Date('2024-01-01T12:30:45Z')
      const result = formatLocalTimeShort(date)

      // Format depends on locale, just check it includes hours and minutes
      expect(result).toMatch(/\d{1,2}:\d{2}/)
      // Should not have seconds
      expect(result.split(':').length).toBe(2)
    })
  })
})
