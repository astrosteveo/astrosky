import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, CardDivider } from './GlassCard'
import { useEquipmentContext } from '../context/EquipmentContext'
import {
  BINOCULAR_PRESETS,
  TELESCOPE_PRESETS,
  PRESET_LABELS,
  calculateLimitingMagnitude,
  getEquipmentIcon,
  formatEquipmentSpecs,
  type EquipmentProfile,
  type EquipmentProfileType,
  type BinocularsProfile,
  type TelescopeProfile,
} from '../types/equipment'

type ViewMode = 'list' | 'add'
type PresetProfile = Omit<BinocularsProfile, 'name'> | Omit<TelescopeProfile, 'name'>

interface PresetGroup {
  type: EquipmentProfileType
  label: string
  icon: string
  presets: { key: string; label: string; profile: PresetProfile }[]
}

const presetGroups: PresetGroup[] = [
  {
    type: 'binoculars',
    label: 'Binoculars',
    icon: '🔭',
    presets: Object.entries(BINOCULAR_PRESETS)
      .map(([key, profile]) => ({ key, label: PRESET_LABELS[key], profile })),
  },
  {
    type: 'telescope',
    label: 'Telescopes',
    icon: '🔬',
    presets: Object.entries(TELESCOPE_PRESETS)
      .map(([key, profile]) => ({ key, label: PRESET_LABELS[key], profile })),
  },
]

