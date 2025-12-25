import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { DesktopSidebar } from './DesktopSidebar'
import type { TabId } from '../TabNavigation'

interface DesktopLayoutProps {
  children: ReactNode
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  moonPhase?: string
  moonIllumination?: number
  cloudCover?: number
  nextEventName?: string
  nextEventTime?: string
}

export function DesktopLayout({
  children,
  activeTab,
  onTabChange,
  moonPhase,
  moonIllumination,
  cloudCover,
  nextEventName,
  nextEventTime,
}: DesktopLayoutProps) {
  return (
    <>
      {/* Desktop Sidebar - only visible on lg: and above */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        moonPhase={moonPhase}
        moonIllumination={moonIllumination}
        cloudCover={cloudCover}
        nextEventName={nextEventName}
        nextEventTime={nextEventTime}
      />

      {/* Main content area - shifted right on desktop to accommodate sidebar */}
      <motion.main
        className="desktop-main-content lg:ml-[72px] transition-[margin] duration-300"
        initial={false}
      >
        {children}
      </motion.main>
    </>
  )
}

// Grid layout wrapper for dashboard-style multi-column layouts
interface DesktopGridProps {
  children: ReactNode
  className?: string
}

export function DesktopGrid({ children, className = '' }: DesktopGridProps) {
  return (
    <div className={`desktop-grid ${className}`}>
      {children}
    </div>
  )
}

// Full-width section that spans all columns
interface DesktopFullWidthProps {
  children: ReactNode
  className?: string
}

export function DesktopFullWidth({ children, className = '' }: DesktopFullWidthProps) {
  return (
    <div className={`desktop-full-width ${className}`}>
      {children}
    </div>
  )
}

// Primary content section (takes 2/3 on 3-column, 1/2 on 2-column)
interface DesktopPrimaryProps {
  children: ReactNode
  className?: string
}

export function DesktopPrimary({ children, className = '' }: DesktopPrimaryProps) {
  return (
    <div className={`desktop-primary ${className}`}>
      {children}
    </div>
  )
}

// Secondary content section (takes 1/3 on 3-column, 1/2 on 2-column)
interface DesktopSecondaryProps {
  children: ReactNode
  className?: string
}

export function DesktopSecondary({ children, className = '' }: DesktopSecondaryProps) {
  return (
    <div className={`desktop-secondary ${className}`}>
      {children}
    </div>
  )
}

// Two-column split layout
interface DesktopSplitProps {
  left: ReactNode
  right: ReactNode
  className?: string
}

export function DesktopSplit({ left, right, className = '' }: DesktopSplitProps) {
  return (
    <div className={`desktop-split ${className}`}>
      <div className="desktop-split-left">{left}</div>
      <div className="desktop-split-right">{right}</div>
    </div>
  )
}

// Hero section for prominent content (like SkyChart)
interface DesktopHeroProps {
  children: ReactNode
  className?: string
}

export function DesktopHero({ children, className = '' }: DesktopHeroProps) {
  return (
    <div className={`desktop-hero ${className}`}>
      {children}
    </div>
  )
}
