import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEquipment } from './useEquipment'
import { calculateLimitingMagnitude, canViewWithEquipment } from '../types/equipment'

describe('useEquipment', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty equipment list', () => {
    const { result } = renderHook(() => useEquipment())
    expect(result.current.equipment).toHaveLength(0)
    expect(result.current.defaultEquipment).toBeNull()
  })

  it('adds equipment to the list', () => {
    const { result } = renderHook(() => useEquipment())

    act(() => {
      result.current.addEquipment({
        type: 'binoculars',
        name: 'Test Binoculars',
        aperture: 50,
        magnification: 10,
      })
    })

    expect(result.current.equipment).toHaveLength(1)
    expect(result.current.equipment[0].profile.name).toBe('Test Binoculars')
  })

  it('first equipment added becomes default', () => {
    const { result } = renderHook(() => useEquipment())

    act(() => {
      result.current.addEquipment({
        type: 'telescope',
        name: 'My Scope',
        aperture: 200,
        focalLength: 1200,
        mount: 'dobsonian',
      })
    })

    expect(result.current.equipment[0].isDefault).toBe(true)
    expect(result.current.defaultEquipment?.profile.name).toBe('My Scope')
  })

  it('removes equipment from the list', () => {
    const { result } = renderHook(() => useEquipment())

    let id: string
    act(() => {
      const eq = result.current.addEquipment({
        type: 'binoculars',
        name: 'To Remove',
        aperture: 35,
        magnification: 7,
      })
      id = eq.id
    })

    expect(result.current.equipment).toHaveLength(1)

    act(() => {
      result.current.removeEquipment(id)
    })

    expect(result.current.equipment).toHaveLength(0)
  })

  it('changes default equipment', () => {
    const { result } = renderHook(() => useEquipment())

    act(() => {
      result.current.addEquipment({
        type: 'binoculars',
        name: 'First',
        aperture: 50,
        magnification: 10,
      })
      result.current.addEquipment({
        type: 'telescope',
        name: 'Second',
        aperture: 200,
        focalLength: 1200,
        mount: 'dobsonian',
      })
    })

    const secondId = result.current.equipment[1].id

    act(() => {
      result.current.setDefaultEquipment(secondId)
    })

    expect(result.current.defaultEquipment?.profile.name).toBe('Second')
  })

  it('calculates max aperture across equipment', () => {
    const { result } = renderHook(() => useEquipment())

    act(() => {
      result.current.addEquipment({
        type: 'binoculars',
        name: 'Small',
        aperture: 50,
        magnification: 10,
      })
      result.current.addEquipment({
        type: 'telescope',
        name: 'Big',
        aperture: 200,
        focalLength: 1200,
        mount: 'dobsonian',
      })
    })

    expect(result.current.getMaxAperture()).toBe(200)
  })

  it('calculates limiting magnitude', () => {
    const { result } = renderHook(() => useEquipment())

    act(() => {
      result.current.addEquipment({
        type: 'telescope',
        name: '8 inch',
        aperture: 200,
        focalLength: 1200,
        mount: 'dobsonian',
      })
    })

    // 200mm scope should have limiting mag around 13.5
    expect(result.current.getLimitingMagnitude()).toBeGreaterThan(13)
  })
})

describe('calculateLimitingMagnitude', () => {
  it('calculates correct limiting magnitude', () => {
    expect(calculateLimitingMagnitude(50)).toBeCloseTo(10.5, 0)
    expect(calculateLimitingMagnitude(100)).toBeCloseTo(12, 0)
    expect(calculateLimitingMagnitude(200)).toBeCloseTo(13.5, 0)
  })
})

describe('canViewWithEquipment', () => {
  it('naked eye objects viewable without equipment', () => {
    const result = canViewWithEquipment('naked eye', 0)
    expect(result.canView).toBe(true)
  })

  it('binocular objects require 35mm aperture', () => {
    expect(canViewWithEquipment('binoculars', 30).canView).toBe(false)
    expect(canViewWithEquipment('binoculars', 50).canView).toBe(true)
  })

  it('telescope objects require 100mm aperture', () => {
    expect(canViewWithEquipment('telescope', 80).canView).toBe(false)
    expect(canViewWithEquipment('telescope', 100).canView).toBe(true)
  })

  it('returns optimal quality for large apertures', () => {
    const result = canViewWithEquipment('binoculars', 100)
    expect(result.quality).toBe('optimal')
  })

  it('returns adequate quality at minimum aperture', () => {
    const result = canViewWithEquipment('binoculars', 40)
    expect(result.quality).toBe('adequate')
  })
})
