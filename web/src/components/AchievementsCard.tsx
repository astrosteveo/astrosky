import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'
import { useObservationsContext } from '../context/ObservationsContext'
import { useAchievements } from '../hooks/useAchievements'
import {
  TIER_COLORS,
  CATEGORY_LABELS,
  type AchievementProgress,
  type AchievementCategory,
} from '../types/achievements'

function AchievementBadge({
  achievement,
  size = 'normal',
}: {
  achievement: AchievementProgress
  size?: 'small' | 'normal'
}) {
  const { definition, earned, percentComplete, current } = achievement
  const tierColor = TIER_COLORS[definition.tier]
  const isSmall = size === 'small'

  return (
    <motion.div
      className={`relative flex flex-col items-center ${isSmall ? 'p-2' : 'p-3'}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {/* Badge circle */}
      <div
        className={`relative ${isSmall ? 'w-12 h-12' : 'w-16 h-16'} rounded-full flex items-center justify-center transition-all duration-300`}
        style={{
          background: earned ? tierColor.bg : 'rgba(15, 23, 42, 0.6)',
          border: `2px solid ${earned ? tierColor.border : 'rgba(196, 186, 166, 0.2)'}`,
          boxShadow: earned ? `0 0 20px ${tierColor.border}` : 'none',
        }}
      >
        {/* Icon */}
        <span
          className={`${isSmall ? 'text-xl' : 'text-2xl'} ${earned ? '' : 'grayscale opacity-40'}`}
        >
          {definition.icon}
        </span>

        {/* Progress ring for unearned */}
        {!earned && percentComplete > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={tierColor.border}
              strokeWidth="4"
              strokeDasharray={`${percentComplete * 2.89} 289`}
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        )}

        {/* Earned checkmark */}
        {earned && (
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
            style={{ background: tierColor.text }}
          >
            <span className="text-[#0a0e27]">✓</span>
          </div>
        )}
      </div>

      {/* Name */}
      <p
        className={`mt-2 text-center font-medium ${isSmall ? 'text-xs' : 'text-sm'} ${earned ? 'text-[#f5f0e1]' : 'text-[#c4baa6]/60'}`}
        style={{ color: earned ? tierColor.text : undefined }}
      >
        {definition.name}
      </p>

      {/* Progress for unearned */}
      {!earned && !isSmall && (
        <p className="text-xs text-[#c4baa6]/50 mt-1">
          {current}/{definition.requirement}
        </p>
      )}
    </motion.div>
  )
}

function CategorySection({
  category,
  achievements,
  expanded,
  onToggle,
}: {
  category: AchievementCategory
  achievements: AchievementProgress[]
  expanded: boolean
  onToggle: () => void
}) {
  const earned = achievements.filter((a) => a.earned).length
  const total = achievements.length

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[rgba(15,23,42,0.4)] hover:bg-[rgba(15,23,42,0.6)] transition-colors"
      >
        <span className="text-sm font-medium text-[#f5f0e1]">
          {CATEGORY_LABELS[category]}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#c4baa6]">
            {earned}/{total}
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-[#c4baa6]"
          >
            ▼
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-2 pt-3">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.definition.id}
                  achievement={achievement}
                  size="small"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AchievementsCard() {
  const { observations } = useObservationsContext()
  const { achievements, earnedCount, totalCount, nextToEarn } =
    useAchievements(observations)

  const [expandedCategories, setExpandedCategories] = useState<Set<AchievementCategory>>(
    new Set()
  )
  const [showAll, setShowAll] = useState(false)

  const toggleCategory = (category: AchievementCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // Group achievements by category
  const byCategory = achievements.reduce(
    (acc, achievement) => {
      const cat = achievement.definition.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(achievement)
      return acc
    },
    {} as Record<AchievementCategory, AchievementProgress[]>
  )

  // Get recently earned (sorted by tier, platinum first)
  const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 }
  const recentlyEarned = achievements
    .filter((a) => a.earned)
    .sort((a, b) => tierOrder[a.definition.tier] - tierOrder[b.definition.tier])
    .slice(0, 4)

  if (observations.length === 0) {
    return (
      <GlassCard title="Achievements" icon="🏆" glowColor="brass">
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(255,215,0,0.1)] flex items-center justify-center border border-[rgba(255,215,0,0.2)]">
            <span className="text-3xl grayscale opacity-40">🏆</span>
          </div>
          <p className="text-[#c4baa6]">Start observing to earn achievements</p>
          <p className="text-[#c4baa6]/60 text-sm mt-1">
            {totalCount} achievements to unlock
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="Achievements" icon="🏆" glowColor="brass">
      {/* Summary Stats */}
      <div className="flex items-center justify-between mb-4 px-3 py-3 bg-[rgba(15,23,42,0.4)] rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#ffd700]">{earnedCount}</p>
          <p className="text-xs text-[#c4baa6]">Earned</p>
        </div>
        <div className="h-8 w-px bg-[rgba(196,186,166,0.2)]" />
        <div className="text-center">
          <p className="text-2xl font-bold text-[#c4baa6]">{totalCount - earnedCount}</p>
          <p className="text-xs text-[#c4baa6]">Remaining</p>
        </div>
        <div className="h-8 w-px bg-[rgba(196,186,166,0.2)]" />
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4ecdc4]">
            {Math.round((earnedCount / totalCount) * 100)}%
          </p>
          <p className="text-xs text-[#c4baa6]">Complete</p>
        </div>
      </div>

      {/* Recently Earned */}
      {recentlyEarned.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-[#f5f0e1] mb-2">Earned Badges</h3>
          <div className="grid grid-cols-4 gap-1 mb-4">
            {recentlyEarned.map((achievement) => (
              <AchievementBadge
                key={achievement.definition.id}
                achievement={achievement}
                size="small"
              />
            ))}
          </div>
        </>
      )}

      {/* Next to Earn */}
      {nextToEarn.length > 0 && (
        <>
          <CardDivider />
          <h3 className="text-sm font-medium text-[#f5f0e1] mb-2">Almost There</h3>
          <div className="space-y-2">
            {nextToEarn.map((achievement) => (
              <div
                key={achievement.definition.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(15,23,42,0.3)]"
              >
                <span className="text-xl">{achievement.definition.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f5f0e1] truncate">
                    {achievement.definition.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-[rgba(15,23,42,0.6)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: TIER_COLORS[achievement.definition.tier].text,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.percentComplete}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-[#c4baa6] tabular-nums">
                      {achievement.current}/{achievement.definition.requirement}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View All Toggle */}
      <CardDivider />
      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full py-2 text-sm text-[#4ecdc4] hover:text-[#4ecdc4]/80 transition-colors flex items-center justify-center gap-2"
      >
        {showAll ? 'Hide All Achievements' : 'View All Achievements'}
        <motion.span animate={{ rotate: showAll ? 180 : 0 }}>▼</motion.span>
      </button>

      {/* All Categories */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-4"
          >
            {(Object.keys(byCategory) as AchievementCategory[]).map((category) => (
              <CategorySection
                key={category}
                category={category}
                achievements={byCategory[category]}
                expanded={expandedCategories.has(category)}
                onToggle={() => toggleCategory(category)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
