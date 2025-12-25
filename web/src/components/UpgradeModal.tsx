import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscriptionContext } from '../context/SubscriptionContext'
import { ProBadge } from './ProBadge'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  highlightFeature?: string
}

const PRO_FEATURES = [
  {
    icon: '🌤️',
    name: 'Smart Clear Sky Alerts',
    description: 'Get notified when conditions are perfect for stargazing',
  },
  {
    icon: '🎯',
    name: 'Observation Planner',
    description: 'Personalized "what to observe tonight" recommendations',
  },
  {
    icon: '🏆',
    name: 'Weekly Challenges',
    description: 'Fun challenges to keep you motivated and learning',
  },
  {
    icon: '📊',
    name: 'Unlimited History',
    description: 'Access your complete observation history forever',
  },
  {
    icon: '☁️',
    name: 'Cloud Backup',
    description: 'Your data synced and safe across all devices',
  },
  {
    icon: '📤',
    name: 'Data Export',
    description: 'Export your observations to CSV or JSON',
  },
]

export function UpgradeModal({ isOpen, onClose, highlightFeature }: UpgradeModalProps) {
  const { upgradeToPro } = useSubscriptionContext()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async () => {
    setIsProcessing(true)
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    upgradeToPro()
    setIsProcessing(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[85vh] z-50 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-2xl border border-[#c9a227]/30 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header */}
              <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-b from-[#c9a227]/10 to-transparent">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-[#94a3b8] hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl">🌟</span>
                  <h2 className="text-2xl font-bold text-[#f5f0e1]">AstroSky</h2>
                  <ProBadge size="md" />
                </div>
                <p className="text-[#94a3b8]">Your personal astronomy assistant</p>
              </div>

              {/* Pricing Toggle */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-center gap-2 p-1 bg-[#0f172a] rounded-lg">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      selectedPlan === 'monthly'
                        ? 'bg-[#c9a227] text-[#0f172a]'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      selectedPlan === 'yearly'
                        ? 'bg-[#c9a227] text-[#0f172a]'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    Yearly
                    <span className="ml-1 text-xs opacity-75">Save 44%</span>
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="px-6 pb-6 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[#f5f0e1]">
                    ${selectedPlan === 'monthly' ? '2.99' : '19.99'}
                  </span>
                  <span className="text-[#94a3b8]">
                    /{selectedPlan === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {selectedPlan === 'yearly' && (
                  <p className="text-sm text-[#4ecdc4] mt-1">
                    Just $1.67/month
                  </p>
                )}
              </div>

              {/* Features List */}
              <div className="px-6 pb-6">
                <h3 className="text-sm font-medium text-[#94a3b8] uppercase tracking-wide mb-3">
                  Everything in Pro
                </h3>
                <div className="space-y-3">
                  {PRO_FEATURES.map((feature) => (
                    <motion.div
                      key={feature.name}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        highlightFeature === feature.name
                          ? 'bg-[#c9a227]/20 border border-[#c9a227]/30'
                          : 'bg-[#0f172a]/50'
                      }`}
                      initial={highlightFeature === feature.name ? { scale: 1.02 } : {}}
                      animate={highlightFeature === feature.name ? { scale: [1.02, 1, 1.02] } : {}}
                      transition={{ repeat: 2, duration: 0.3 }}
                    >
                      <span className="text-xl">{feature.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[#f5f0e1]">{feature.name}</p>
                        <p className="text-xs text-[#94a3b8]">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="px-6 pb-8">
                <motion.button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#c9a227] to-[#e8c547] text-[#0f172a] hover:shadow-lg hover:shadow-[#c9a227]/30 disabled:opacity-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="w-5 h-5 border-2 border-[#0f172a]/30 border-t-[#0f172a] rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      />
                      Processing...
                    </span>
                  ) : (
                    `Start Pro - $${selectedPlan === 'monthly' ? '2.99' : '19.99'}/${selectedPlan === 'monthly' ? 'mo' : 'yr'}`
                  )}
                </motion.button>

                <p className="text-xs text-center text-[#94a3b8] mt-3">
                  Cancel anytime. 7-day free trial included.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for easy modal control
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightFeature, setHighlightFeature] = useState<string | undefined>()

  const openUpgradeModal = (feature?: string) => {
    setHighlightFeature(feature)
    setIsOpen(true)
  }

  const closeUpgradeModal = () => {
    setIsOpen(false)
    setHighlightFeature(undefined)
  }

  return {
    isOpen,
    highlightFeature,
    openUpgradeModal,
    closeUpgradeModal,
  }
}
