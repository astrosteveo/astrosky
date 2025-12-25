import { useState, useEffect, useCallback } from 'react'

export type SubscriptionTier = 'free' | 'pro'

export interface SubscriptionState {
  tier: SubscriptionTier
  // For future: expiration, payment info, etc.
  activatedAt: string | null
}

export interface ProFeatures {
  smartAlerts: boolean
  observationPlanner: boolean
  weeklyChallenges: boolean
  unlimitedHistory: boolean
  cloudBackup: boolean
  dataExport: boolean
}

export interface UseSubscriptionResult {
  tier: SubscriptionTier
  isPro: boolean
  features: ProFeatures
  activatedAt: Date | null
  // For demo/testing - in production this would be handled by payment provider
  upgradeToPro: () => void
  downgradeToFree: () => void
}

const STORAGE_KEY = 'astrosky_subscription'

const FREE_FEATURES: ProFeatures = {
  smartAlerts: false,
  observationPlanner: false,
  weeklyChallenges: false,
  unlimitedHistory: false,
  cloudBackup: false,
  dataExport: false,
}

const PRO_FEATURES: ProFeatures = {
  smartAlerts: true,
  observationPlanner: true,
  weeklyChallenges: true,
  unlimitedHistory: true,
  cloudBackup: true,
  dataExport: true,
}

function loadSubscription(): SubscriptionState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return { tier: 'free', activatedAt: null }
}

function saveSubscription(state: SubscriptionState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useSubscription(): UseSubscriptionResult {
  const [state, setState] = useState<SubscriptionState>(loadSubscription)

  // Persist changes
  useEffect(() => {
    saveSubscription(state)
  }, [state])

  const isPro = state.tier === 'pro'
  const features = isPro ? PRO_FEATURES : FREE_FEATURES

  const upgradeToPro = useCallback(() => {
    setState({
      tier: 'pro',
      activatedAt: new Date().toISOString(),
    })
  }, [])

  const downgradeToFree = useCallback(() => {
    setState({
      tier: 'free',
      activatedAt: null,
    })
  }, [])

  return {
    tier: state.tier,
    isPro,
    features,
    activatedAt: state.activatedAt ? new Date(state.activatedAt) : null,
    upgradeToPro,
    downgradeToFree,
  }
}
