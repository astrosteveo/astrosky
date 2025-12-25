import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const themeConfig = {
  dark: {
    icon: '🌙',
    label: 'Dark',
    next: 'Light',
    bg: 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(78,205,196,0.1) 100%)',
    border: 'rgba(201,162,39,0.3)',
    knobBg: 'linear-gradient(135deg, #c9a227 0%, #d4a574 100%)',
    knobGlow: '0 0 10px rgba(201,162,39,0.4)',
    position: 0,
  },
  light: {
    icon: '☀️',
    label: 'Light',
    next: 'Night',
    bg: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.1) 100%)',
    border: 'rgba(251,191,36,0.4)',
    knobBg: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)',
    knobGlow: '0 0 10px rgba(251,191,36,0.5)',
    position: 20,
  },
  night: {
    icon: '🔴',
    label: 'Night',
    next: 'Dark',
    bg: 'linear-gradient(135deg, rgba(153,51,51,0.25) 0%, rgba(102,34,34,0.15) 100%)',
    border: 'rgba(153,51,51,0.5)',
    knobBg: 'linear-gradient(135deg, #993333 0%, #cc3333 100%)',
    knobGlow: '0 0 10px rgba(153,51,51,0.5)',
    position: 40,
  },
}

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()
  const config = themeConfig[theme]

  return (
    <button
      onClick={cycleTheme}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
      title={`Switch to ${config.next} mode`}
      aria-label={`Current: ${config.label} mode. Click to switch to ${config.next} mode`}
    >
      {/* Current theme icon */}
      <motion.span
        key={theme}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-sm"
      >
        {config.icon}
      </motion.span>

      {/* Theme label */}
      <motion.span
        key={`label-${theme}`}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-mono font-medium"
        style={{
          color: theme === 'dark' ? '#c9a227' :
                 theme === 'light' ? '#92400e' :
                 '#cc3333'
        }}
      >
        {config.label}
      </motion.span>

      {/* Indicator dots */}
      <div className="flex gap-1 ml-1">
        {(['dark', 'light', 'night'] as const).map((t) => (
          <motion.div
            key={t}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: t === theme
                ? (t === 'dark' ? '#c9a227' : t === 'light' ? '#fbbf24' : '#cc3333')
                : 'rgba(148,163,184,0.3)',
            }}
            animate={{
              scale: t === theme ? 1 : 0.7,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        ))}
      </div>
    </button>
  )
}
