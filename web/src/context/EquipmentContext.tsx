import { createContext, useContext, type ReactNode } from 'react'
import { useEquipment, type UseEquipmentResult } from '../hooks/useEquipment'

const EquipmentContext = createContext<UseEquipmentResult | null>(null)

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const equipmentHook = useEquipment()

  return (
    <EquipmentContext.Provider value={equipmentHook}>
      {children}
    </EquipmentContext.Provider>
  )
}

export function useEquipmentContext(): UseEquipmentResult {
  const context = useContext(EquipmentContext)
  if (!context) {
    throw new Error('useEquipmentContext must be used within an EquipmentProvider')
  }
  return context
}
