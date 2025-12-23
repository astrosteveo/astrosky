import { StarField } from './components/StarField'
import { MoonCard } from './components/MoonCard'
import { PlanetsCard } from './components/PlanetsCard'
import { ISSCard } from './components/ISSCard'
import { MeteorsCard } from './components/MeteorsCard'
import { DeepSkyCard } from './components/DeepSkyCard'
import { EventsCard } from './components/EventsCard'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { useGeolocation } from './hooks/useGeolocation'
import { useReport } from './hooks/useReport'

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

  // Use URL params if provided, otherwise use geolocation
  const lat = urlParams?.lat ?? geoLat
  const lon = urlParams?.lon ?? geoLon
  const skipGeoLoading = urlParams !== null

  const { data, loading: reportLoading, error: reportError } = useReport(lat, lon)

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
            <p className="text-slate-400">
              {lat.toFixed(2)}°, {lon.toFixed(2)}°
            </p>
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
            <MoonCard moon={data.moon} />

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
    </div>
  )
}

export default App
