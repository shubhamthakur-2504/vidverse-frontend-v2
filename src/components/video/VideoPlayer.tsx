"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Check,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import videoApi from "@/lib/api/client/videoApi";
import { cn } from "@/lib/utils";

// a view counts once playback passes this point (or the video ends, for shorter clips)
const VIEW_THRESHOLD_SECONDS = 5;
const HIDE_CONTROLS_MS = 2500;
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const PREFS_KEY = "vv:player";

type Prefs = { volume: number; muted: boolean; rate: number };

const readPrefs = (): Prefs => {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw) return { volume: 1, muted: false, rate: 1, ...JSON.parse(raw) };
  } catch {
    /* fall through to the defaults */
  }
  return { volume: 1, muted: false, rate: 1 };
};

const writePrefs = (prefs: Partial<Prefs>) => {
  try {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ ...readPrefs(), ...prefs })
    );
  } catch {
    /* the preference just doesn't survive the tab */
  }
};

const formatTime = (time: number) => {
  if (!Number.isFinite(time)) return "0:00";
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = Math.floor(time % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
};

export function VideoPlayer({
  videoUrl,
  thumbnail,
  videoId,
}: {
  videoUrl: string;
  thumbnail?: string;
  videoId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // mirrors the media element's own events, so it stays right when play() is
  // rejected by the autoplay policy
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [hover, setHover] = useState<{ time: number; percent: number } | null>(
    null
  );
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([]);
  const [level, setLevel] = useState(-1); // -1 is "Auto"
  const [attempt, setAttempt] = useState(0);

  // Controls stay up while paused and hide after a moment of quiet while
  // playing. The timer reads the element rather than React state, so it can be
  // restarted straight from the media events below.
  const wake = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    if (videoRef.current && !videoRef.current.paused)
      hideTimer.current = setTimeout(
        () => setShowControls(false),
        HIDE_CONTROLS_MS
      );
  }, []);

  // HLS. The watch page mounts one player per video (key={videoId}), so this
  // state starts fresh per video; `attempt` re-runs it for the retry button.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported() && /\.m3u8($|\?)/i.test(videoUrl)) {
      const hls = new Hls({ enableWorker: true, backBufferLength: 90 });
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setWaiting(false);
        setLevels(
          hls.levels.map((entry, index) => ({
            index,
            label: `${entry.height}p`,
          }))
        );
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, () => setLevel(hls.currentLevel));
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        setWaiting(false);
        setError("This video couldn't be loaded.");
      });
    } else {
      // native playback (Safari HLS, mp4): canplay below clears the spinner,
      // and there is no level list to offer
      video.src = videoUrl;
      video.load();
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [videoUrl, attempt]);

  // media element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      if (video.buffered.length > 0 && video.duration)
        setBuffered(
          (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
        );
    };
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
      wake();
    };
    const onPause = () => {
      setPlaying(false);
      wake();
    };
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
      wake();
    };
    const onVolume = () => {
      setVolume(video.volume);
      setMuted(video.muted);
      writePrefs({ volume: video.volume, muted: video.muted });
    };
    const onRate = () => {
      setRate(video.playbackRate);
      writePrefs({ rate: video.playbackRate });
    };
    const onWaiting = () => setWaiting(true);
    const onPlayable = () => setWaiting(false);
    const onError = () => {
      setWaiting(false);
      setError("This video couldn't be loaded.");
    };

    // restore what the viewer chose last time; each assignment fires its own
    // change event, which is what copies the value into state
    const prefs = readPrefs();
    video.volume = prefs.volume;
    video.muted = prefs.muted;
    video.playbackRate = prefs.rate;

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onTime);
    video.addEventListener("progress", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("volumechange", onVolume);
    video.addEventListener("ratechange", onRate);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onPlayable);
    video.addEventListener("playing", onPlayable);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onTime);
      video.removeEventListener("progress", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("volumechange", onVolume);
      video.removeEventListener("ratechange", onRate);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onPlayable);
      video.removeEventListener("playing", onPlayable);
      video.removeEventListener("error", onError);
    };
  }, [wake]);

  // view tracking, sent from the browser so the API sees the real viewer
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoId) return;
    let recorded = false;
    const maybeRecord = () => {
      if (recorded) return;
      if (video.currentTime >= VIEW_THRESHOLD_SECONDS || video.ended) {
        recorded = true;
        videoApi.recordView(videoId).catch(() => {
          /* view tracking must never disrupt playback */
        });
      }
    };
    video.addEventListener("timeupdate", maybeRecord);
    video.addEventListener("ended", maybeRecord);
    return () => {
      video.removeEventListener("timeupdate", maybeRecord);
      video.removeEventListener("ended", maybeRecord);
    };
  }, [videoId]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (clickTimer.current) clearTimeout(clickTimer.current);
    },
    []
  );

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) video.play().catch(() => {});
    else video.pause();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen().catch(() => {});
  }, []);

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement)
        await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      /* the browser refused: nothing to tell the viewer */
    }
  };

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Math.max(seconds, 0), video.duration);
    setCurrentTime(video.currentTime);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (video) seekTo(video.currentTime + seconds);
  };

  const setVolumeTo = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.min(Math.max(value, 0), 1);
    video.muted = video.volume === 0;
  };

  const timeAt = (clientX: number) => {
    const bar = progressRef.current;
    if (!bar || !duration) return null;
    const rect = bar.getBoundingClientRect();
    const percent = Math.min(
      Math.max((clientX - rect.left) / rect.width, 0),
      1
    );
    return { time: percent * duration, percent: percent * 100 };
  };

  const onPointerDown = (event: React.PointerEvent) => {
    const at = timeAt(event.clientX);
    if (!at) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setScrubbing(true);
    seekTo(at.time);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const at = timeAt(event.clientX);
    if (!at) return;
    setHover(at);
    if (scrubbing) seekTo(at.time);
  };

  const endScrub = (event: React.PointerEvent) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setScrubbing(false);
  };

  // a single click plays or pauses, a double click goes fullscreen: the wait
  // stops a double click from also toggling playback
  const onSurfaceClick = (event: React.MouseEvent) => {
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (event.detail === 1) clickTimer.current = setTimeout(togglePlay, 220);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    // arrow keys belong to the volume slider when it has focus, and space or
    // enter activates whichever button is focused
    if (target.closest("[data-player-volume]") && event.key.startsWith("Arrow"))
      return;
    if (
      (target.tagName === "BUTTON" || target.closest("[role='menu']")) &&
      (event.key === " " || event.key === "Enter")
    )
      return;
    const video = videoRef.current;
    if (!video) return;

    switch (event.key) {
      case " ":
      case "k":
      case "K":
        togglePlay();
        break;
      case "ArrowLeft":
        skip(-5);
        break;
      case "ArrowRight":
        skip(5);
        break;
      case "j":
      case "J":
        skip(-10);
        break;
      case "l":
      case "L":
        skip(10);
        break;
      case "ArrowUp":
        setVolumeTo(video.volume + 0.1);
        break;
      case "ArrowDown":
        setVolumeTo(video.volume - 0.1);
        break;
      case "m":
      case "M":
        video.muted = !video.muted;
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      default:
        if (/^[0-9]$/.test(event.key) && video.duration)
          seekTo((Number(event.key) / 10) * video.duration);
        else return;
    }
    event.preventDefault();
    wake();
  };

  const played = duration > 0 ? (currentTime / duration) * 100 : 0;
  // the controls stay up while paused and hide after a moment while playing
  const controlsVisible = showControls || !playing || scrubbing;
  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const iconButton =
    "press inline-flex size-9 items-center justify-center rounded-full text-white hover:bg-white/15";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Video player. Space or K plays and pauses, arrow keys seek and change the volume, M mutes, F is full screen."
      onKeyDown={onKeyDown}
      onFocus={wake}
      onPointerMove={wake}
      className={cn(
        "group relative aspect-video overflow-hidden bg-black select-none",
        !controlsVisible && "cursor-none"
      )}
    >
      <video
        ref={videoRef}
        className="size-full bg-black object-contain"
        poster={thumbnail}
        playsInline
        onClick={onSurfaceClick}
        onDoubleClick={() => {
          if (clickTimer.current) clearTimeout(clickTimer.current);
          toggleFullscreen();
        }}
      />

      {error ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center">
          <p className="text-sm text-white">{error}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setError(null);
              setWaiting(true);
              setLevels([]);
              setAttempt((n) => n + 1);
            }}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <RotateCcw strokeWidth={1.75} aria-hidden />
            Try again
          </Button>
        </div>
      ) : (
        <>
          {waiting && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <Loader2
                className="size-10 animate-spin text-white/80"
                strokeWidth={1.75}
                aria-label="Loading"
              />
            </div>
          )}

          {/* the one big target before playback starts, and again at the end */}
          {!playing && !waiting && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={ended ? "Replay" : "Play"}
              className="press absolute inset-0 z-10 m-auto flex size-16 items-center justify-center rounded-full bg-black/60 text-white animate-fade-in"
            >
              {ended ? (
                <RotateCcw className="size-7" strokeWidth={1.75} aria-hidden />
              ) : (
                <Play className="ml-1 size-7 fill-white" aria-hidden />
              )}
            </button>
          )}
        </>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 transition-opacity duration-200 ease-out",
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"
        />

        <div className="relative space-y-1 px-3 pt-12 pb-2">
          {/* Progress */}
          <div
            ref={progressRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration)}
            aria-valuenow={Math.floor(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endScrub}
            onPointerCancel={endScrub}
            onPointerLeave={() => setHover(null)}
            className="group/bar relative flex h-5 cursor-pointer touch-none items-center"
          >
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-full bg-white/25 transition-[height] duration-120 ease-out",
                scrubbing ? "h-1.5" : "h-1 group-hover/bar:h-1.5"
              )}
            >
              <div
                className="absolute inset-y-0 left-0 bg-white/30"
                style={{ width: `${buffered}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-brand"
                style={{ width: `${played}%` }}
              />
            </div>
            <div
              className={cn(
                "pointer-events-none absolute size-3 -translate-x-1/2 rounded-full bg-brand transition-transform duration-120 ease-out",
                scrubbing ? "scale-100" : "scale-0 group-hover/bar:scale-100"
              )}
              style={{ left: `${played}%` }}
            />
            {hover && (
              <span
                className="pointer-events-none absolute bottom-6 -translate-x-1/2 rounded-sm bg-black/90 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums"
                style={{ left: `${hover.percent}%` }}
              >
                {formatTime(hover.time)}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className={iconButton}
            >
              {playing ? (
                <Pause className="size-5 fill-white" aria-hidden />
              ) : (
                <Play className="size-5 fill-white" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={() => skip(-10)}
              aria-label="Back 10 seconds"
              className={cn(iconButton, "hidden sm:inline-flex")}
            >
              <SkipBack className="size-5" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => skip(10)}
              aria-label="Forward 10 seconds"
              className={cn(iconButton, "hidden sm:inline-flex")}
            >
              <SkipForward className="size-5" strokeWidth={1.75} aria-hidden />
            </button>

            <div className="group/vol flex items-center" data-player-volume>
              <button
                type="button"
                onClick={() => {
                  const video = videoRef.current;
                  if (video) video.muted = !video.muted;
                }}
                aria-label={muted ? "Unmute" : "Mute"}
                className={iconButton}
              >
                <VolumeIcon className="size-5" strokeWidth={1.75} aria-hidden />
              </button>
              <div className="w-0 overflow-hidden transition-[width] duration-200 ease-out group-hover/vol:w-20 group-focus-within/vol:w-20">
                <Slider
                  value={[muted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => setVolumeTo(value)}
                  thumbLabel="Volume"
                  className="w-20 px-1"
                />
              </div>
            </div>

            <span className="ml-1 text-xs font-medium text-white tabular-nums">
              {formatTime(currentTime)}
              <span className="text-white/50"> / </span>
              {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <DropdownMenu onOpenChange={wake}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Playback settings"
                    className={iconButton}
                  >
                    <Settings
                      className="size-5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  className="w-44 max-h-80"
                >
                  {levels.length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-fg-tertiary">
                        Quality
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onSelect={() => {
                          if (hlsRef.current) hlsRef.current.currentLevel = -1;
                          setLevel(-1);
                        }}
                      >
                        {level === -1 ? (
                          <Check aria-hidden />
                        ) : (
                          <span className="size-4" />
                        )}
                        Auto
                      </DropdownMenuItem>
                      {levels.map((entry) => (
                        <DropdownMenuItem
                          key={entry.index}
                          onSelect={() => {
                            if (hlsRef.current)
                              hlsRef.current.currentLevel = entry.index;
                            setLevel(entry.index);
                          }}
                        >
                          {level === entry.index ? (
                            <Check aria-hidden />
                          ) : (
                            <span className="size-4" />
                          )}
                          {entry.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuLabel className="text-fg-tertiary">
                    Playback speed
                  </DropdownMenuLabel>
                  {SPEEDS.map((speed) => (
                    <DropdownMenuItem
                      key={speed}
                      onSelect={() => {
                        const video = videoRef.current;
                        if (video) video.playbackRate = speed;
                      }}
                    >
                      {rate === speed ? (
                        <Check aria-hidden />
                      ) : (
                        <span className="size-4" />
                      )}
                      {speed === 1 ? "Normal" : `${speed}×`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                onClick={togglePip}
                aria-label="Picture in picture"
                className={cn(iconButton, "hidden sm:inline-flex")}
              >
                <PictureInPicture2
                  className="size-5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit full screen" : "Full screen"}
                className={iconButton}
              >
                {fullscreen ? (
                  <Minimize className="size-5" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Maximize className="size-5" strokeWidth={1.75} aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
