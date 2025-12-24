import { motion } from 'framer-motion'

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl ${className}`}>
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content placeholder lines */}
      <div className="p-6 space-y-4">
        <div className="h-6 w-32 bg-white/5 rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-3/4 bg-white/5 rounded" />
          <div className="h-4 w-1/2 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
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
