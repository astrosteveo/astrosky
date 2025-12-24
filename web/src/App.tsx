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
import { useGeolocation } from './hooks/useGeolocation'
import { useReport } from './hooks/useReport'
import { useCurrentTime } from './hooks/useCurrentTime'
import { formatLocalTime } from './lib/timeUtils'

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

function App() {
  const urlParams = useUrlParams()
  const { lat: geoLat, lon: geoLon, error: geoError, loading: geoLoading } = useGeolocation()
  const currentTime = useCurrentTime()

  // Use URL params if provided, otherwise use geolocation
  const lat = urlParams?.lat ?? geoLat
  const lon = urlParams?.lon ?? geoLon
  const skipGeoLoading = urlParams !== null

  const { data, loading: reportLoading, error: reportError, lastUpdated } = useReport(lat, lon)

  return (
    <div className="min-h-screen relative">
      <StarField />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-slate-50 mb-2">
            Tonight's Sky
          </h1>
          {lat && lon && (
            <div className="space-y-2">
              <p className="text-slate-400">
                {lat.toFixed(2)}°, {lon.toFixed(2)}°
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Local Time:</span>
                  <span className="font-mono font-medium text-slate-300 tabular-nums">
                    {formatLocalTime(currentTime)}
                  </span>
                </div>
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>•</span>
                    <span>
                      Updated {Math.floor((currentTime.getTime() - lastUpdated.getTime()) / 60000)}m ago
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Loading state */}
        {((!skipGeoLoading && geoLoading) || reportLoading) && <LoadingSkeleton />}

        {/* Error state */}
        {(!skipGeoLoading && geoError || reportError) && (
          <div className="text-center text-red-400 py-12">
            {geoError || reportError}
          </div>
        )}

        {/* Data display */}
        {data && (
          <div className="grid gap-6">
            {/* Live Sky Status */}
            <CurrentSkyStatus sun={data.sun} />

            {/* Next Event Highlight */}
            <NextEvent data={data} />

            {/* Live Countdowns */}
            <LiveCountdowns
              sun={data.sun}
              issPass={data.iss_passes[0]}
              meteorShower={data.meteors.find(m => m.is_peak)}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <MoonCard moon={data.moon} />
              <SunTimesCard sun={data.sun} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <PlanetsCard planets={data.planets} />
              <ISSCard passes={data.iss_passes} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <MeteorsCard meteors={data.meteors} />
              <DeepSkyCard objects={data.deep_sky} />
            </div>

            <EventsCard events={data.events} />
          </div>
        )}
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  )
}

export default App
