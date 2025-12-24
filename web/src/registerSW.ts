/**
 * Service Worker registration for PWA offline support
 * Critical for dark sky sites with no cell service
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log('[PWA] Service Worker registered:', registration.scope)

        // Check for updates every hour
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('[PWA] New version available')

                // Optionally show update notification
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
      }
    })
  } else {
    console.log('[PWA] Service Workers not supported')
  }
}

/**
 * Check if app is running as PWA (installed)
 */
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

/**
 * Get install prompt event for PWA installation
 */
let deferredPrompt: any = null

export function setupInstallPrompt(callback: (prompt: any) => void) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    callback(deferredPrompt)
  })

  // Clear prompt when installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed')
    deferredPrompt = null
  })
}

export function triggerInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt()

    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install')
      }
      deferredPrompt = null
    })
  }
}
