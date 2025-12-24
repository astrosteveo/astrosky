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
import { useGeolocation } from './hooks/useGeolocation'
import { useReport } from './hooks/useReport'
import { useCurrentTime } from './hooks/useCurrentTime'
import { formatLocalTime } from './lib/timeUtils'
import { useReverseGeocode } from './lib/geocoding'
import { ObservationsProvider } from './context/ObservationsContext'

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
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
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
    <div className="min-h-screen relative">
      <StarField />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header with fade-in */}
        <motion.header
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-50 mb-1">
            Astro<span className="text-cyan-400">SKY</span>
          </h1>
          <p className="text-slate-500 text-sm mb-4">Your window to the cosmos</p>
          {lat && lon && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-slate-400">
                {placeName || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}
                {placeName && (
                  <span className="text-slate-500 text-sm ml-2">
                    ({lat.toFixed(2)}°, {lon.toFixed(2)}°)
                  </span>
                )}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Local Time:</span>
                  <span className="font-mono font-medium text-cyan-400 tabular-nums tracking-wider">
                    {formatLocalTime(currentTime)}
                  </span>
                </div>
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-slate-600">•</span>
                    <span>
                      Updated {Math.floor((currentTime.getTime() - lastUpdated.getTime()) / 60000)}m ago
                    </span>
                  </div>
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
            className="text-center text-red-400 py-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {geoError || reportError}
          </motion.div>
        )}

        {/* Data display with staggered animations */}
        {data && (
          <motion.div
            className="grid gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Live Sky Status */}
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

            {/* Observation Stats */}
            <motion.div className="grid md:grid-cols-2 gap-6" variants={itemVariants}>
              <ObservationStats />
              <NearbyObservationsCard location={location} />
            </motion.div>

            <motion.div className="grid md:grid-cols-2 gap-6" variants={itemVariants}>
              <MoonCard moon={data.moon} location={location} placeName={placeName || undefined} />
              <SunTimesCard sun={data.sun} />
            </motion.div>

            <motion.div className="grid md:grid-cols-2 gap-6" variants={itemVariants}>
              <PlanetsCard planets={data.planets} location={location} placeName={placeName || undefined} />
              <ISSCard passes={data.iss_passes} />
            </motion.div>

            <motion.div className="grid md:grid-cols-2 gap-6" variants={itemVariants}>
              <MeteorsCard meteors={data.meteors} />
              <DeepSkyCard objects={data.deep_sky} location={location} placeName={placeName || undefined} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <EventsCard events={data.events} />
            </motion.div>
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
    <ObservationsProvider>
      <AppContent />
    </ObservationsProvider>
  )
}

export default App
