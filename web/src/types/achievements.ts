// Achievement system types and definitions

export type AchievementCategory =
  | 'observations'
  | 'messier'
  | 'planets'
  | 'streaks'
  | 'equipment'
  | 'objects'
  | 'dedication'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  tier: AchievementTier
  requirement: number // Target value to earn
  checkType: 'count' | 'streak' | 'unique' | 'custom'
}

export interface EarnedAchievement {
  achievementId: string
  earnedAt: string // ISO date
  progress: number // Current value when earned
}

export interface AchievementProgress {
  definition: AchievementDefinition
  current: number
  earned: boolean
  earnedAt?: string
  percentComplete: number
}

// All available achievements
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // === Observation Count Milestones ===
  {
    id: 'first-light',
    name: 'First Light',
    description: 'Log your first observation',
    icon: '✨',
    category: 'observations',
    tier: 'bronze',
    requirement: 1,
    checkType: 'count',
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Log 10 observations',
    icon: '🌟',
    category: 'observations',
    tier: 'bronze',
    requirement: 10,
    checkType: 'count',
  },
  {
    id: 'dedicated-observer',
    name: 'Dedicated Observer',
    description: 'Log 25 observations',
    icon: '🔭',
    category: 'observations',
    tier: 'silver',
    requirement: 25,
    checkType: 'count',
  },
  {
    id: 'seasoned-stargazer',
    name: 'Seasoned Stargazer',
    description: 'Log 50 observations',
    icon: '🌌',
    category: 'observations',
    tier: 'gold',
    requirement: 50,
    checkType: 'count',
  },
  {
    id: 'master-astronomer',
    name: 'Master Astronomer',
    description: 'Log 100 observations',
    icon: '👨‍🔬',
    category: 'observations',
    tier: 'platinum',
    requirement: 100,
    checkType: 'count',
  },

  // === Messier Marathon ===
  {
    id: 'messier-beginner',
    name: 'Deep Sky Novice',
    description: 'Observe 10 Messier objects',
    icon: '🌀',
    category: 'messier',
    tier: 'bronze',
    requirement: 10,
    checkType: 'unique',
  },
  {
    id: 'messier-hunter',
    name: 'Messier Hunter',
    description: 'Observe 25 Messier objects',
    icon: '🔍',
    category: 'messier',
    tier: 'silver',
    requirement: 25,
    checkType: 'unique',
  },
  {
    id: 'messier-explorer',
    name: 'Deep Sky Explorer',
    description: 'Observe 50 Messier objects',
    icon: '🚀',
    category: 'messier',
    tier: 'gold',
    requirement: 50,
    checkType: 'unique',
  },
  {
    id: 'messier-marathon',
    name: 'Messier Marathon',
    description: 'Observe all 110 Messier objects',
    icon: '🏆',
    category: 'messier',
    tier: 'platinum',
    requirement: 110,
    checkType: 'unique',
  },

  // === Planet Collector ===
  {
    id: 'planet-spotter',
    name: 'Planet Spotter',
    description: 'Observe 3 different planets',
    icon: '🪐',
    category: 'planets',
    tier: 'bronze',
    requirement: 3,
    checkType: 'unique',
  },
  {
    id: 'solar-system-tourist',
    name: 'Solar System Tourist',
    description: 'Observe 5 different planets',
    icon: '🌍',
    category: 'planets',
    tier: 'silver',
    requirement: 5,
    checkType: 'unique',
  },
  {
    id: 'planet-collector',
    name: 'Planet Collector',
    description: 'Observe all 7 naked-eye planets',
    icon: '💫',
    category: 'planets',
    tier: 'gold',
    requirement: 7,
    checkType: 'unique',
  },

  // === Observation Streaks ===
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Observe 3 nights in a row',
    icon: '🔥',
    category: 'streaks',
    tier: 'bronze',
    requirement: 3,
    checkType: 'streak',
  },
  {
    id: 'week-streak',
    name: 'Weekly Dedication',
    description: 'Observe 7 nights in a row',
    icon: '📅',
    category: 'streaks',
    tier: 'silver',
    requirement: 7,
    checkType: 'streak',
  },
  {
    id: 'fortnight-streak',
    name: 'Fortnight Focus',
    description: 'Observe 14 nights in a row',
    icon: '🌙',
    category: 'streaks',
    tier: 'gold',
    requirement: 14,
    checkType: 'streak',
  },
  {
    id: 'month-streak',
    name: 'Lunar Cycle',
    description: 'Observe 30 nights in a row',
    icon: '🌕',
    category: 'streaks',
    tier: 'platinum',
    requirement: 30,
    checkType: 'streak',
  },

  // === Equipment Variety ===
  {
    id: 'naked-eye-observer',
    name: 'Naked Eye Observer',
    description: 'Log an observation with naked eye',
    icon: '👁️',
    category: 'equipment',
    tier: 'bronze',
    requirement: 1,
    checkType: 'custom',
  },
  {
    id: 'binocular-user',
    name: 'Binocular User',
    description: 'Log an observation with binoculars',
    icon: '🔭',
    category: 'equipment',
    tier: 'bronze',
    requirement: 1,
    checkType: 'custom',
  },
  {
    id: 'telescope-user',
    name: 'Telescope User',
    description: 'Log an observation with a telescope',
    icon: '🔬',
    category: 'equipment',
    tier: 'bronze',
    requirement: 1,
    checkType: 'custom',
  },
  {
    id: 'equipment-variety',
    name: 'Multi-Instrumentalist',
    description: 'Use all three equipment types',
    icon: '🎯',
    category: 'equipment',
    tier: 'silver',
    requirement: 3,
    checkType: 'custom',
  },

  // === Object Type Variety ===
  {
    id: 'iss-spotter',
    name: 'ISS Spotter',
    description: 'Spot the International Space Station',
    icon: '🛸',
    category: 'objects',
    tier: 'bronze',
    requirement: 1,
    checkType: 'custom',
  },
  {
    id: 'iss-regular',
    name: 'Station Tracker',
    description: 'Spot the ISS 5 times',
    icon: '🚀',
    category: 'objects',
    tier: 'silver',
    requirement: 5,
    checkType: 'custom',
  },
  {
    id: 'meteor-watcher',
    name: 'Meteor Watcher',
    description: 'Observe a meteor shower',
    icon: '☄️',
    category: 'objects',
    tier: 'bronze',
    requirement: 1,
    checkType: 'custom',
  },
  {
    id: 'meteor-chaser',
    name: 'Meteor Chaser',
    description: 'Observe 5 different meteor showers',
    icon: '💥',
    category: 'objects',
    tier: 'gold',
    requirement: 5,
    checkType: 'custom',
  },
  {
    id: 'moon-observer',
    name: 'Lunar Observer',
    description: 'Observe the Moon',
    icon: '🌓',
    category: 'objects',
    tier: 'bronze',
    requirement: 1,
    checkType: 'custom',
  },

  // === Dedication ===
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Log 10 observations after midnight',
    icon: '🦉',
    category: 'dedication',
    tier: 'silver',
    requirement: 10,
    checkType: 'custom',
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Log 5 observations before sunrise (4-6 AM)',
    icon: '🐦',
    category: 'dedication',
    tier: 'silver',
    requirement: 5,
    checkType: 'custom',
  },
  {
    id: 'variety-seeker',
    name: 'Variety Seeker',
    description: 'Observe 20 unique objects',
    icon: '🎨',
    category: 'dedication',
    tier: 'silver',
    requirement: 20,
    checkType: 'unique',
  },
  {
    id: 'object-master',
    name: 'Cosmic Collector',
    description: 'Observe 50 unique objects',
    icon: '🏅',
    category: 'dedication',
    tier: 'gold',
    requirement: 50,
    checkType: 'unique',
  },
]

// Tier colors for styling
export const TIER_COLORS: Record<AchievementTier, { bg: string; border: string; text: string }> = {
  bronze: {
    bg: 'rgba(205, 127, 50, 0.15)',
    border: 'rgba(205, 127, 50, 0.4)',
    text: '#cd7f32',
  },
  silver: {
    bg: 'rgba(192, 192, 192, 0.15)',
    border: 'rgba(192, 192, 192, 0.4)',
    text: '#c0c0c0',
  },
  gold: {
    bg: 'rgba(255, 215, 0, 0.15)',
    border: 'rgba(255, 215, 0, 0.4)',
    text: '#ffd700',
  },
  platinum: {
    bg: 'rgba(229, 228, 226, 0.15)',
    border: 'rgba(229, 228, 226, 0.5)',
    text: '#e5e4e2',
  },
}

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  observations: 'Observations',
  messier: 'Messier Catalog',
  planets: 'Planets',
  streaks: 'Streaks',
  equipment: 'Equipment',
  objects: 'Object Types',
  dedication: 'Dedication',
}
