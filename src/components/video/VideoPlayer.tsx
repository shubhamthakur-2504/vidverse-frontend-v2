"use client"

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import {  Play,  Pause,  Volume2,  VolumeX,  Maximize,  Settings, SkipForward, SkipBack, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'

interface VideoPlayerProps {
  videoUrl: string
  thumbnail?: string
}

export function VideoPlayer({ videoUrl, thumbnail }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
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

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      })
      
      hlsRef.current = hls
      hls.loadSource(videoUrl)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS Error:', data)
          setIsLoading(false)
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl
      setIsLoading(false)
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [videoUrl])

  // Update progress
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      setCurrentTime(video.currentTime)
      setDuration(video.duration || 0)
      
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        setBuffered((bufferedEnd / video.duration) * 100)
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('loadedmetadata', updateProgress)
    video.addEventListener('progress', updateProgress)

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('loadedmetadata', updateProgress)
      video.removeEventListener('progress', updateProgress)
    }
  }, [])

  // Hide controls on inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000)
      }
    }

    containerRef.current?.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      clearTimeout(timeout)
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isPlaying])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0]
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video rounded-xl overflow-hidden glass group"
      onDoubleClick={toggleFullscreen}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        poster={thumbnail}
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play Button */}
      <AnimatePresence>
        {!isPlaying && !isLoading && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full glass flex items-center justify-center
                     hover:scale-110 transition-transform"
          >
            <Play className="h-10 w-10 fill-white text-white ml-1" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 space-y-2"
          >
            {/* Progress Bar */}
            <div className="relative group/progress">
              {/* Buffered Progress */}
              <div className="absolute h-1 bg-white/20 rounded-full" style={{ width: `${buffered}%` }} />
              
              {/* Seek Bar */}
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-4">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => skip(-10)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <SkipBack className="h-5 w-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </button>

                <button
                  onClick={() => skip(10)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <SkipForward className="h-5 w-5" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 group/volume">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Time */}
                <span className="text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}