// Equipment profile types for personalized DSO recommendations

export type EquipmentProfileType = 'binoculars' | 'telescope' | 'camera-lens'

export interface BinocularsProfile {
  type: 'binoculars'
  name: string
  aperture: number // mm (e.g., 50 for 10x50)
  magnification: number // e.g., 10 for 10x50
}

export interface TelescopeProfile {
  type: 'telescope'
  name: string
  aperture: number // mm (e.g., 200 for 8" scope)
  focalLength: number // mm
  mount: 'alt-az' | 'equatorial' | 'dobsonian'
}

export interface CameraLensProfile {
  type: 'camera-lens'
  name: string
  aperture: number // mm (lens diameter)
  focalLength: number // mm
}

export type EquipmentProfile = BinocularsProfile | TelescopeProfile | CameraLensProfile

export interface SavedEquipment {
  id: string
  profile: EquipmentProfile
  isDefault: boolean
  createdAt: string
}

// Calculate limiting magnitude based on aperture
// Formula: Limiting mag = 2 + 5 * log10(aperture in mm)
export function calculateLimitingMagnitude(apertureInMm: number): number {
  return Math.round((2 + 5 * Math.log10(apertureInMm)) * 10) / 10
}

// Common equipment presets for quick selection
type BinoPreset = Omit<BinocularsProfile, 'name'>
type ScopePreset = Omit<TelescopeProfile, 'name'>

export const BINOCULAR_PRESETS: Record<string, BinoPreset> = {
  'bino-7x35': { type: 'binoculars', aperture: 35, magnification: 7 },
  'bino-7x50': { type: 'binoculars', aperture: 50, magnification: 7 },
  'bino-10x50': { type: 'binoculars', aperture: 50, magnification: 10 },
  'bino-15x70': { type: 'binoculars', aperture: 70, magnification: 15 },
  'bino-20x80': { type: 'binoculars', aperture: 80, magnification: 20 },
  'bino-25x100': { type: 'binoculars', aperture: 100, magnification: 25 },
}

export const TELESCOPE_PRESETS: Record<string, ScopePreset> = {
  'scope-70mm': { type: 'telescope', aperture: 70, focalLength: 400, mount: 'alt-az' },
  'scope-80mm': { type: 'telescope', aperture: 80, focalLength: 400, mount: 'alt-az' },
  'scope-102mm': { type: 'telescope', aperture: 102, focalLength: 660, mount: 'equatorial' },
  'scope-114mm': { type: 'telescope', aperture: 114, focalLength: 900, mount: 'equatorial' },
  'scope-130mm': { type: 'telescope', aperture: 130, focalLength: 650, mount: 'equatorial' },
  'scope-150mm': { type: 'telescope', aperture: 150, focalLength: 750, mount: 'equatorial' },
  'scope-6inch-dob': { type: 'telescope', aperture: 150, focalLength: 1200, mount: 'dobsonian' },
  'scope-8inch-dob': { type: 'telescope', aperture: 200, focalLength: 1200, mount: 'dobsonian' },
  'scope-10inch-dob': { type: 'telescope', aperture: 254, focalLength: 1270, mount: 'dobsonian' },
  'scope-12inch-dob': { type: 'telescope', aperture: 305, focalLength: 1500, mount: 'dobsonian' },
}

export const EQUIPMENT_PRESETS: Record<string, BinoPreset | ScopePreset> = {
  ...BINOCULAR_PRESETS,
  ...TELESCOPE_PRESETS,
}

// Human-readable descriptions
export const PRESET_LABELS: Record<string, string> = {
  'bino-7x35': '7x35 Compact',
  'bino-7x50': '7x50 Standard',
  'bino-10x50': '10x50 Standard',
  'bino-15x70': '15x70 Astronomy',
  'bino-20x80': '20x80 Giant',
  'bino-25x100': '25x100 Giant',
  'scope-70mm': '70mm Refractor',
  'scope-80mm': '80mm Refractor',
  'scope-102mm': '102mm (4") Refractor',
  'scope-114mm': '114mm (4.5") Reflector',
  'scope-130mm': '130mm (5") Reflector',
  'scope-150mm': '150mm (6") Reflector',
  'scope-6inch-dob': '6" Dobsonian',
  'scope-8inch-dob': '8" Dobsonian',
  'scope-10inch-dob': '10" Dobsonian',
  'scope-12inch-dob': '12" Dobsonian',
}

// Map DSO equipment requirements to minimum apertures
export const DSO_EQUIPMENT_MAP: Record<string, { minAperture: number; description: string }> = {
  'naked eye': { minAperture: 0, description: 'Visible with naked eye' },
  'binoculars': { minAperture: 35, description: 'Visible with binoculars' },
  'small-scope': { minAperture: 70, description: 'Requires small telescope' },
  'telescope': { minAperture: 100, description: 'Requires telescope' },
  'large-scope': { minAperture: 200, description: 'Requires large telescope' },
}

// Check if equipment can view a DSO based on its requirements
export function canViewWithEquipment(
  dsoEquipment: string,
  userAperture: number
): { canView: boolean; quality: 'optimal' | 'adequate' | 'challenging' } {
  const requirement = DSO_EQUIPMENT_MAP[dsoEquipment] || DSO_EQUIPMENT_MAP['telescope']

  if (userAperture < requirement.minAperture) {
    return { canView: false, quality: 'challenging' }
  }

  // Optimal if aperture is 50%+ larger than minimum
  if (userAperture >= requirement.minAperture * 1.5) {
    return { canView: true, quality: 'optimal' }
  }

  // Adequate if meets minimum
  return { canView: true, quality: 'adequate' }
}

// Get equipment icon based on type
export function getEquipmentIcon(profile: EquipmentProfile): string {
  switch (profile.type) {
    case 'binoculars': return '🔭'
    case 'telescope': return '🔬'
    case 'camera-lens': return '📷'
    default: return '✨'
  }
}

// Format equipment specs as a readable string
export function formatEquipmentSpecs(profile: EquipmentProfile): string {
  switch (profile.type) {
    case 'binoculars':
      return `${profile.magnification}x${profile.aperture}mm`
    case 'telescope':
      return `${profile.aperture}mm f/${Math.round(profile.focalLength / profile.aperture)}`
    case 'camera-lens':
      return `${profile.focalLength}mm f/${Math.round(profile.focalLength / profile.aperture)}`
    default:
      return ''
  }
}
