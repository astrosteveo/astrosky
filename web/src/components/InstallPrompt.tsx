import { useState, useEffect } from 'react'
import { setupInstallPrompt, triggerInstall, isPWA } from '../registerSW'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isPWA() || dismissed) {
      return
    }

    // Check localStorage for previous dismissal
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Setup install prompt
    setupInstallPrompt((prompt) => {
      if (prompt) {
        setShowPrompt(true)
      }
    })
  }, [dismissed])

  const handleInstall = () => {
    triggerInstall()
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="backdrop-blur-xl bg-white/[0.05] border border-white/20 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-slate-50 mb-1">
              Install AstroSky
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              Install as an app for offline access at dark sky sites! Works without internet.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
