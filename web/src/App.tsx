import { motion } from 'framer-motion'
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
import { ObservationStats } from './components/ObservationStats'
import { NearbyObservationsCard } from './components/NearbyObservationsCard'
import { WelcomeModal } from './components/WelcomeModal'
import { ThemeToggle } from './components/ThemeToggle'
import { useGeolocation } from './hooks/useGeolocation'
import { useReport } from './hooks/useReport'
import { useCurrentTime } from './hooks/useCurrentTime'
import { formatLocalTime } from './lib/timeUtils'
import { useReverseGeocode } from './lib/geocoding'
import { ObservationsProvider } from './context/ObservationsContext'
import { ThemeProvider } from './context/ThemeContext'

// Parse URL parameters for manual location override
function useUrlParams() {
  const params = new URLSearchParams(window.location.search)
  const lat = params.get('lat')
  const lon = params.get('lon')
  if (lat && lon) {
    return { lat: parseFloat(lat), lon: parseFloat(lon) }
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

function AppContent() {
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
        {/* Elegant Header - Celestial Atlas Style */}
        <motion.header
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Theme Toggle */}
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>

          {/* Decorative top line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-[#c9a227]/40 to-[#c9a227]/60" />
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a227]/60" />
              <span className="w-1 h-1 rounded-full bg-[#c9a227]/40" />
              <span className="w-0.5 h-0.5 rounded-full bg-[#c9a227]/30" />
            </div>
            <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent via-[#c9a227]/40 to-[#c9a227]/60" />
          </div>

          {/* Main title */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide mb-2">
            <span className="text-celestial">Astro</span>
            <span className="text-[#f5f0e1]">SKY</span>
          </h1>

          {/* Subtitle */}
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#c9a227]/70 mb-6">
            Celestial Observatory
          </p>

          {/* Location and time info */}
          {lat && lon && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Location display */}
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-[#c9a227]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[#f5f0e1] font-display text-lg">
                  {placeName || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}
                </span>
                {placeName && (
                  <span className="text-[#c4baa6] text-sm font-mono">
                    {lat.toFixed(2)}°N, {Math.abs(lon).toFixed(2)}°{lon < 0 ? 'W' : 'E'}
                  </span>
                )}
              </div>

              {/* Time display */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="data-label">Local Time</span>
                  <span className="font-mono font-medium text-[#4ecdc4] tabular-nums tracking-wider text-lg">
                    {formatLocalTime(currentTime)}
                  </span>
                </div>
                {lastUpdated && (
                  <>
                    <span className="text-[#c9a227]/30">•</span>
                    <div className="flex items-center gap-2">
                      <span className="status-live">Live</span>
                      <span className="text-[#c4baa6] text-xs">
                        Updated {Math.floor((currentTime.getTime() - lastUpdated.getTime()) / 60000)}m ago
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Decorative bottom line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-[#c9a227]/30" />
            <svg className="w-6 h-6 text-[#c9a227]/40" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </svg>
            <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-[#c9a227]/30" />
          </div>
        </motion.header>

        {/* Loading state */}
        {((!skipGeoLoading && geoLoading) || reportLoading) && <LoadingSkeleton />}

        {/* Error state */}
        {(!skipGeoLoading && geoError || reportError) && (
          <motion.div
            className="observatory-card p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-[#e25822] font-mono text-sm mb-2">OBSERVATION ERROR</div>
            <p className="text-[#f5f0e1]">{geoError || reportError}</p>
          </motion.div>
        )}

        {/* Data display with staggered animations */}
        {data && (
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Live Sky Status - Full width hero */}
            <motion.div variants={itemVariants}>
              <CurrentSkyStatus sun={data.sun} />
            </motion.div>

            {/* Next Event Highlight */}
            <motion.div variants={itemVariants}>
              <NextEvent data={data} />
            </motion.div>

            {/* Live Countdowns */}
            <motion.div variants={itemVariants}>
              <LiveCountdowns
                sun={data.sun}
                issPass={data.iss_passes[0]}
                meteorShower={data.meteors.find(m => m.is_peak)}
              />
            </motion.div>

            {/* Observation Stats Row */}
            <motion.div className="grid md:grid-cols-2 gap-6" variants={itemVariants}>
              <ObservationStats />
              <NearbyObservationsCard location={location} />
            </motion.div>

            {/* Primary data row - Moon & Sun */}
            <motion.div className="grid md:grid-cols-2 gap-6" variants={itemVariants}>
              <MoonCard moon={data.moon} location={location} placeName={placeName || undefined} />
              <SunTimesCard sun={data.sun} />
            </motion.div>

            {/* Secondary data row - Planets & ISS */}
            <motion.div className="grid md:grid-cols-2 gap-6" variants={itemVariants}>
              <PlanetsCard planets={data.planets} location={location} placeName={placeName || undefined} />
              <ISSCard passes={data.iss_passes} />
            </motion.div>

            {/* Tertiary data row - Meteors & Deep Sky */}
            <motion.div className="grid md:grid-cols-2 gap-6" variants={itemVariants}>
              <MeteorsCard meteors={data.meteors} />
              <DeepSkyCard objects={data.deep_sky} location={location} placeName={placeName || undefined} />
            </motion.div>

            {/* Events - Full width */}
            <motion.div variants={itemVariants}>
              <EventsCard events={data.events} />
            </motion.div>

            {/* Footer decoration */}
            <motion.footer
              className="text-center pt-8 pb-4"
              variants={itemVariants}
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#c9a227]/20" />
                <span className="text-[#c9a227]/40 text-lg">✦</span>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#c9a227]/20" />
              </div>
              <p className="font-mono text-xs text-[#c4baa6]/50 tracking-wider">
                Clear skies ahead
              </p>
            </motion.footer>
          </motion.div>
        )}
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Welcome Modal for first-time visitors */}
      <WelcomeModal />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ObservationsProvider>
        <AppContent />
      </ObservationsProvider>
    </ThemeProvider>
  )
}

export default App
