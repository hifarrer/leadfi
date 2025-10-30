'use client'

import { useEffect, useState } from 'react'

interface ProgressBarProps {
  fetchCount: number
  isActive: boolean
}

export default function ProgressBar({ fetchCount, isActive }: ProgressBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setProgress(0)
      return
    }

    // Calculate estimated time: 30 seconds per 50 records
    const estimatedSeconds = Math.ceil((fetchCount / 50) * 30)
    const estimatedMs = estimatedSeconds * 1000
    
    // Start from 5% to show immediate feedback
    setProgress(5)

    // Update progress smoothly
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(
        5 + (elapsed / estimatedMs) * 95, // Scale from 5% to 100%
        95 // Don't complete until the actual request finishes
      )
      setProgress(newProgress)
    }, 100) // Update every 100ms for smooth animation

    return () => {
      clearInterval(interval)
    }
  }, [fetchCount, isActive])

  useEffect(() => {
    // Complete the progress bar when loading finishes
    if (!isActive && progress > 0) {
      setProgress(100)
      setTimeout(() => setProgress(0), 500)
    }
  }, [isActive, progress])

  if (!isActive && progress === 0) {
    return null
  }

  // Calculate estimated time remaining
  const estimatedSeconds = Math.ceil((fetchCount / 50) * 30)
  const remainingSeconds = Math.ceil(estimatedSeconds * (1 - progress / 100))

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Searching for leads...
        </span>
        <span className="text-sm text-gray-500">
          {remainingSeconds > 0 ? `~${remainingSeconds}s remaining` : 'Almost done...'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-100 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Fetching {fetchCount} leads • Estimated time: {Math.ceil((fetchCount / 50) * 30)} seconds
      </p>
    </div>
  )
}

