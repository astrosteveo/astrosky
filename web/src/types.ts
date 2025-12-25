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

export interface SkyReport {
  date: string
  location: Location
  sun: SunTimes
  moon: MoonInfo
  weather: ObservingConditions | null
  planets: PlanetInfo[]
  iss_passes: ISSPass[]
  meteors: ShowerInfo[]
  deep_sky: DSOInfo[]
  events: AstroEvent[]
}
