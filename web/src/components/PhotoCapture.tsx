import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoCaptureProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

// Compress image to reduce storage size
async function compressImage(file: File, maxWidth: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to JPEG with 80% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function PhotoCapture({ photos, onPhotosChange, maxPhotos = 3 }: PhotoCaptureProps) {
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setCapturing(true)
    setError(null)

    try {
      const newPhotos: string[] = []
      for (let i = 0; i < files.length && photos.length + newPhotos.length < maxPhotos; i++) {
        const compressed = await compressImage(files[i])
        newPhotos.push(compressed)
      }
      onPhotosChange([...photos, ...newPhotos])
    } catch (err) {
      console.error('Failed to process image:', err)
      setError('Failed to process image')
    } finally {
      setCapturing(false)
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  const canAddMore = photos.length < maxPhotos

  return (
    <div className="space-y-3">
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-lg overflow-hidden bg-black/20"
            >
              <img
                src={photo}
                alt={`Observation photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Photo Buttons */}
      {canAddMore && (
        <div className="flex gap-2">
          {/* Camera button (mobile) */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={capturing}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono rounded-lg bg-[#4ecdc4]/10 text-[#4ecdc4] border border-[#4ecdc4]/20 hover:bg-[#4ecdc4]/20 transition-all disabled:opacity-50"
          >
            {capturing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <span>Camera</span>
          </button>

          {/* Gallery button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={capturing}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono rounded-lg bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 hover:bg-[#a855f7]/20 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Gallery</span>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Photo count */}
      <p className="text-xs text-[#94a3b8]">
        {photos.length}/{maxPhotos} photos
      </p>
    </div>
  )
}

// Compact photo display for observation history
export function PhotoThumbnails({ photos }: { photos: string[] }) {
  const [expanded, setExpanded] = useState(false)

  if (photos.length === 0) return null

  return (
    <>
      <div className="flex gap-1 mt-2">
        {photos.slice(0, 3).map((photo, index) => (
          <button
            key={index}
            onClick={() => setExpanded(true)}
            className="w-10 h-10 rounded overflow-hidden bg-black/20 hover:opacity-80 transition-opacity"
          >
            <img src={photo} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
        {photos.length > 3 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-xs text-slate-400"
          >
            +{photos.length - 3}
          </button>
        )}
      </div>

      {/* Expanded view modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 gap-4">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                ))}
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
