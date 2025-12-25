import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { ProBadge } from './ProBadge'
import { useSubscriptionContext } from '../context/SubscriptionContext'
import { useObservationsContext } from '../context/ObservationsContext'
import { useWeeklyChallenges, type ActiveChallenge } from '../hooks/useWeeklyChallenges'

interface WeeklyChallengesCardProps {
  onUpgradeClick: () => void
}

function DifficultyBadge({ difficulty }: { difficulty: ActiveChallenge['difficulty'] }) {
  const colors = {
    Easy: 'bg-[#4ecdc4]/20 text-[#4ecdc4] border-[#4ecdc4]/30',
    Medium: 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30',
    Hard: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[difficulty]}`}>
      {difficulty}
    </span>
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = Math.min(100, (current / total) * 100)

  return (
    <div className="relative h-2 bg-[#0f172a] rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4ecdc4] to-[#c9a227] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}

function ChallengeItem({ challenge }: { challenge: ActiveChallenge }) {
  return (
    <motion.div
      className={`p-4 rounded-xl border transition-all ${
        challenge.completed
          ? 'bg-[#4ecdc4]/10 border-[#4ecdc4]/30'
          : 'bg-[#0f172a]/50 border-[#c9a227]/20'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{challenge.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-medium text-[#f5f0e1]">{challenge.title}</h4>
            <DifficultyBadge difficulty={challenge.difficulty} />
            {challenge.completed && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#4ecdc4]/20 text-[#4ecdc4] border border-[#4ecdc4]/30">
                Completed!
              </span>
            )}
          </div>
          <p className="text-sm text-[#94a3b8] mb-2">{challenge.description}</p>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#c4baa6]">
                {challenge.progress}/{challenge.target}
              </span>
              <span className="text-[#c9a227]">+{challenge.xpReward} XP</span>
            </div>
            <ProgressBar current={challenge.progress} total={challenge.target} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function WeeklyChallengesCard({ onUpgradeClick }: WeeklyChallengesCardProps) {
  const { isPro } = useSubscriptionContext()
  const { observations } = useObservationsContext()

  // Get observed object IDs
  const observedIds = useMemo(() => {
    return observations.map(o => o.object.id)
  }, [observations])

  const { challenges, totalXP, daysRemaining } = useWeeklyChallenges(observedIds)

  // Calculate week completion percentage
  const completedCount = challenges.filter(c => c.completed).length
  const weekProgress = (completedCount / challenges.length) * 100

  return (
    <GlassCard
      title="Weekly Challenges"
      icon="🏆"
      glowColor={isPro ? 'aurora' : 'brass'}
    >
      <div className="space-y-4">
        {/* Week Stats */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a]/50 border border-[#c9a227]/10">
          <div>
            <p className="text-xs text-[#94a3b8] mb-1">Week Progress</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#f5f0e1]">
                {completedCount}/{challenges.length}
              </span>
              <span className="text-xs text-[#94a3b8]">completed</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#94a3b8] mb-1">Time Remaining</p>
            <p className="text-lg font-bold text-[#c9a227]">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        {/* Total XP */}
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="text-xl">⭐</span>
          <span className="text-2xl font-bold text-[#c9a227]">{totalXP}</span>
          <span className="text-sm text-[#94a3b8]">Total XP</span>
        </div>

        {/* Pro gate */}
        {!isPro ? (
          <div className="space-y-3">
            {/* Show preview of challenges (blurred) */}
            <div className="relative">
              <div className="space-y-3 blur-[3px] opacity-50 pointer-events-none">
                {challenges.map(challenge => (
                  <div
                    key={challenge.id}
                    className="p-4 rounded-xl bg-[#0f172a]/50 border border-[#c9a227]/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{challenge.icon}</span>
                      <div>
                        <h4 className="font-medium text-[#f5f0e1]">{challenge.title}</h4>
                        <p className="text-sm text-[#94a3b8]">{challenge.difficulty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm rounded-xl">
                <ProBadge size="md" className="mb-3" />
                <p className="text-sm text-[#f5f0e1] mb-3 text-center px-4">
                  Weekly Challenges are a Pro feature
                </p>
                <motion.button
                  onClick={onUpgradeClick}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#c9a227] to-[#e8c547] text-[#0f172a] hover:shadow-lg hover:shadow-[#c9a227]/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Upgrade to Pro
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map(challenge => (
              <ChallengeItem key={challenge.id} challenge={challenge} />
            ))}

            {weekProgress === 100 && (
              <motion.div
                className="p-4 rounded-xl bg-gradient-to-r from-[#4ecdc4]/20 to-[#c9a227]/20 border border-[#c9a227]/30 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="text-3xl mb-2 block">🎉</span>
                <p className="font-medium text-[#f5f0e1]">Week Complete!</p>
                <p className="text-sm text-[#94a3b8]">
                  You've conquered all challenges. Check back next week!
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
