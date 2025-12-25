import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ObservationStats } from '../types/observations'

interface ShareObservationsProps {
  stats: ObservationStats
}

type SocialPlatform = 'twitter' | 'instagram' | 'threads' | 'bluesky'

// Platform-specific configurations
const PLATFORM_CONFIG = {
  twitter: {
    name: 'X / Twitter',
    icon: '𝕏',
    maxLength: 280,
    hashtags: ['astronomy', 'stargazing', 'nightsky'],
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    maxLength: 2200,
    hashtags: ['astronomy', 'stargazing', 'nightsky', 'astrophotography', 'universe', 'cosmos'],
  },
  threads: {
    name: 'Threads',
    icon: '🧵',
    maxLength: 500,
    hashtags: ['astronomy', 'stargazing'],
  },
  bluesky: {
    name: 'Bluesky',
    icon: '🦋',
    maxLength: 300,
    hashtags: ['astronomy', 'stargazing'],
  },
}

// Generate shareable text summary
function generateShareText(stats: ObservationStats): string {
  const lines = [
    `My AstroSky Observations`,
    ``,
    `${stats.totalObservations} total observations`,
    `${stats.uniqueObjects} unique objects`,
    `${stats.planetsObserved.length}/7 planets observed`,
    `${stats.messierCount}/110 Messier objects`,
  ]

  if (stats.planetsObserved.length > 0) {
    lines.push(``, `Planets: ${stats.planetsObserved.join(', ')}`)
  }

  if (stats.firstObservation) {
    const firstDate = new Date(stats.firstObservation).toLocaleDateString()
    lines.push(``, `Observing since: ${firstDate}`)
  }

  lines.push(``, `Track your stargazing with AstroSky`)

  return lines.join('\n')
}

// Generate platform-specific formatted text
function generateSocialText(stats: ObservationStats, platform: SocialPlatform): string {
  const config = PLATFORM_CONFIG[platform]
  const hashtags = config.hashtags.map(h => `#${h}`).join(' ')

  // Planet emojis for visual appeal
  const planetEmojis: Record<string, string> = {
    Mercury: '☿️', Venus: '♀️', Mars: '♂️', Jupiter: '♃',
    Saturn: '🪐', Uranus: '⛢', Neptune: '♆',
  }

  const planetsWithEmojis = stats.planetsObserved
    .map(p => planetEmojis[p] || p)
    .join(' ')

  if (platform === 'twitter') {
    // Compact format for Twitter's 280 char limit
    let text = `✨ My stargazing stats:\n`
    text += `🔭 ${stats.totalObservations} observations\n`
    text += `⭐ ${stats.uniqueObjects} unique objects\n`
    if (stats.planetsObserved.length > 0) {
      text += `🪐 Planets: ${planetsWithEmojis}\n`
    }
    text += `🌌 ${stats.messierCount}/110 Messier\n\n`
    text += hashtags

    // Trim if over limit
    if (text.length > config.maxLength) {
      text = text.slice(0, config.maxLength - 3) + '...'
    }
    return text
  }

  if (platform === 'instagram') {
    // Longer, more visual format for Instagram
    let text = `✨ My AstroSky Observation Stats ✨\n\n`
    text += `🔭 Total Observations: ${stats.totalObservations}\n`
    text += `⭐ Unique Objects: ${stats.uniqueObjects}\n`
    text += `🪐 Planets: ${stats.planetsObserved.length}/7\n`
    text += `🌌 Messier Objects: ${stats.messierCount}/110\n\n`

    if (stats.planetsObserved.length > 0) {
      text += `Planets observed: ${planetsWithEmojis}\n\n`
    }

    if (stats.messierCount >= 50) {
      text += `🏆 Over halfway through the Messier Marathon!\n\n`
    }

    if (stats.firstObservation) {
      const days = Math.floor((Date.now() - new Date(stats.firstObservation).getTime()) / (1000 * 60 * 60 * 24))
      text += `📅 ${days} days of stargazing\n\n`
    }

    text += `Track your observations with AstroSky 🌙\n\n`
    text += hashtags
    return text
  }

  if (platform === 'threads' || platform === 'bluesky') {
    // Medium format
    let text = `✨ Stargazing stats update!\n\n`
    text += `🔭 ${stats.totalObservations} observations\n`
    text += `⭐ ${stats.uniqueObjects} unique objects\n`
    text += `🪐 ${stats.planetsObserved.length}/7 planets\n`
    text += `🌌 ${stats.messierCount}/110 Messier\n\n`
    text += hashtags
    return text
  }

  return generateShareText(stats)
}

