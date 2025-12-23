import { ReactNode } from 'react'

interface GlassCardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function GlassCard({ title, children, className = '' }: GlassCardProps) {
  return (
    <div
      data-testid="glass-card"
      className={`
        backdrop-blur-xl bg-white/[0.03]
        border border-white/10 rounded-2xl
        p-6 transition-all duration-300
        hover:bg-white/[0.05] hover:border-white/20
        hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]
        ${className}
      `}
    >
      {title && (
        <h2 className="font-display text-xl font-semibold text-slate-50 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}
