import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarField } from './components/StarField'
import { MoonCard } from './components/MoonCard'
import { SunTimesCard } from './components/SunTimesCard'
import { PlanetsCard } from './components/PlanetsCard'
import { ISSCard } from './components/ISSCard'
import { MeteorsCard } from './components/MeteorsCard'
import { DeepSkyCard } from './components/DeepSkyCard'
import { EventsCard } from './components/EventsCard'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { InstallPrompt } from './components/InstallPrompt'
import { CurrentSkyStatus } from './components/CurrentSkyStatus'
import { NextEvent } from './components/NextEvent'
import { LiveCountdowns } from './components/LiveCountdowns'
import { ObservingConditionsCard } from './components/ObservingConditionsCard'
import { ObservationStats } from './components/ObservationStats'
import { ObservationAnalytics } from './components/ObservationAnalytics'
import { TonightsBest } from './components/TonightsBest'
import { NearbyObservationsCard } from './components/NearbyObservationsCard'
import { WelcomeModal } from './components/WelcomeModal'
import { ThemeToggle } from './components/ThemeToggle'
import { TabNavigation, type TabId } from './components/TabNavigation'
import { useGeolocation } from './hooks/useGeolocation'
import { useReport } from './hooks/useReport'
import { useCurrentTime } from './hooks/useCurrentTime'
import { formatLocalTime } from './lib/timeUtils'
import { useReverseGeocode } from './lib/geocoding'
import { ObservationsProvider } from './context/ObservationsContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { ThemeProvider } from './context/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NotificationSettings } from './components/NotificationSettings'

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

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('tonight')
  const urlParams = useUrlParams()
  const { lat: geoLat, lon: geoLon, error: geoError, loading: geoLoading } = useGeolocation()
  const currentTime = useCurrentTime()

  // Use URL params if provided, otherwise use geolocation
  const lat = urlParams?.lat ?? geoLat
  const lon = urlParams?.lon ?? geoLon
  const skipGeoLoading = urlParams !== null

  const { data, loading: reportLoading, error: reportError, lastUpdated } = useReport(lat, lon)
  const { placeName } = useReverseGeocode(lat, lon)

  // Location object for passing to cards
  const location = lat !== null && lon !== null ? { lat, lon } : undefined

  return (
    <div className="min-h-screen relative grain-overlay">
      <StarField />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-16">
        {/* Modern Header */}
        <motion.header
          className="mb-10 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Title row with theme toggle */}
          <div className="flex items-center justify-center gap-3 mb-1">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-[#c9a227] transition-colors">Astro</span>
              <span className="text-[#f0f4f8] transition-colors">SKY</span>
            </h1>
            <ThemeToggle />
          </div>

          {/* Subtitle */}
          <p className="text-sm text-[#94a3b8] mb-6 transition-colors text-center">
            Your personal observatory
          </p>

          {/* Location and time info */}
          {lat && lon && (
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-center"
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
              className="space-y-4 pb-24"
            >
              {/* Tonight Tab */}
              {activeTab === 'tonight' && (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <CurrentSkyStatus sun={data.sun} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <ObservingConditionsCard weather={data.weather} moon={data.moon} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <NextEvent data={data} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <TonightsBest data={data} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <LiveCountdowns
                      sun={data.sun}
                      issPass={data.iss_passes[0]}
                      meteorShower={data.meteors.find(m => m.is_peak)}
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Sky Tab */}
              {activeTab === 'sky' && (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <MoonCard moon={data.moon} location={location} placeName={placeName || undefined} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <SunTimesCard sun={data.sun} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <PlanetsCard planets={data.planets} location={location} placeName={placeName || undefined} />
                  </motion.div>
                </motion.div>
              )}

              {/* Deep Sky Tab */}
              {activeTab === 'deepsky' && (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <DeepSkyCard objects={data.deep_sky} location={location} placeName={placeName || undefined} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <MeteorsCard meteors={data.meteors} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <EventsCard events={data.events} />
                  </motion.div>
                </motion.div>
              )}

              {/* ISS Tab */}
              {activeTab === 'iss' && (
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
              )}

              {/* Log Tab */}
              {activeTab === 'log' && (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <ObservationStats />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <ObservationAnalytics />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <NotificationSettings />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <NearbyObservationsCard location={location} />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Tab Navigation */}
      {data && <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />}

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Welcome Modal for first-time visitors */}
      <WelcomeModal />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationsProvider>
          <ObservationsProvider>
            <AppContent />
          </ObservationsProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