// Open Twitter/X with pre-filled tweet
function openTwitterIntent(text: string): void {
  const encodedText = encodeURIComponent(text)
  const url = `https://twitter.com/intent/tweet?text=${encodedText}`
  window.open(url, '_blank', 'width=550,height=420')
}

// Open Bluesky with pre-filled post
function openBlueskyIntent(text: string): void {
  const encodedText = encodeURIComponent(text)
  const url = `https://bsky.app/intent/compose?text=${encodedText}`
  window.open(url, '_blank', 'width=550,height=420')
}

// Open Threads (no direct intent, so copy and open app)
function openThreadsIntent(): void {
  window.open('https://www.threads.net', '_blank')
}

// Generate a canvas-based share image
async function generateShareImage(stats: ObservationStats): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, '#0a0a0f')
  gradient.addColorStop(1, '#1a1a2e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 600, 400)

  // Add stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 600
    const y = Math.random() * 400
    const size = Math.random() * 2
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Title
  ctx.fillStyle = '#c9a227'
  ctx.font = 'bold 32px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('AstroSky', 300, 50)

  ctx.fillStyle = '#f0f4f8'
  ctx.font = '18px system-ui, sans-serif'
  ctx.fillText('My Observation Stats', 300, 80)

  // Stats boxes
  const boxWidth = 130
  const boxHeight = 80
  const startX = 45
  const startY = 110

  const statsData = [
    { value: stats.totalObservations.toString(), label: 'Total' },
    { value: stats.uniqueObjects.toString(), label: 'Unique' },
    { value: `${stats.planetsObserved.length}/7`, label: 'Planets' },
    { value: `${stats.messierCount}/110`, label: 'Messier' },
  ]

  statsData.forEach((stat, i) => {
    const x = startX + (i * (boxWidth + 10))
    const y = startY

    // Box background
    ctx.fillStyle = 'rgba(201, 162, 39, 0.1)'
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x, y, boxWidth, boxHeight, 8)
    ctx.fill()
    ctx.stroke()

    // Value
    ctx.fillStyle = '#f0f4f8'
    ctx.font = 'bold 28px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(stat.value, x + boxWidth / 2, y + 40)

    // Label
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText(stat.label, x + boxWidth / 2, y + 65)
  })

  // Messier progress bar
  const progressY = 220
  ctx.fillStyle = '#94a3b8'
  ctx.font = '14px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Messier Marathon Progress', 45, progressY)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#4ecdc4'
  ctx.fillText(`${stats.messierCount}/110`, 555, progressY)

  // Progress bar background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.beginPath()
  ctx.roundRect(45, progressY + 10, 510, 12, 6)
  ctx.fill()

  // Progress bar fill
  const progressWidth = (stats.messierCount / 110) * 510
  const progressGradient = ctx.createLinearGradient(45, 0, 45 + progressWidth, 0)
  progressGradient.addColorStop(0, '#4ecdc4')
  progressGradient.addColorStop(1, '#a855f7')
  ctx.fillStyle = progressGradient
  ctx.beginPath()
  ctx.roundRect(45, progressY + 10, progressWidth, 12, 6)
  ctx.fill()

  // Planets observed
  if (stats.planetsObserved.length > 0) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Planets Observed:', 45, 280)

    ctx.fillStyle = '#c9a227'
    ctx.font = '16px system-ui, sans-serif'
    ctx.fillText(stats.planetsObserved.join('  '), 45, 305)
  }

  // Date range
  if (stats.firstObservation) {
    const firstDate = new Date(stats.firstObservation).toLocaleDateString()
    const lastDate = stats.lastObservation
      ? new Date(stats.lastObservation).toLocaleDateString()
      : 'Present'

    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Observing: ${firstDate} - ${lastDate}`, 300, 350)
  }

  // Footer
  ctx.fillStyle = '#c9a227'
  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('astrosky.app', 300, 385)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}

// Generate Instagram-optimized square image (1080x1080)
async function generateInstagramImage(stats: ObservationStats): Promise<Blob> {
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size)
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(1, '#0a0a0f')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Add more stars for larger canvas
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const starSize = Math.random() * 3
    ctx.beginPath()
    ctx.arc(x, y, starSize, 0, Math.PI * 2)
    ctx.fill()
  }

  // Title
  ctx.fillStyle = '#c9a227'
  ctx.font = 'bold 64px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('AstroSky', size/2, 100)

  ctx.fillStyle = '#f0f4f8'
  ctx.font = '32px system-ui, sans-serif'
  ctx.fillText('My Observation Stats', size/2, 150)

  // Stats in 2x2 grid
  const boxSize = 220
  const gap = 40
  const gridStartX = (size - (boxSize * 2 + gap)) / 2
  const gridStartY = 220

  const statsData = [
    { value: stats.totalObservations.toString(), label: 'Total', emoji: '🔭' },
    { value: stats.uniqueObjects.toString(), label: 'Unique', emoji: '⭐' },
    { value: `${stats.planetsObserved.length}/7`, label: 'Planets', emoji: '🪐' },
    { value: `${stats.messierCount}/110`, label: 'Messier', emoji: '🌌' },
  ]

  statsData.forEach((stat, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = gridStartX + col * (boxSize + gap)
    const y = gridStartY + row * (boxSize + gap)

    // Box background
    ctx.fillStyle = 'rgba(201, 162, 39, 0.15)'
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, y, boxSize, boxSize, 16)
    ctx.fill()
    ctx.stroke()

    // Emoji
    ctx.font = '48px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(stat.emoji, x + boxSize/2, y + 60)

    // Value
    ctx.fillStyle = '#f0f4f8'
    ctx.font = 'bold 56px system-ui, sans-serif'
    ctx.fillText(stat.value, x + boxSize/2, y + 140)

    // Label
    ctx.fillStyle = '#94a3b8'
    ctx.font = '28px system-ui, sans-serif'
    ctx.fillText(stat.label, x + boxSize/2, y + 190)
  })

  // Planets section
  const planetsY = 740
  if (stats.planetsObserved.length > 0) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = '28px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Planets Observed', size/2, planetsY)

    ctx.fillStyle = '#c9a227'
    ctx.font = 'bold 36px system-ui, sans-serif'
    ctx.fillText(stats.planetsObserved.join('  •  '), size/2, planetsY + 50)
  }

  // Progress bar
  const progressY = 860
  ctx.fillStyle = '#94a3b8'
  ctx.font = '24px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Messier Marathon', 100, progressY)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#4ecdc4'
  ctx.fillText(`${Math.round((stats.messierCount/110)*100)}%`, size - 100, progressY)

  // Progress bar background
  const barWidth = size - 200
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.beginPath()
  ctx.roundRect(100, progressY + 15, barWidth, 20, 10)
  ctx.fill()

  // Progress bar fill
  const progressWidth = (stats.messierCount / 110) * barWidth
  const progressGradient = ctx.createLinearGradient(100, 0, 100 + progressWidth, 0)
  progressGradient.addColorStop(0, '#4ecdc4')
  progressGradient.addColorStop(1, '#a855f7')
  ctx.fillStyle = progressGradient
  ctx.beginPath()
  ctx.roundRect(100, progressY + 15, progressWidth, 20, 10)
  ctx.fill()

  // Date range
  if (stats.firstObservation) {
    const days = Math.floor((Date.now() - new Date(stats.firstObservation).getTime()) / (1000 * 60 * 60 * 24))
    ctx.fillStyle = '#94a3b8'
    ctx.font = '24px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${days} days of stargazing`, size/2, 970)
  }

  // Footer
  ctx.fillStyle = '#c9a227'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('astrosky.app', size/2, 1040)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}

