import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ObservationStats } from '../types/observations'

interface ShareObservationsProps {
  stats: ObservationStats
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

export function ShareObservations({ stats }: ShareObservationsProps) {
  const [sharing, setSharing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

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
            className="absolute right-0 top-full mt-2 bg-[#1a1a2e] border border-[#c9a227]/20 rounded-lg shadow-xl z-20 overflow-hidden min-w-[160px]"
          >
            {'share' in navigator && (
              <button
                onClick={() => handleShare('native')}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
              >
                <span>Share...</span>
              </button>
            )}
            <button
              onClick={() => handleShare('image')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
            >
              <span>Save as Image</span>
            </button>
            <button
              onClick={() => handleShare('text')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#f0f4f8] hover:bg-[#c9a227]/10 transition-colors"
            >
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
