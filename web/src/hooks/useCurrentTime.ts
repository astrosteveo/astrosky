import { useState, useEffect } from 'react'

/**
 * Hook that provides the current time, updating every second.
 * Perfect for live clocks and countdown timers.
 */
export function useCurrentTime(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return now
}
