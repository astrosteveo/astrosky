import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-all duration-300 p-1"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(78,205,196,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.1) 100%)',
        border: `1px solid ${theme === 'dark' ? 'rgba(201,162,39,0.3)' : 'rgba(251,191,36,0.4)'}`,
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon */}
      <motion.div
        className="absolute left-1.5 top-1/2 -translate-y-1/2"
        animate={{ opacity: theme === 'light' ? 1 : 0.3 }}
      >
        <svg className="w-4 h-4 text-[#fbbf24]" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </motion.div>

      {/* Moon icon */}
      <motion.div
        className="absolute right-1.5 top-1/2 -translate-y-1/2"
        animate={{ opacity: theme === 'dark' ? 1 : 0.3 }}
      >
        <svg className="w-4 h-4 text-[#c9a227]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </motion.div>

      {/* Toggle knob */}
      <motion.div
        className="w-5 h-5 rounded-full shadow-md"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #c9a227 0%, #d4a574 100%)'
            : 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)',
          boxShadow: theme === 'dark'
            ? '0 0 10px rgba(201,162,39,0.4)'
            : '0 0 10px rgba(251,191,36,0.5)',
        }}
        animate={{ x: theme === 'dark' ? 26 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
