import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollVideoHeroProps {
  videoSrc?: string;
  videoSrcWebm?: string;
  posterSrc?: string;
  scrollLength?: number;
  eyebrow?: string;
  headline?: React.ReactNode;
  bgWord?: string;
}

const MIN_PROGRESS = 0;
const MAX_PROGRESS = 1;
const PROGRESS_EPSILON = 0.001;
const PROGRESS_LERP_FACTOR = 0.16;
const TIME_LERP_FACTOR = 0.35;
const WHEEL_SENSITIVITY = 0.0009;
const TOUCH_SENSITIVITY = 0.0035;
const HEADLINE_REVEAL_THRESHOLD = 0.78;
const SCROLL_HINT_FADE_THRESHOLD = 0.05;
// Minimum fraction of video that must be buffered before we allow interaction.
// 0.08 = 8% — enough for the first ~10 seconds of a 2-min video; the rest
// loads in the background while the user scrolls through the beginning.
const MIN_BUFFER_FRACTION = 0.08;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const shouldIgnoreKeyboardTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
};

export const ScrollVideoHero: React.FC<ScrollVideoHeroProps> = ({
  videoSrc = '/assets/hero/mixer_optimized.mp4',
  videoSrcWebm,
  posterSrc = '/assets/hero/mixer-poster.jpg',
  scrollLength = 1,
  eyebrow = 'Mantovani Beton.',
  headline = (
    <>
      Beton <span className="text-amber-500">cilësor</span>
      <br />
      për ndërtime të qëndrueshme
    </>
  ),
  bgWord = 'MANTOVANI',
}) => {
  const sectionRef        = useRef<HTMLElement>(null);
  const videoRef          = useRef<HTMLVideoElement>(null);
  const rafRef            = useRef<number>(0);
  const touchYRef         = useRef<number | null>(null);
  const currentProgressRef   = useRef(0);
  const targetProgressRef    = useRef(0);
  const pendingPageScrollRef = useRef(0);
  const targetTimeRef     = useRef(0);
  const currentTimeRef    = useRef(0);
  const videoDurationRef  = useRef(0);
  const isVideoReadyRef   = useRef(false);
  // iOS Safari ignores preload — we must do play+pause inside a user gesture
  // to start buffering.  This ref tracks whether we already did it.
  const iosUnlockedRef    = useRef(false);

  const [showHeadline, setShowHeadline]     = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [isLoaded, setIsLoaded]             = useState(false);
  const [bgWordOffset, setBgWordOffset]     = useState(0);
  // 0–1 fraction of the video that is currently buffered
  const [bufferFraction, setBufferFraction] = useState(0);

  // ─── Video setup & buffering ────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isAlive = true;

    // Call once we have enough data to allow scroll interaction
    const markReady = () => {
      if (!isAlive || isVideoReadyRef.current) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      videoDurationRef.current = duration;
      isVideoReadyRef.current  = true;

      // Seek to frame 0 so the first frame is visible (not the mid-video poster)
      try { video.currentTime = 0; } catch { /* ignore */ }

      setIsLoaded(true);
    };

    // Update the visible buffer progress bar and fire markReady when threshold met
    const checkBuffer = () => {
      if (!isAlive) return;
      if (!video.buffered.length || !video.duration) return;

      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const fraction    = bufferedEnd / video.duration;
      setBufferFraction(fraction);

      if (
        !isVideoReadyRef.current &&
        video.readyState >= 3 &&         // HAVE_FUTURE_DATA — current + ahead
        fraction >= MIN_BUFFER_FRACTION
      ) {
        markReady();
      }
    };

    // `canplaythrough` = browser believes it can play to the end without stopping.
    // Use as primary ready signal on desktop; mobile may never fire it, so we
    // also use the `progress` polling above.
    const handleCanPlayThrough = () => {
      checkBuffer();
      if (!isVideoReadyRef.current && video.readyState >= 3) markReady();
    };

    const handleLoadedMetadata = () => {
      // Duration is now known; try an immediate buffer check
      checkBuffer();
    };

    const handleProgress = () => checkBuffer();   // fires as new data arrives
    const handleError    = () => { /* silently ignore; poster stays visible */ };

    video.addEventListener('loadedmetadata',  handleLoadedMetadata);
    video.addEventListener('canplaythrough',  handleCanPlayThrough);
    video.addEventListener('progress',        handleProgress);
    video.addEventListener('error',           handleError);

    // Trigger the browser's network request.  On desktop with preload="auto"
    // this starts buffering immediately.  On iOS it does nothing until the
    // play+pause unlock below.
    video.load();

    return () => {
      isAlive = false;
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('progress',       handleProgress);
      video.removeEventListener('error',          handleError);
    };
  }, []);

  // ─── RAF loop ───────────────────────────────────────────────────────────────
  const isSectionVisible = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }, []);

  const canConsumeScroll = useCallback((deltaY: number) => {
    if (deltaY > 0) return currentProgressRef.current < MAX_PROGRESS - PROGRESS_EPSILON;
    if (deltaY < 0) return currentProgressRef.current > MIN_PROGRESS + PROGRESS_EPSILON;
    return false;
  }, []);

  const applyProgressDelta = useCallback(
    (deltaY: number, sensitivity: number, passOverflowToPage: boolean) => {
      if (deltaY === 0) return;
      const deltaProgress  = deltaY * sensitivity;
      const previousTarget = targetProgressRef.current;
      const nextTarget     = clamp(previousTarget + deltaProgress, MIN_PROGRESS, MAX_PROGRESS);
      targetProgressRef.current = nextTarget;

      if (!passOverflowToPage || sensitivity === 0) return;
      const overflow = previousTarget + deltaProgress - nextTarget;
      if (Math.abs(overflow) > PROGRESS_EPSILON) {
        pendingPageScrollRef.current += overflow / sensitivity;
      }
    },
    []
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const animate = () => {
      const currentProgress = currentProgressRef.current;
      const targetProgress  = targetProgressRef.current;
      const diff            = targetProgress - currentProgress;

      currentProgressRef.current =
        Math.abs(diff) <= PROGRESS_EPSILON
          ? targetProgress
          : clamp(currentProgress + diff * PROGRESS_LERP_FACTOR, MIN_PROGRESS, MAX_PROGRESS);

      const progress = currentProgressRef.current;
      setProgressBarWidth(progress * 100);
      setShowHeadline(progress > HEADLINE_REVEAL_THRESHOLD);
      setShowScrollHint(progress < SCROLL_HINT_FADE_THRESHOLD);
      setBgWordOffset(-progress * 200);

      if (isVideoReadyRef.current && videoDurationRef.current > 0) {
        targetTimeRef.current   = progress * videoDurationRef.current;
        const timeDiff          = targetTimeRef.current - currentTimeRef.current;

        if (Math.abs(timeDiff) > 0.001) {
          currentTimeRef.current = clamp(
            currentTimeRef.current + timeDiff * TIME_LERP_FACTOR,
            0,
            videoDurationRef.current
          );
          try {
            if (
              video.readyState >= 2 &&
              Math.abs(video.currentTime - currentTimeRef.current) > 0.016
            ) {
              video.currentTime = currentTimeRef.current;
            }
          } catch { /* ignore seek errors */ }
        }
      }

      const pendingScroll = pendingPageScrollRef.current;
      if (Math.abs(pendingScroll) > 0) {
        const atBottom = pendingScroll > 0 && progress >= MAX_PROGRESS - PROGRESS_EPSILON;
        const atTop    = pendingScroll < 0 && progress <= MIN_PROGRESS + PROGRESS_EPSILON;
        if (atBottom || atTop) {
          window.scrollBy({ top: pendingScroll, left: 0, behavior: 'auto' });
          pendingPageScrollRef.current = 0;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── Input handlers ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isVideoReadyRef.current || !isSectionVisible() || !canConsumeScroll(e.deltaY)) return;
      e.preventDefault();
      applyProgressDelta(e.deltaY, WHEEL_SENSITIVITY, true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVideoReadyRef.current || !isSectionVisible() || shouldIgnoreKeyboardTarget(e.target)) return;
      let deltaY = 0;
      if (e.key === 'ArrowDown') deltaY = 120;
      if (e.key === 'ArrowUp')   deltaY = -120;
      if (e.key === 'PageDown')  deltaY = 360;
      if (e.key === 'PageUp')    deltaY = -360;
      if (e.key === ' ' || e.key === 'Spacebar') deltaY = e.shiftKey ? -360 : 360;
      if (deltaY === 0 || !canConsumeScroll(deltaY)) return;
      e.preventDefault();
      applyProgressDelta(deltaY, WHEEL_SENSITIVITY, true);
    };

    const handleTouchStart = (e: TouchEvent) => {
      // iOS Safari blocks video buffering until a user gesture (play call).
      // touchstart IS a valid gesture — use it to unlock buffering exactly once.
      if (!iosUnlockedRef.current) {
        iosUnlockedRef.current = true;
        const video = videoRef.current;
        if (video && !isVideoReadyRef.current) {
          video.play()
            .then(() => video.pause())
            .catch(() => { /* iOS may still reject — that's fine */ });
        }
      }
      if (e.touches.length !== 1) return;
      touchYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isVideoReadyRef.current || !isSectionVisible() || touchYRef.current === null || e.touches.length !== 1) return;
      const nextY  = e.touches[0].clientY;
      const deltaY = touchYRef.current - nextY;
      touchYRef.current = nextY;
      if (!canConsumeScroll(deltaY)) return;
      e.preventDefault();
      applyProgressDelta(deltaY, TOUCH_SENSITIVITY, true);
    };

    const clearTouch = () => { touchYRef.current = null; };

    window.addEventListener('wheel',       handleWheel,      { passive: false, capture: true });
    window.addEventListener('keydown',     handleKeyDown,    { capture: true });
    window.addEventListener('touchstart',  handleTouchStart, { passive: true,  capture: true });
    window.addEventListener('touchmove',   handleTouchMove,  { passive: false, capture: true });
    window.addEventListener('touchend',    clearTouch,       { capture: true });
    window.addEventListener('touchcancel', clearTouch,       { capture: true });

    return () => {
      window.removeEventListener('wheel',       handleWheel,      true);
      window.removeEventListener('keydown',     handleKeyDown,    true);
      window.removeEventListener('touchstart',  handleTouchStart, true);
      window.removeEventListener('touchmove',   handleTouchMove,  true);
      window.removeEventListener('touchend',    clearTouch,       true);
      window.removeEventListener('touchcancel', clearTouch,       true);
    };
  }, [applyProgressDelta, canConsumeScroll, isSectionVisible]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  const bufferPct = Math.round(bufferFraction * 100);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${Math.max(scrollLength, 1) * 100}vh`, touchAction: 'none' }}
    >
      <div
        className="sticky top-0 w-full h-screen overflow-hidden bg-[#07070a]"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* ── Buffering overlay ─────────────────────────────────────────────── */}
        {/* Stays visible until the video is ready to seek.  Poster shows behind
            it via the video element's poster attribute so there's no dark flash. */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-end pb-16 pointer-events-none">
            {/* Buffer progress bar */}
            <div className="w-48 flex flex-col items-center gap-3">
              <div className="w-full h-px bg-zinc-700 overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{
                    width: `${bufferPct}%`,
                    transition: bufferPct > 0 ? 'width 0.4s ease' : 'none',
                  }}
                />
              </div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em]">
                {bufferPct > 0 ? `${bufferPct}%` : 'Loading…'}
              </p>
            </div>
          </div>
        )}

        {/* ── Video ─────────────────────────────────────────────────────────── */}
        {/* The poster is shown by the browser until the first frame is decoded.
            On iOS, this means the poster is always visible while we wait for
            the play+pause unlock gesture to trigger buffering. */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster={posterSrc}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: 1,
            // GPU layer keeps seeking and compositing off the main thread
            transform: 'translateZ(0)',
            willChange: 'auto',
          }}
        >
          {videoSrcWebm && <source src={videoSrcWebm} type="video/webm" />}
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-[#07070a]/50 pointer-events-none"
          style={{ zIndex: 3 }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#07070a]/80 via-transparent to-[#07070a]/60 pointer-events-none"
          style={{ zIndex: 3 }}
        />

        {/* Bottom vignette */}
        <div
          className="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #f7f7f7 0%, transparent 100%)',
            zIndex: 3,
          }}
        />

        {/* Background parallax word */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ transform: `translateY(${bgWordOffset}px)`, zIndex: 4, willChange: 'transform' }}
        >
          <span
            className="font-bold text-white/[0.03] uppercase tracking-widest select-none"
            style={{
              fontSize: 'clamp(32px, 10vw, 120px)',
              lineHeight: 1.1,
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
              textAlign: 'center',
              width: '100%',
              display: 'block',
            }}
          >
            {bgWord}
          </span>
        </div>

        {/* Brand bar */}
        <div className="absolute top-8 left-8" style={{ zIndex: 20 }}>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.3em]">{eyebrow}</p>
        </div>

        {/* Progress bar — shows scroll progress once loaded, buffer progress while loading */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800/50" style={{ zIndex: 30 }}>
          <div
            className="h-full bg-amber-500 transition-none"
            style={{ width: isLoaded ? `${progressBarWidth}%` : `${bufferPct}%` }}
          />
        </div>

        {/* Headline — reveals at 78% scroll progress */}
        <div
          className="absolute bottom-24 left-0 right-0 flex justify-center px-6"
          style={{
            zIndex: 20,
            opacity: showHeadline ? 1 : 0,
            transform: `translateY(${showHeadline ? 0 : 30}px)`,
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <h1 className="text-[clamp(36px,6vw,80px)] font-bold text-white leading-[0.95] tracking-tight text-center">
            {headline}
          </h1>
        </div>

        {/* Scroll hint — fades at 5% */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ zIndex: 20, opacity: showScrollHint ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            {isLoaded ? 'Scroll to explore' : 'Touch to load'}
          </span>
          <ChevronDown className="w-5 h-5 text-zinc-500 animate-bounce" />
        </div>

        {/* Stats — desktop only */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block" style={{ zIndex: 20 }}>
          {[
            { value: '25+',   label: 'Vite' },
            { value: '5000+', label: 'Projekte' },
            { value: '500k+', label: 'm³' },
          ].map((stat) => (
            <div key={stat.label} className="text-right mb-6 last:mb-0">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollVideoHero;
