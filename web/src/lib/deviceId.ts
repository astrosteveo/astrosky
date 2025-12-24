// Anonymous device identification for observation syncing
// No personal data collected - just a random UUID per device

const DEVICE_ID_KEY = 'astrosky-device-id'

export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    // Generate a new UUID v4
    deviceId = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  return deviceId
}

// Check if device ID exists (for UI purposes)
export function hasDeviceId(): boolean {
  return localStorage.getItem(DEVICE_ID_KEY) !== null
}