export function EquipmentProfilesCard() {
  const {
    equipment,
    defaultEquipment,
    addEquipment,
    removeEquipment,
    setDefaultEquipment,
    getLimitingMagnitude,
  } = useEquipmentContext()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [customName, setCustomName] = useState('')
  const [customType, setCustomType] = useState<EquipmentProfileType>('binoculars')
  const [customAperture, setCustomAperture] = useState('')
  const [customMagnification, setCustomMagnification] = useState('')
  const [customFocalLength, setCustomFocalLength] = useState('')
  const [expandedGroup, setExpandedGroup] = useState<EquipmentProfileType | null>(null)

  const handleAddPreset = (preset: { key: string; label: string; profile: Omit<EquipmentProfile, 'name'> }) => {
    addEquipment({
      ...preset.profile,
      name: preset.label,
    } as EquipmentProfile)
    setViewMode('list')
  }

  const handleAddCustom = () => {
    if (!customName.trim() || !customAperture) return

    const aperture = parseInt(customAperture)
    if (isNaN(aperture) || aperture <= 0) return

    let profile: EquipmentProfile

    if (customType === 'binoculars') {
      const mag = parseInt(customMagnification) || 10
      profile = {
        type: 'binoculars',
        name: customName.trim(),
        aperture,
        magnification: mag,
      }
    } else {
      const focalLength = parseInt(customFocalLength) || aperture * 5
      profile = {
        type: 'telescope',
        name: customName.trim(),
        aperture,
        focalLength,
        mount: 'alt-az',
      }
    }

    addEquipment(profile)
    setCustomName('')
    setCustomAperture('')
    setCustomMagnification('')
    setCustomFocalLength('')
    setViewMode('list')
  }

  const limitingMag = getLimitingMagnitude()

  return (
    <GlassCard title="My Equipment" icon="🔭" glowColor="aurora">
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Summary */}
            {equipment.length > 0 && (
              <div className="flex items-center gap-4 mb-4 px-3 py-3 bg-[rgba(15,23,42,0.4)] rounded-xl">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-[#4ecdc4]">{equipment.length}</p>
                  <p className="text-xs text-[#c4baa6]">Saved</p>
                </div>
                <div className="h-8 w-px bg-[rgba(196,186,166,0.2)]" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-[#c9a227]">
                    {defaultEquipment ? defaultEquipment.profile.aperture : 0}
                    <span className="text-sm font-normal">mm</span>
                  </p>
                  <p className="text-xs text-[#c4baa6]">Primary</p>
                </div>
                <div className="h-8 w-px bg-[rgba(196,186,166,0.2)]" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-[#a855f7]">{limitingMag}</p>
                  <p className="text-xs text-[#c4baa6]">Mag Limit</p>
                </div>
              </div>
            )}

            {/* Equipment List */}
            {equipment.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(78,205,196,0.1)] flex items-center justify-center border border-[rgba(78,205,196,0.2)]">
                  <span className="text-3xl">🔭</span>
                </div>
                <p className="text-[#c4baa6]">No equipment saved yet</p>
                <p className="text-[#c4baa6]/60 text-sm mt-1 mb-4">
                  Add your gear for personalized recommendations
                </p>
                <button
                  onClick={() => setViewMode('add')}
                  className="px-4 py-2 rounded-lg bg-[#4ecdc4]/20 text-[#4ecdc4] border border-[#4ecdc4]/40 hover:bg-[#4ecdc4]/30 transition-colors"
                >
                  + Add Equipment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {equipment.map((item) => {
                  const limMag = calculateLimitingMagnitude(item.profile.aperture)
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        item.isDefault
                          ? 'bg-[rgba(78,205,196,0.1)] border border-[rgba(78,205,196,0.3)]'
                          : 'bg-[rgba(15,23,42,0.4)] border border-transparent'
                      }`}
                    >
                      <span className="text-2xl">{getEquipmentIcon(item.profile)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[#f5f0e1] truncate">
                            {item.profile.name}
                          </p>
                          {item.isDefault && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-[#4ecdc4]/20 text-[#4ecdc4]">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#c4baa6] mt-0.5">
                          {formatEquipmentSpecs(item.profile)} • Mag limit {limMag}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!item.isDefault && (
                          <button
                            onClick={() => setDefaultEquipment(item.id)}
                            className="p-1.5 rounded-lg text-[#c4baa6]/60 hover:text-[#4ecdc4] hover:bg-[#4ecdc4]/10 transition-colors"
                            title="Set as primary"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          onClick={() => removeEquipment(item.id)}
                          className="p-1.5 rounded-lg text-[#c4baa6]/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {equipment.length > 0 && (
              <>
                <CardDivider />
                <button
                  onClick={() => setViewMode('add')}
                  className="w-full py-2 text-sm text-[#4ecdc4] hover:text-[#4ecdc4]/80 transition-colors flex items-center justify-center gap-2"
                >
                  + Add Equipment
                </button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Quick Presets */}
            <h3 className="text-sm font-medium text-[#f5f0e1] mb-3">Quick Add</h3>
            <div className="space-y-2 mb-4">
              {presetGroups.map((group) => (
                <div key={group.type}>
                  <button
                    onClick={() =>
                      setExpandedGroup(expandedGroup === group.type ? null : group.type)
                    }
                    className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[rgba(15,23,42,0.4)] hover:bg-[rgba(15,23,42,0.6)] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{group.icon}</span>
                      <span className="text-sm text-[#f5f0e1]">{group.label}</span>
                    </span>
                    <motion.span
                      animate={{ rotate: expandedGroup === group.type ? 180 : 0 }}
                      className="text-[#c4baa6]"
                    >
                      ▼
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {expandedGroup === group.type && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2 pt-2 pl-2">
                          {group.presets.map((preset) => (
                            <button
                              key={preset.key}
                              onClick={() => handleAddPreset(preset)}
                              className="p-2 rounded-lg text-left bg-[rgba(15,23,42,0.3)] hover:bg-[rgba(78,205,196,0.1)] border border-transparent hover:border-[rgba(78,205,196,0.3)] transition-colors"
                            >
                              <p className="text-xs font-medium text-[#f5f0e1]">
                                {preset.label}
                              </p>
                              <p className="text-xs text-[#c4baa6]/60">
                                Mag limit {calculateLimitingMagnitude(preset.profile.aperture)}
                              </p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <CardDivider />

            {/* Custom Entry */}
            <h3 className="text-sm font-medium text-[#f5f0e1] mb-3">Custom Equipment</h3>
            <div className="space-y-3">
              {/* Type Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCustomType('binoculars')}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                    customType === 'binoculars'
                      ? 'bg-[#4ecdc4]/20 text-[#4ecdc4] border border-[#4ecdc4]/40'
                      : 'bg-[rgba(15,23,42,0.4)] text-[#c4baa6] border border-transparent'
                  }`}
                >
                  🔭 Binoculars
                </button>
                <button
                  onClick={() => setCustomType('telescope')}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                    customType === 'telescope'
                      ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/40'
                      : 'bg-[rgba(15,23,42,0.4)] text-[#c4baa6] border border-transparent'
                  }`}
                >
                  🔬 Telescope
                </button>
              </div>

              {/* Name */}
              <input
                type="text"
                placeholder="Name (e.g., My Celestron 8SE)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(196,186,166,0.2)] text-[#f5f0e1] placeholder-[#c4baa6]/40 text-sm focus:outline-none focus:border-[#4ecdc4]/50"
              />

              {/* Specs */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Aperture (mm)"
                  value={customAperture}
                  onChange={(e) => setCustomAperture(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(196,186,166,0.2)] text-[#f5f0e1] placeholder-[#c4baa6]/40 text-sm focus:outline-none focus:border-[#4ecdc4]/50"
                />
                {customType === 'binoculars' ? (
                  <input
                    type="number"
                    placeholder="Magnification"
                    value={customMagnification}
                    onChange={(e) => setCustomMagnification(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(196,186,166,0.2)] text-[#f5f0e1] placeholder-[#c4baa6]/40 text-sm focus:outline-none focus:border-[#4ecdc4]/50"
                  />
                ) : (
                  <input
                    type="number"
                    placeholder="Focal length (mm)"
                    value={customFocalLength}
                    onChange={(e) => setCustomFocalLength(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(196,186,166,0.2)] text-[#f5f0e1] placeholder-[#c4baa6]/40 text-sm focus:outline-none focus:border-[#4ecdc4]/50"
                  />
                )}
              </div>

              {/* Limiting Magnitude Preview */}
              {customAperture && !isNaN(parseInt(customAperture)) && (
                <div className="text-xs text-[#c4baa6] px-2">
                  Limiting magnitude: ~{calculateLimitingMagnitude(parseInt(customAperture))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setViewMode('list')}
                  className="flex-1 py-2 rounded-lg text-sm text-[#c4baa6] bg-[rgba(15,23,42,0.4)] hover:bg-[rgba(15,23,42,0.6)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustom}
                  disabled={!customName.trim() || !customAperture}
                  className="flex-1 py-2 rounded-lg text-sm text-[#0a0e27] bg-[#4ecdc4] hover:bg-[#4ecdc4]/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add Equipment
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
