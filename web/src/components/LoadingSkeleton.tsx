export function LoadingSkeleton() {
  return (
    <div className="grid gap-6 animate-pulse">
      {/* Moon card skeleton */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-48" />

      {/* Two-column skeletons */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-64" />
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-64" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-64" />
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-64" />
      </div>

      {/* Events skeleton */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-48" />
    </div>
  )
}
