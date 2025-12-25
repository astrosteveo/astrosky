import { createContext, useContext, type ReactNode } from 'react'
import { useSubscription, type UseSubscriptionResult } from '../hooks/useSubscription'

const SubscriptionContext = createContext<UseSubscriptionResult | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscriptionHook = useSubscription()

  return (
    <SubscriptionContext.Provider value={subscriptionHook}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscriptionContext(): UseSubscriptionResult {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider')
  }
  return context
}
