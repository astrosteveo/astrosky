import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TabId } from '../TabNavigation'

interface DesktopSidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  moonPhase?: string
  moonIllumination?: number
  cloudCover?: number
  nextEventName?: string
  nextEventTime?: string
}

interface NavItem {
  id: TabId
  label: string
  icon: React.ReactNode
  description: string
}

const navItems: NavItem[] = [
  {
    id: 'tonight',
    label: 'Tonight',
    description: 'Overview & conditions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    id: 'sky',
    label: 'Sky Map',
    description: 'Chart & celestial bodies',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'deepsky',
    label: 'Deep Sky',
    description: 'Messier & beyond',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: 'iss',
    label: 'ISS Tracker',
    description: 'Pass predictions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'log',
    label: 'Logbook',
    description: 'Observations & stats',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
]

// Moon phase to emoji mapping
function getMoonEmoji(phase: string): string {
  const phaseMap: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  }
  return phaseMap[phase] || '🌙'
}

export function DesktopSidebar({
  activeTab,
  onTabChange,
  moonPhase,
  moonIllumination,
  cloudCover,
  nextEventName,
  nextEventTime,
}: DesktopSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Auto-expand on hover when collapsed
  const isExpanded = !isCollapsed || isHovering

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('astrosky-sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('astrosky-sidebar-collapsed', JSON.stringify(newState))
  }

  return (
    <motion.aside
      className="desktop-sidebar fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col"
      initial={false}
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-[rgba(5,10,20,0.92)] backdrop-blur-xl border-r border-[rgba(148,163,184,0.08)]" />

      {/* Decorative top accent */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[rgba(201,162,39,0.4)] to-transparent" />

      {/* Content */}
      <div className="relative flex flex-col h-full py-6">
        {/* Logo / Brand */}
        <div className="px-4 mb-8">
          <motion.div
            className="flex items-center gap-3"
            animate={{ justifyContent: isExpanded ? 'flex-start' : 'center' }}
          >
            {/* Observatory icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>

            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-display text-lg font-bold tracking-tight whitespace-nowrap">
                    <span className="text-[#c9a227]">Astro</span>
                    <span className="text-[#f0f4f8]">SKY</span>
                  </h1>
                  <p className="text-[10px] text-[#94a3b8] whitespace-nowrap">Observatory Control</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    relative w-full flex items-center gap-3 rounded-xl transition-colors
                    ${isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                    ${isActive
                      ? 'text-[#c9a227]'
                      : 'text-[#94a3b8] hover:text-[#f0f4f8]'
                    }
                  `}
                  whileHover={{ x: isExpanded ? 2 : 0 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 rounded-xl bg-[rgba(201,162,39,0.1)] border border-[rgba(201,162,39,0.2)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <span className="relative z-10 flex-shrink-0">{item.icon}</span>

                  {/* Label & description */}
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-10 text-left overflow-hidden"
                      >
                        <span className="block text-sm font-medium whitespace-nowrap">{item.label}</span>
                        <span className="block text-[10px] text-[#94a3b8]/70 whitespace-nowrap">
                          {item.description}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active indicator dot (collapsed mode) */}
                  {isActive && !isExpanded && (
                    <motion.div
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c9a227]"
                      layoutId="activeDot"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </nav>

        {/* Quick Status Widgets */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="px-3 mt-4 space-y-2"
            >
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[rgba(148,163,184,0.15)] to-transparent mx-2 mb-3" />

              {/* Moon Widget */}
              {moonPhase && (
                <div className="sidebar-widget p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(148,163,184,0.08)]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{getMoonEmoji(moonPhase)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#f0f4f8] truncate">{moonPhase}</p>
                      {moonIllumination !== undefined && (
                        <p className="text-[10px] text-[#94a3b8]">{moonIllumination}% illuminated</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Weather Widget */}
              {cloudCover !== undefined && (
                <div className="sidebar-widget p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(148,163,184,0.08)]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{cloudCover < 25 ? '🌟' : cloudCover < 50 ? '⛅' : '☁️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#f0f4f8]">
                        {cloudCover < 25 ? 'Clear skies' : cloudCover < 50 ? 'Partly cloudy' : 'Cloudy'}
                      </p>
                      <p className="text-[10px] text-[#94a3b8]">{cloudCover}% cloud cover</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Event Widget */}
              {nextEventName && (
                <div className="sidebar-widget p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(148,163,184,0.08)]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🔭</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#4ecdc4] truncate">{nextEventName}</p>
                      {nextEventTime && (
                        <p className="text-[10px] text-[#94a3b8]">{nextEventTime}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle */}
        <div className="px-3 mt-auto pt-4">
          <motion.button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[#94a3b8] hover:text-[#f0f4f8] hover:bg-[rgba(148,163,184,0.08)] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </motion.svg>
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium"
                >
                  {isCollapsed ? 'Expand' : 'Collapse'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  )
}
