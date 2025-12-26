import { useState, lazy, Suspense, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarField } from './components/StarField'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { InstallPrompt } from './components/InstallPrompt'
import { CurrentSkyStatus } from './components/CurrentSkyStatus'
import { NextEvent } from './components/NextEvent'
import { LiveCountdowns } from './components/LiveCountdowns'
import { ObservingConditionsCard } from './components/ObservingConditionsCard'
import { TonightsBest } from './components/TonightsBest'
import { WelcomeModal } from './components/WelcomeModal'
import { ThemeToggle } from './components/ThemeToggle'
import { SmartAlertsCard } from './components/SmartAlertsCard'
import { ObservationPlannerCard } from './components/ObservationPlannerCard'
import { WeeklyChallengesCard } from './components/WeeklyChallengesCard'
import { UpgradeModal, useUpgradeModal } from './components/UpgradeModal'
import { useSubscriptionContext } from './context/SubscriptionContext'
import { ProBadge } from './components/ProBadge'
import { TabNavigation, type TabId } from './components/TabNavigation'
import { DesktopLayout } from './components/layout/DesktopLayout'
import { useGeolocation } from './hooks/useGeolocation'
import { useReport } from './hooks/useReport'
import { useCurrentTime } from './hooks/useCurrentTime'
import { formatLocalTime } from './lib/timeUtils'
import { useReverseGeocode } from './lib/geocoding'
import { ObservationsProvider } from './context/ObservationsContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { ThemeProvider } from './context/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { EquipmentProvider } from './context/EquipmentContext'
import { SessionsProvider } from './context/SessionsContext'
import { SubscriptionProvider } from './context/SubscriptionContext'

// Lazy-loaded components for less-used tabs to reduce initial bundle size
// Sky tab components
const MoonCard = lazy(() => import('./components/MoonCard').then(m => ({ default: m.MoonCard })))
const SunTimesCard = lazy(() => import('./components/SunTimesCard').then(m => ({ default: m.SunTimesCard })))
const PlanetsCard = lazy(() => import('./components/PlanetsCard').then(m => ({ default: m.PlanetsCard })))
const SkyChart = lazy(() => import('./components/SkyChart').then(m => ({ default: m.SkyChart })))

// Deep Sky tab components
const DeepSkyCard = lazy(() => import('./components/DeepSkyCard').then(m => ({ default: m.DeepSkyCard })))
const MeteorsCard = lazy(() => import('./components/MeteorsCard').then(m => ({ default: m.MeteorsCard })))
const EventsCard = lazy(() => import('./components/EventsCard').then(m => ({ default: m.EventsCard })))

// ISS tab components
const ISSCard = lazy(() => import('./components/ISSCard').then(m => ({ default: m.ISSCard })))

// Log tab components
const ObservationStats = lazy(() => import('./components/ObservationStats').then(m => ({ default: m.ObservationStats })))
const ObservationAnalytics = lazy(() => import('./components/ObservationAnalytics').then(m => ({ default: m.ObservationAnalytics })))
const NearbyObservationsCard = lazy(() => import('./components/NearbyObservationsCard').then(m => ({ default: m.NearbyObservationsCard })))
const NotificationSettings = lazy(() => import('./components/NotificationSettings').then(m => ({ default: m.NotificationSettings })))
const AchievementsCard = lazy(() => import('./components/AchievementsCard').then(m => ({ default: m.AchievementsCard })))
const EquipmentProfilesCard = lazy(() => import('./components/EquipmentProfilesCard').then(m => ({ default: m.EquipmentProfilesCard })))
const SessionNotesCard = lazy(() => import('./components/SessionNotesCard').then(m => ({ default: m.SessionNotesCard })))

// Minimal loading placeholder for lazy components
function LazyLoadingFallback() {
  return (
    <div className="observatory-card p-6 animate-pulse">
      <div className="h-4 bg-[#c9a227]/10 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-[#c9a227]/10 rounded w-full" />
        <div className="h-3 bg-[#c9a227]/10 rounded w-2/3" />
      </div>
    </div>
  )
}

// Validate latitude is within valid range [-90, 90]
function isValidLatitude(lat: number): boolean {
  return !isNaN(lat) && lat >= -90 && lat <= 90
}

// Validate longitude is within valid range [-180, 180]
function isValidLongitude(lon: number): boolean {
  return !isNaN(lon) && lon >= -180 && lon <= 180
}

