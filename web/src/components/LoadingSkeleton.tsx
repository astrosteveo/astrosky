import { motion } from 'framer-motion'

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`observatory-card relative overflow-hidden ${className}`}>
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.03) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content placeholder lines */}
      <div className="p-6 space-y-4">
        <div className="h-6 w-32 bg-[rgba(201,162,39,0.08)] rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-[rgba(201,162,39,0.05)] rounded" />
          <div className="h-4 w-3/4 bg-[rgba(201,162,39,0.05)] rounded" />
          <div className="h-4 w-1/2 bg-[rgba(201,162,39,0.05)] rounded" />
        </div>
      </div>
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Loading indicator */}
      <div className="text-center py-8">
        <motion.div
          className="inline-flex items-center gap-3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-[#c9a227]" />
          <span className="font-mono text-sm text-[#c9a227]/70 tracking-wider uppercase">
            Calibrating Observatory
          </span>
          <div className="w-2 h-2 rounded-full bg-[#c9a227]" />
        </motion.div>
      </div>

      {/* Status banner skeleton */}
      <SkeletonCard className="h-24" />

      {/* Next event skeleton */}
      <SkeletonCard className="h-36" />

      {/* Countdowns skeleton */}
      <SkeletonCard className="h-48" />

      {/* Two-column skeletons */}
      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>

      {/* Events skeleton */}
      <SkeletonCard className="h-48" />
    </motion.div>
  )
}
