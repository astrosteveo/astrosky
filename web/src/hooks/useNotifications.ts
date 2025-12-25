import { useState, useEffect, useCallback } from 'react'
import type { NotificationPreferences } from '../types/observations'

const STORAGE_KEY = 'astrosky-notifications'
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  issPass: true,
  meteorPeak: true,
  celestialEvent: true,
  reminderMinutes: 30,
}

// Load preferences from localStorage
function loadPreferences(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load notification preferences:', e)
  }
  return DEFAULT_PREFERENCES
}

// Save preferences to localStorage
function savePreferences(prefs: NotificationPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function useNotifications() {
  const [preferences, setPreferencesState] = useState<NotificationPreferences>(loadPreferences)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(false)

  // Check if notifications are supported
  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator
    setSupported(isSupported)
    if (isSupported) {
      setPermission(Notification.permission)
    }
  }, [])

  // Save preferences whenever they change
  useEffect(() => {
    savePreferences(preferences)
  }, [preferences])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (e) {
      console.error('Failed to request notification permission:', e)
      return false
    }
  }, [supported])

  // Enable notifications (request permission if needed)
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!supported) return false

    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return false
    }

    setPreferencesState(prev => ({ ...prev, enabled: true }))
    return true
  }, [supported, permission, requestPermission])

  // Disable notifications
  const disableNotifications = useCallback(() => {
    setPreferencesState(prev => ({ ...prev, enabled: false }))
  }, [])

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferencesState(prev => ({ ...prev, ...updates }))
  }, [])

  // Schedule a notification
  const scheduleNotification = useCallback(async (
    title: string,
    body: string,
    timestamp: Date,
    data?: Record<string, unknown>
  ): Promise<void> => {
    if (!preferences.enabled || permission !== 'granted') return

    const now = new Date()
    const delay = timestamp.getTime() - now.getTime()

    if (delay <= 0) {
      // Show immediately if time has passed
      showNotification(title, body, data)
      return
    }

    // Store scheduled notification
    const scheduled = loadScheduledNotifications()
    scheduled.push({
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: timestamp.toISOString(),
      data,
    })
    saveScheduledNotifications(scheduled)

    // If delay is less than 1 hour, schedule with setTimeout
    // Otherwise, rely on service worker periodic sync
    if (delay < 60 * 60 * 1000) {
      setTimeout(() => {
        showNotification(title, body, data)
      }, delay)
    }
  }, [preferences.enabled, permission])

  // Show a notification immediately
  const showNotification = useCallback((
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): void => {
    if (!preferences.enabled || permission !== 'granted') return

    // Try to use service worker notification first
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          data: { url: '/', ...data },
          tag: data?.tag as string || undefined,
        })
      })
    } else {
      // Fallback to basic notification
      new Notification(title, {
        body,
        icon: '/icon-192.png',
      })
    }
  }, [preferences.enabled, permission])

  return {
    preferences,
    permission,
    supported,
    enabled: preferences.enabled && permission === 'granted',
    requestPermission,
    enableNotifications,
    disableNotifications,
    updatePreferences,
    scheduleNotification,
    showNotification,
  }
}

// Scheduled notifications storage
interface ScheduledNotification {
  id: string
  title: string
  body: string
  timestamp: string
  data?: Record<string, unknown>
}

const SCHEDULED_KEY = 'astrosky-scheduled-notifications'

function loadScheduledNotifications(): ScheduledNotification[] {
  try {
    const stored = localStorage.getItem(SCHEDULED_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveScheduledNotifications(notifications: ScheduledNotification[]): void {
  localStorage.setItem(SCHEDULED_KEY, JSON.stringify(notifications))
}

// Check and show any due notifications (called on app load)
export function checkScheduledNotifications(): void {
  const scheduled = loadScheduledNotifications()
  const now = new Date()
  const remaining: ScheduledNotification[] = []

  scheduled.forEach(notif => {
    const notifTime = new Date(notif.timestamp)
    if (notifTime <= now) {
      // Notification is due - show it
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notif.title, {
          body: notif.body,
          icon: '/icon-192.png',
        })
      }
    } else {
      remaining.push(notif)
    }
  })

  saveScheduledNotifications(remaining)
}