// Parse URL parameters for manual location override
function useUrlParams() {
  const params = new URLSearchParams(window.location.search)
  const latStr = params.get('lat')
  const lonStr = params.get('lon')
  if (latStr && lonStr) {
    const lat = parseFloat(latStr)
    const lon = parseFloat(lonStr)
    if (isValidLatitude(lat) && isValidLongitude(lon)) {
      return { lat, lon }
    }
    // Invalid coordinates - fall back to geolocation
    console.warn(`Invalid coordinates: lat=${latStr}, lon=${lonStr}. Using geolocation.`)
  }
  return null
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 18,
    },
  },
}

// Tab content animation variants
const tabContentVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// Helper to get next event info for sidebar widget
function getNextEventInfo(data: { events?: Array<{ title: string; date: string }> }) {
  if (!data.events || data.events.length === 0) return null
  const nextEvent = data.events[0]
  if (!nextEvent) return null

  const eventDate = new Date(nextEvent.date)
  const now = new Date()
  const diffMs = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  let timeStr = ''
  if (diffDays <= 0) {
    timeStr = 'Today'
  } else if (diffDays === 1) {
    timeStr = 'Tomorrow'
  } else if (diffDays <= 7) {
    timeStr = `In ${diffDays} days`
  } else {
    timeStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return { name: nextEvent.title, time: timeStr }
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('tonight')
  const urlParams = useUrlParams()
  const { lat: geoLat, lon: geoLon, error: geoError, loading: geoLoading } = useGeolocation()
  const currentTime = useCurrentTime()
  const { isPro } = useSubscriptionContext()
  const { isOpen: upgradeModalOpen, highlightFeature, openUpgradeModal, closeUpgradeModal } = useUpgradeModal()

  // Use URL params if provided, otherwise use geolocation
  const lat = urlParams?.lat ?? geoLat
  const lon = urlParams?.lon ?? geoLon
  const skipGeoLoading = urlParams !== null

  const { data, loading: reportLoading, error: reportError, lastUpdated } = useReport(lat, lon)
  const { placeName } = useReverseGeocode(lat, lon)

  // Location object for passing to cards
  const location = lat !== null && lon !== null ? { lat, lon } : undefined

  // Extract data for desktop sidebar widgets
  const nextEventInfo = useMemo(() => {
    if (!data) return null
    return getNextEventInfo(data)
  }, [data])

  return (
    <div className="min-h-screen relative grain-overlay">
      <StarField />

      {/* Desktop Layout with Sidebar - only renders sidebar on lg: screens */}
      <DesktopLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        moonPhase={data?.moon?.phase_name}
        moonIllumination={data?.moon?.illumination}
        cloudCover={data?.weather?.cloud_cover}
        nextEventName={nextEventInfo?.name}
        nextEventTime={nextEventInfo?.time}
      >
      <div className="relative z-10 max-w-5xl lg:max-w-none xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12 py-10 md:py-16 lg:py-8">
        {/* Modern Header */}
        <motion.header
          className="mb-10 lg:mb-6 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Title row with theme toggle - hidden on desktop (shown in sidebar) */}
          <div className="flex items-center justify-center lg:justify-between gap-3 mb-1">
            <div className="flex items-center gap-3 lg:hidden">
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-[#c9a227] transition-colors">Astro</span>
                <span className="text-[#f0f4f8] transition-colors">SKY</span>
              </h1>
              {isPro && <ProBadge size="md" />}
            </div>
            {/* Desktop: Show Pro badge and theme toggle inline */}
            <div className="hidden lg:flex items-center gap-3">
              {isPro && <ProBadge size="md" />}
            </div>
            <ThemeToggle />
          </div>

          {/* Subtitle - hidden on desktop */}
          <p className="text-sm text-[#94a3b8] mb-6 transition-colors text-center lg:hidden">
            Your personal observatory
          </p>

          {/* Location and time info */}
          {lat && lon && (
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm text-center lg:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Location display */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(15,23,42,0.6)] border border-[rgba(148,163,184,0.1)] transition-all">
                <svg className="w-3.5 h-3.5 text-[#c9a227] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[#f0f4f8] font-medium transition-colors">
                  {placeName || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}
                </span>
              </div>

              {/* Time display */}
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-[#4ecdc4] tabular-nums text-base">
                  {formatLocalTime(currentTime)}
                </span>
                {lastUpdated && (
                  <>
                    <span className="text-[#94a3b8]/40">•</span>
                    <span className="status-live">Live</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* Loading state */}
        {((!skipGeoLoading && geoLoading) || reportLoading) && <LoadingSkeleton />}

        {/* Error state */}
        {(!skipGeoLoading && geoError || reportError) && (
          <motion.div
            className="observatory-card p-6 text-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-[#e25822] font-medium text-sm mb-2">Unable to load data</div>
            <p className="text-[#94a3b8]">{geoError || reportError}</p>
          </motion.div>
        )}

        {/* Tab Content */}
        {data && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-4 pb-24 lg:pb-8"
            >
              {/* Tonight Tab */}
              {activeTab === 'tonight' && (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Full-width status banner */}
                  <motion.div variants={itemVariants} className="desktop-full-width">
                    <CurrentSkyStatus sun={data.sun} />
                  </motion.div>

                  {/* Desktop grid for main content */}
                  <div className="desktop-grid">
                    <motion.div variants={itemVariants}>
                      <ObservingConditionsCard weather={data.weather} moon={data.moon} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <NextEvent data={data} />
                    </motion.div>
                    <motion.div variants={itemVariants} className="desktop-full-width xl:col-span-1 2xl:col-span-1">
                      <TonightsBest data={data} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <SmartAlertsCard
                        report={data}
                        onUpgradeClick={() => openUpgradeModal('Smart Clear Sky Alerts')}
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <ObservationPlannerCard
                        report={data}
                        onUpgradeClick={() => openUpgradeModal('Observation Planner')}
                      />
                    </motion.div>
                    <motion.div variants={itemVariants} className="desktop-full-width">
                      <LiveCountdowns
                        sun={data.sun}
                        issPass={data.iss_passes[0]}
                        meteorShower={data.meteors.find(m => m.is_peak)}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Sky Tab */}
              {activeTab === 'sky' && (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Desktop: SkyChart prominent on left, info on right */}
                    <div className="desktop-split">
                      <motion.div variants={itemVariants} className="sky-chart-desktop xl:order-1">
                        <SkyChart planets={data.planets} deepSky={data.deep_sky} />
                      </motion.div>
                      <div className="space-y-4 xl:order-2">
                        <motion.div variants={itemVariants}>
                          <MoonCard moon={data.moon} location={location} placeName={placeName || undefined} />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <SunTimesCard sun={data.sun} />
                        </motion.div>
                      </div>
                    </div>
                    {/* Planets card full width below */}
                    <motion.div variants={itemVariants}>
                      <PlanetsCard planets={data.planets} location={location} placeName={placeName || undefined} />
                    </motion.div>
                  </motion.div>
                </Suspense>
              )}

              {/* Deep Sky Tab */}
              {activeTab === 'deepsky' && (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Deep Sky objects full width */}
                    <motion.div variants={itemVariants} className="desktop-full-width">
                      <DeepSkyCard objects={data.deep_sky} location={location} placeName={placeName || undefined} />
                    </motion.div>
                    {/* Meteors and Events side by side on desktop */}
                    <div className="desktop-split">
                      <motion.div variants={itemVariants}>
                        <MeteorsCard meteors={data.meteors} />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <EventsCard events={data.events} />
                      </motion.div>
                    </div>
                  </motion.div>
                </Suspense>
              )}

              {/* ISS Tab */}
              {activeTab === 'iss' && (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants}>
                      <ISSCard passes={data.iss_passes} />
                    </motion.div>
                  </motion.div>
                </Suspense>
              )}

              {/* Log Tab */}
              {activeTab === 'log' && (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Session notes full width */}
                    <motion.div variants={itemVariants} className="desktop-full-width">
                      <SessionNotesCard location={location ? { ...location, placeName: placeName || undefined } : undefined} />
                    </motion.div>

                    {/* Stats and achievements in grid */}
                    <div className="desktop-grid">
                      <motion.div variants={itemVariants}>
                        <ObservationStats />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <AchievementsCard />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <WeeklyChallengesCard
                          onUpgradeClick={() => openUpgradeModal('Weekly Challenges')}
                        />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <ObservationAnalytics />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <EquipmentProfilesCard />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <NotificationSettings />
                      </motion.div>
                    </div>

                    {/* Nearby observations full width */}
                    <motion.div variants={itemVariants} className="desktop-full-width">
                      <NearbyObservationsCard location={location} />
                    </motion.div>
                  </motion.div>
                </Suspense>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      </DesktopLayout>

      {/* Bottom Tab Navigation - hidden on lg: screens via CSS */}
      {data && <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />}

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Welcome Modal for first-time visitors */}
      <WelcomeModal />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={closeUpgradeModal}
        highlightFeature={highlightFeature}
      />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SubscriptionProvider>
          <NotificationsProvider>
            <ObservationsProvider>
              <SessionsProvider>
                <EquipmentProvider>
                  <AppContent />
                </EquipmentProvider>
              </SessionsProvider>
            </ObservationsProvider>
          </NotificationsProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
