import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useNotifications, checkScheduledNotifications } from '../hooks/useNotifications'
import type { ISSPass, MeteorShower, AstroEvent } from '../types'

interface NotificationsContextType {
  preferences: ReturnType<typeof useNotifications>['preferences']
  permission: NotificationPermission
  supported: boolean
  enabled: boolean
  enableNotifications: () => Promise<boolean>
  disableNotifications: () => void
  updatePreferences: ReturnType<typeof useNotifications>['updatePreferences']
  scheduleEventNotifications: (data: SchedulableData) => void
}

interface SchedulableData {
  iss_passes?: ISSPass[]
  meteors?: MeteorShower[]
  events?: AstroEvent[]
}

const NotificationsContext = createContext<NotificationsContextType | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const notifications = useNotifications()

  // Check for due notifications on mount
  useEffect(() => {
    checkScheduledNotifications()
  }, [])

  // Schedule notifications for upcoming events
  const scheduleEventNotifications = (data: SchedulableData) => {
    if (!notifications.enabled) return

    const { preferences, scheduleNotification } = notifications
    const reminderMs = preferences.reminderMinutes * 60 * 1000

    // Schedule ISS pass notifications
    if (preferences.issPass && data.iss_passes) {
      data.iss_passes.slice(0, 3).forEach(pass => {
        const passTime = new Date(pass.rise_time)
        const notifyTime = new Date(passTime.getTime() - reminderMs)

        if (notifyTime > new Date()) {
          scheduleNotification(
            'ISS Pass Coming Up! 🛰️',
            `The ISS will be visible in ${preferences.reminderMinutes} minutes. Max brightness: mag ${pass.magnitude.toFixed(1)}`,
            notifyTime,
            { type: 'iss', tag: `iss-${pass.rise_time}` }
          )
        }
      })
    }

    // Schedule meteor shower peak notifications
    if (preferences.meteorPeak && data.meteors) {
      data.meteors
        .filter(m => m.is_peak)
        .forEach(meteor => {
          const peakDate = new Date(meteor.peak_date)
          // Notify at sunset on peak day (approximate - 6pm local)
          peakDate.setHours(18, 0, 0, 0)

          if (peakDate > new Date()) {
            scheduleNotification(
              `${meteor.name} Peak Tonight! ☄️`,
              `Up to ${meteor.rate} meteors/hour expected. Best viewing after midnight.`,
              peakDate,
              { type: 'meteor', tag: `meteor-${meteor.name}` }
            )
          }
        })
    }

    // Schedule celestial event notifications
    if (preferences.celestialEvent && data.events) {
      data.events.slice(0, 5).forEach(event => {
        const eventTime = new Date(event.date)
        const notifyTime = new Date(eventTime.getTime() - reminderMs)

        if (notifyTime > new Date()) {
          scheduleNotification(
            `${event.title} ✨`,
            event.description,
            notifyTime,
            { type: 'event', tag: `event-${event.date}` }
          )
        }
      })
    }
  }

  return (
    <NotificationsContext.Provider
      value={{
        preferences: notifications.preferences,
        permission: notifications.permission,
        supported: notifications.supported,
        enabled: notifications.enabled,
        enableNotifications: notifications.enableNotifications,
        disableNotifications: notifications.disableNotifications,
        updatePreferences: notifications.updatePreferences,
        scheduleEventNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider')
  }
  return context
}
