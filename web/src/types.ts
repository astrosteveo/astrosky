export interface Location {
  lat: number
  lon: number
}

export interface SunTimes {
  sunrise: string
  sunset: string
  astronomical_twilight_start: string
  astronomical_twilight_end: string
}

export interface MoonInfo {
  phase_name: string
  illumination: number
  darkness_quality: string
  moonrise: string | null
  moonset: string | null
}

export interface PlanetInfo {
  name: string
  direction: string
  azimuth: number
  altitude: number
  rise_time: string | null
  set_time: string | null
  description: string
}

export interface ISSPass {
  start_time: string
  duration_minutes: number
  max_altitude: number
  start_direction: string
  end_direction: string
  brightness: string
  magnitude: number // Visual magnitude (lower = brighter, e.g., -3.5)
}

export interface ShowerInfo {
  name: string
  zhr: number
  peak_date: string
  radiant_constellation: string
  is_peak: boolean
}

export interface DSOInfo {
  id: string
  name: string
  constellation: string
  mag: number
  size: number
  type: string
  equipment: string
  tip: string
  altitude: number
  azimuth: number
}

export interface AstroEvent {
  type: string
  date: string
  title: string
  description: string
  bodies: string[]
}

export interface ObservingConditions {
  cloud_cover: number // 0-100 percentage, -1 if unknown
  humidity: number // 0-100 percentage, -1 if unknown
  visibility: number // km, -1 if unknown
  wind_speed: number // km/h, -1 if unknown
  temperature: number // Celsius, -1 if unknown
  condition: string // Excellent, Good, Fair, Poor, Unknown
  summary: string // Human-readable summary
}

export interface AuroraForecast {
  kp_current: number // Current Kp index (0-9)
  kp_24h_max: number // Maximum Kp in next 24 hours
  geomagnetic_storm: boolean // True if Kp >= 5
  storm_level: string // G0 (none) to G5 (extreme)
  visibility_probability: number // 0-100 for user's location
  visible_latitude: number // Minimum latitude where aurora may be visible
  best_time: string // Best viewing time advice
  activity_level: string // Quiet, Unsettled, Active, Storm
  summary: string // Human-readable summary
}

export interface SatellitePass {
  satellite_name: string
  satellite_type: string // starlink, station, telescope, other
  norad_id: number
  start_time: string // ISO format
  duration_minutes: number
  max_altitude: number // degrees above horizon
  start_direction: string
  end_direction: string
  brightness: string // Brilliant!, Bright, Moderate, Faint
  magnitude: number
}

export interface SatelliteInfo {
  total_passes: number
  starlink_passes: number
  station_passes: number
  next_bright_pass: SatellitePass | null
  passes: SatellitePass[]
}

export interface SkyReport {
  date: string
  location: Location
  sun: SunTimes
  moon: MoonInfo
  weather: ObservingConditions | null
  aurora: AuroraForecast | null
  satellites: SatelliteInfo | null
  planets: PlanetInfo[]
  iss_passes: ISSPass[]
  meteors: ShowerInfo[]
  deep_sky: DSOInfo[]
  events: AstroEvent[]
}
