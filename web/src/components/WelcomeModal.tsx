import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WELCOME_SHOWN_KEY = 'astrosky-welcome-shown'

export function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if welcome has been shown before
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY)
    if (!hasSeenWelcome) {
      // Small delay before showing for smoother experience
      const timer = setTimeout(() => setIsVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-slate-900/95 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Logo/Title */}
            <div className="text-center mb-6">
              <h1 className="font-display text-4xl font-bold text-slate-50 mb-2">
                Astro<span className="text-cyan-400">SKY</span>
              </h1>
              <p className="text-slate-400">Your window to the cosmos</p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4 mb-8">
              <FeatureItem
                icon="🌙"
                title="Real-Time Sky Data"
                description="Live updates on moon phases, planets, ISS passes, and more"
              />
              <FeatureItem
                icon="📍"
                title="Location Aware"
                description="Automatically shows what's visible from your exact location"
              />
              <FeatureItem
                icon="📓"
                title="Observation Log"
                description="Track what you see and progress through the Messier Marathon"
              />
              <FeatureItem
                icon="👥"
                title="Community Insights"
                description="See what other stargazers are observing in your area"
              />
            </div>

            {/* CTA */}
            <button
              onClick={handleDismiss}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40"
            >
              Start Exploring
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              Works offline for dark sky sites
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-medium text-slate-200">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  )
}
