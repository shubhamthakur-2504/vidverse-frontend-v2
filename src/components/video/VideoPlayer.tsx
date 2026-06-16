"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, Loader2, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '@/components/ui/slider'

interface VideoPlayerProps {
  videoUrl: string
  thumbnail?: string
}

export function VideoPlayer({ videoUrl, thumbnail }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showClickFeedback, setShowClickFeedback] = useState<'play' | 'pause' | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // HLS initialization
  useEffect(() => {
    if (!videoRef.current) return
    const video = videoRef.current
    const isHlsSource = /\.m3u8($|\?)/i.test(videoUrl)

    video.removeAttribute('src')
    video.load()
    setIsLoading(true)
    setLoadError(null)

    if (Hls.isSupported() && isHlsSource) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 })
      hlsRef.current = hls
      hls.loadSource(videoUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => setIsLoading(false))
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setIsLoading(false)
          setLoadError('Video stream failed to load')
        }
      })
    } else {
      video.src = videoUrl
      video.load()
      setIsLoading(false)
    }

    return () => { hlsRef.current?.destroy() }
  }, [videoUrl])

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      setIsLoading(false)
      setCurrentTime(video.currentTime)
      setDuration(video.duration || 0)
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        setBuffered((bufferedEnd / video.duration) * 100)
      }
    }

    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('loadedmetadata', updateProgress)
    video.addEventListener('progress', updateProgress)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('loadedmetadata', updateProgress)
      video.removeEventListener('progress', updateProgress)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    setShowControls(true)
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [isPlaying])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('mousemove', resetHideTimer)
    container.addEventListener('touchstart', resetHideTimer, { passive: true })
    return () => {
      container.removeEventListener('mousemove', resetHideTimer)
      container.removeEventListener('touchstart', resetHideTimer)
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    }
  }, [resetHideTimer])

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setShowClickFeedback('pause')
    } else {
      videoRef.current.play()
      setShowClickFeedback('play')
    }
    setIsPlaying(!isPlaying)
    setTimeout(() => setShowClickFeedback(null), 600)
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const v = value[0]
      videoRef.current.volume = v
      setVolume(v)
      setIsMuted(v === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds
  }

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600)
    const m = Math.floor((time % 3600) / 60)
    const s = Math.floor(time % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-2xl overflow-hidden bg-black group select-none"
      style={{ cursor: showControls ? 'default' : 'none' }}
      onDoubleClick={toggleFullscreen}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        poster={thumbnail}
        onClick={togglePlay}
      />

      {/* Thumbnail poster overlay (only when paused and at start) */}

      {/* Error state */}
      <AnimatePresence>
        {loadError && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-3 z-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-white/80 text-sm text-center px-6">{loadError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading spinner */}
      <AnimatePresence>
        {isLoading && !loadError && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 pointer-events-none"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-b-cyan-500/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center play/pause feedback */}
      <AnimatePresence>
        {showClickFeedback && (
          <motion.div
            key={showClickFeedback}
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 1.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/10 flex items-center justify-center pointer-events-none z-10"
            style={{ width: 80, height: 80 }}
          >
            {showClickFeedback === 'play'
              ? <Play className="h-9 w-9 fill-white text-white ml-1" />
              : <Pause className="h-9 w-9 fill-white text-white" />
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big center play button (paused, not loading) */}
      <AnimatePresence>
        {!isPlaying && !isLoading && !loadError && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={togglePlay}
            className="absolute inset-0 m-auto z-10 pointer-events-auto flex items-center justify-center"
            style={{ width: 72, height: 72 }}
          >
            <div className="w-18 h-18 w-full h-full rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-2xl">
              <Play className="h-8 w-8 fill-white text-white ml-1" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            {/* Gradient fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            <div className="relative px-4 pb-4 pt-12 space-y-2">
              {/* Progress / Seek Bar */}
              <div className="group/progress relative h-4 flex items-center cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const percent = x / rect.width
                  handleSeek([percent * duration])
                }}
              >
                {/* Track */}
                <div className="relative w-full h-1 group-hover/progress:h-1.5 transition-all duration-150 bg-white/20 rounded-full overflow-hidden">
                  {/* Buffered */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-white/25 rounded-full transition-all"
                    style={{ width: `${buffered}%` }}
                  />
                  {/* Played */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {/* Scrubber thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg scale-0 group-hover/progress:scale-100 transition-transform duration-150"
                  style={{ left: `calc(${progressPercent}% - 7px)` }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                {/* Left controls */}
                <div className="flex items-center gap-1">
                  <button onClick={() => skip(-10)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                    <SkipBack className="h-4.5 w-4.5" />
                  </button>

                  <button onClick={togglePlay} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                    {isPlaying
                      ? <Pause className="h-5 w-5 fill-white" />
                      : <Play className="h-5 w-5 fill-white ml-0.5" />
                    }
                  </button>

                  <button onClick={() => skip(10)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                    <SkipForward className="h-4.5 w-4.5" />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button onClick={toggleMute} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                      {isMuted || volume === 0
                        ? <VolumeX className="h-4.5 w-4.5" />
                        : <Volume2 className="h-4.5 w-4.5" />
                      }
                    </button>
                    <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-300">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-20"
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-xs font-medium text-white/70 ml-1 tabular-nums">
                    {formatTime(currentTime)}{' '}
                    <span className="text-white/35">/</span>{' '}
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                    {isFullscreen
                      ? <Minimize className="h-4.5 w-4.5" />
                      : <Maximize className="h-4.5 w-4.5" />
                    }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}