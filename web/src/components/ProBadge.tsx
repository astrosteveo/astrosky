import { motion } from 'framer-motion'

interface ProBadgeProps {
  size?: 'sm' | 'md'
  className?: string
}

export function ProBadge({ size = 'sm', className = '' }: ProBadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1'

  return (
    <motion.span
      className={`
        inline-flex items-center font-bold uppercase tracking-wider rounded-full
        bg-gradient-to-r from-[#c9a227] to-[#e8c547]
        text-[#0f172a] shadow-lg shadow-[#c9a227]/20
        ${sizeClasses} ${className}
      `}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      PRO
    </motion.span>
  )
}

interface ProFeatureLockProps {
  children: React.ReactNode
  onUpgradeClick: () => void
  featureName: string
}

export function ProFeatureLock({ children, onUpgradeClick, featureName }: ProFeatureLockProps) {
  return (
    <div className="relative">
      {/* Blurred/dimmed content */}
      <div className="opacity-50 pointer-events-none select-none blur-[1px]">
        {children}
      </div>

      {/* Overlay with upgrade prompt */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ProBadge size="md" className="mb-3" />
        <p className="text-sm text-[#f5f0e1] mb-3 text-center px-4">
          {featureName} is a Pro feature
        </p>
        <button
          onClick={onUpgradeClick}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#c9a227] to-[#e8c547] text-[#0f172a] hover:shadow-lg hover:shadow-[#c9a227]/30 transition-all"
        >
          Upgrade to Pro
        </button>
      </motion.div>
    </div>
  )
}