export function ShareObservations({ stats }: ShareObservationsProps) {
  const [sharing, setSharing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedPlatform, setCopiedPlatform] = useState<SocialPlatform | null>(null)

  const handleSocialShare = async (platform: SocialPlatform) => {
    const text = generateSocialText(stats, platform)

    if (platform === 'twitter') {
      openTwitterIntent(text)
      setShowMenu(false)
    } else if (platform === 'bluesky') {
      openBlueskyIntent(text)
      setShowMenu(false)
    } else if (platform === 'threads') {
      await navigator.clipboard.writeText(text)
      setCopiedPlatform(platform)
      setTimeout(() => setCopiedPlatform(null), 2000)
      openThreadsIntent()
    } else if (platform === 'instagram') {
      // Copy text and generate square image
      await navigator.clipboard.writeText(text)
      setCopiedPlatform(platform)
      setTimeout(() => setCopiedPlatform(null), 2000)

      const blob = await generateInstagramImage(stats)
      downloadBlob(blob, 'astrosky-instagram.png')
    }
  }

  const handleShare = async (type: 'native' | 'image' | 'text') => {
    setSharing(true)
    try {
      if (type === 'native' && navigator.share) {
        const shareText = generateShareText(stats)
        await navigator.share({
          title: 'My AstroSky Observations',
          text: shareText,
        })
      } else if (type === 'image') {
        const blob = await generateShareImage(stats)

        // Try native share with image
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'astrosky-stats.png', { type: 'image/png' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'My AstroSky Observations',
            })
          } else {
            // Fallback: download
            downloadBlob(blob, 'astrosky-stats.png')
          }
        } else {
          // Fallback: download
          downloadBlob(blob, 'astrosky-stats.png')
        }
      } else if (type === 'text') {
        const shareText = generateShareText(stats)
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Share failed:', error)
    } finally {
      setSharing(false)
      setShowMenu(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={sharing}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-[#c9a227]/10 text-[#c9a227] border border-[#c9a227]/20 hover:bg-[#c9a227]/20 transition-all disabled:opacity-50"
      >
        {sharing ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )}
        <span>Share</span>
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 bg-[#1a1a2e] border border-[#c9a227]/20 rounded-lg shadow-xl z-20 overflow-hidden min-w-[180px]"
          >
            {/* Social Media Platforms */}
            <div className="px-3 py-1.5 text-[10px] text-[#94a3b8] uppercase tracking-wider border-b border-[#c9a227]/10">
              Share to Social
            </div>
            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
            >
              <span className="w-4 text-center">{PLATFORM_CONFIG.twitter.icon}</span>
              <span>{PLATFORM_CONFIG.twitter.name}</span>
            </button>
            <button
              onClick={() => handleSocialShare('instagram')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
            >
              <span className="w-4 text-center">{PLATFORM_CONFIG.instagram.icon}</span>
              <span>
                {copiedPlatform === 'instagram' ? 'Caption copied! Downloading...' : PLATFORM_CONFIG.instagram.name}
              </span>
            </button>
            <button
              onClick={() => handleSocialShare('threads')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
            >
              <span className="w-4 text-center">{PLATFORM_CONFIG.threads.icon}</span>
              <span>
                {copiedPlatform === 'threads' ? 'Copied! Opening...' : PLATFORM_CONFIG.threads.name}
              </span>
            </button>
            <button
              onClick={() => handleSocialShare('bluesky')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
            >
              <span className="w-4 text-center">{PLATFORM_CONFIG.bluesky.icon}</span>
              <span>{PLATFORM_CONFIG.bluesky.name}</span>
            </button>

            {/* Divider */}
            <div className="border-t border-[#c9a227]/10 my-1" />

            {/* General Share Options */}
            <div className="px-3 py-1.5 text-[10px] text-[#94a3b8] uppercase tracking-wider">
              Other Options
            </div>
            {'share' in navigator && (
              <button
                onClick={() => handleShare('native')}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
              >
                <span className="w-4 text-center">📤</span>
                <span>Share...</span>
              </button>
            )}
            <button
              onClick={() => handleShare('image')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
            >
              <span className="w-4 text-center">🖼️</span>
              <span>Save as Image</span>
            </button>
            <button
              onClick={() => handleShare('text')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
            >
              <span className="w-4 text-center">📋</span>
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
