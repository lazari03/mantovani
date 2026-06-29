import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollImageSequenceHeroProps {
  videoSrc?: string;
  posterSrc?: string;
  scrollLength?: number;
  eyebrow?: string;
  headline?: React.ReactNode;
  bgWord?: string;
  scrollHint?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
}

const MIN_PROGRESS         = 0;
const MAX_PROGRESS         = 1;
const PROGRESS_EPSILON     = 0.0005;
const WHEEL_SENSITIVITY    = 0.0009;
const TOUCH_SENSITIVITY    = 0.0035;
const HEADLINE_REVEAL_THRESHOLD  = 0.78;
const SCROLL_HINT_FADE_THRESHOLD = 0.05;
const INERTIA_DAMPING      = 0.85;
const MIN_INERTIA_VELOCITY = 0.5;
const MAX_INERTIA_VELOCITY = 60;
const MAX_SCROLL_PER_FRAME = 60;
const REWIND_SPEED         = 0.035;
const EASE_FACTOR          = 0.14;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const shouldIgnoreKeyboardTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
};

/**
 * ponytail: a 339-frame image sequence is a video. Browsers hardware-decode
 * real video and seek (currentTime) natively — that's the actual fix for
 * "smooth like a video", not a hand-rolled bitmap/canvas decode pipeline.
 * Frames were pre-encoded once via:
 *   ffmpeg -framerate 30 -i frame_%04d.webp -c:v libx264 -pix_fmt yuv420p
 *          -crf 20 -preset slow -movflags +faststart hero.mp4
 */
export const ScrollImageSequenceHero: React.FC<ScrollImageSequenceHeroProps> = ({
  videoSrc  = '/assets/hero/hero.mp4',
  posterSrc = '/assets/hero/mixer-poster.jpeg',
  scrollLength = 1,
  eyebrow    = 'Mantovani Beton.',
  headline   = (
    <>
      Beton <span className="text-amber-500">cilësor</span>
      <br />
      për ndërtime të qëndrueshme
    </>
  ),
  bgWord     = 'MANTOVANI',
  scrollHint = 'Scroll to explore',
  stat1Value = '25+',
  stat1Label = 'Vite',
  stat2Value = '500+',
  stat2Label = 'Projekte',
  stat3Value = '50k+',
  stat3Label = 'm³',
}) => {
  const sectionRef   = useRef<HTMLElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const progressFill = useRef<HTMLDivElement>(null);
  const bgWordRef    = useRef<HTMLDivElement>(null);

  const rafRef               = useRef<number>(0);
  const touchYRef            = useRef<number | null>(null);
  const currentProgressRef   = useRef(0);
  const targetProgressRef    = useRef(0);
  const pendingPageScrollRef = useRef(0);
  const isReadyRef = useRef(false);

  const velocityRef      = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const inertiaActiveRef = useRef(false);
  const wasVisibleRef    = useRef(false);
  const rewindingRef     = useRef(false);

  const [isLoaded,       setIsLoaded]       = useState(false);
  const [showHeadline,   setShowHeadline]   = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Video is ready to scrub once enough is buffered to seek anywhere
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => {
      isReadyRef.current = true;
      setIsLoaded(true);
    };
    if (v.readyState >= 2) onReady();
    else v.addEventListener('loadeddata', onReady, { once: true });
    return () => v.removeEventListener('loadeddata', onReady);
  }, []);

  const isSectionVisible = useCallback(() => {
    const s = sectionRef.current;
    if (!s) return false;
    const r = s.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }, []);

  const canConsumeScroll = useCallback((deltaY: number) => {
    if (deltaY > 0) return currentProgressRef.current < MAX_PROGRESS - PROGRESS_EPSILON;
    if (deltaY < 0) return currentProgressRef.current > MIN_PROGRESS + PROGRESS_EPSILON;
    return false;
  }, []);

  const applyProgressDelta = useCallback(
    (deltaY: number, sensitivity: number, passOverflow: boolean) => {
      if (deltaY === 0) return;
      const deltaProgress = deltaY * sensitivity;
      const prev = targetProgressRef.current;
      const next = clamp(prev + deltaProgress, MIN_PROGRESS, MAX_PROGRESS);
      targetProgressRef.current = next;
      if (!passOverflow || sensitivity === 0) return;
      const overflow = prev + deltaProgress - next;
      if (Math.abs(overflow) <= PROGRESS_EPSILON) return;
      pendingPageScrollRef.current += overflow / sensitivity;
    }, []
  );

  useEffect(() => {
    let prevShowHeadline   = false;
    let prevShowScrollHint = true;

    const animate = () => {
      if (inertiaActiveRef.current) {
        velocityRef.current *= INERTIA_DAMPING;
        if (Math.abs(velocityRef.current) < MIN_INERTIA_VELOCITY || !isSectionVisible()) {
          velocityRef.current = 0;
          inertiaActiveRef.current = false;
        } else {
          applyProgressDelta(velocityRef.current, TOUCH_SENSITIVITY, true);
        }
      }

      const nowVisible = isSectionVisible();
      if (nowVisible && !wasVisibleRef.current && currentProgressRef.current > 0.8) {
        rewindingRef.current = true;
        pendingPageScrollRef.current = 0;
      }
      wasVisibleRef.current = nowVisible;

      if (rewindingRef.current) {
        const np = Math.max(0, currentProgressRef.current - REWIND_SPEED);
        if (np <= PROGRESS_EPSILON) {
          rewindingRef.current = false;
          currentProgressRef.current = 0;
          targetProgressRef.current  = 0;
        } else {
          currentProgressRef.current = np;
          targetProgressRef.current  = np;
        }
      } else {
        const diff = targetProgressRef.current - currentProgressRef.current;
        currentProgressRef.current = Math.abs(diff) < PROGRESS_EPSILON
          ? targetProgressRef.current
          : currentProgressRef.current + diff * EASE_FACTOR;
      }

      const progress = currentProgressRef.current;

      // Scrub the video — native hardware-decoded seek, no per-frame JS decode
      const v = videoRef.current;
      if (v && v.duration) {
        v.currentTime = progress * v.duration;
      }

      if (progressFill.current)
        progressFill.current.style.width = `${progress * 100}%`;
      if (bgWordRef.current)
        bgWordRef.current.style.transform = `translateY(${-progress * 200}px)`;

      const nextShowHeadline   = progress > HEADLINE_REVEAL_THRESHOLD;
      const nextShowScrollHint = progress < SCROLL_HINT_FADE_THRESHOLD;
      if (nextShowHeadline   !== prevShowHeadline)   { prevShowHeadline   = nextShowHeadline;   setShowHeadline(nextShowHeadline); }
      if (nextShowScrollHint !== prevShowScrollHint) { prevShowScrollHint = nextShowScrollHint; setShowScrollHint(nextShowScrollHint); }

      const pending = pendingPageScrollRef.current;
      if (Math.abs(pending) > 0) {
        const target   = targetProgressRef.current;
        const atBottom = pending > 0 && target >= MAX_PROGRESS - PROGRESS_EPSILON;
        const atTop    = pending < 0 && target <= MIN_PROGRESS + PROGRESS_EPSILON;
        if (atBottom || atTop) {
          const amount = Math.sign(pending) * Math.min(Math.abs(pending), MAX_SCROLL_PER_FRAME);
          window.scrollBy({ top: amount, left: 0, behavior: 'instant' });
          pendingPageScrollRef.current -= amount;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [applyProgressDelta, isSectionVisible]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isReadyRef.current || !isSectionVisible() || !canConsumeScroll(e.deltaY)) return;
      e.preventDefault();
      applyProgressDelta(e.deltaY, WHEEL_SENSITIVITY, true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReadyRef.current || !isSectionVisible() || shouldIgnoreKeyboardTarget(e.target)) return;
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
      if (e.touches.length !== 1) return;
      touchYRef.current = e.touches[0].clientY;
      velocityRef.current = 0;
      inertiaActiveRef.current = false;
      rewindingRef.current = false;
      lastTouchTimeRef.current = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isReadyRef.current || !isSectionVisible() || touchYRef.current === null || e.touches.length !== 1) return;
      const nextY  = e.touches[0].clientY;
      const deltaY = touchYRef.current - nextY;
      const now    = performance.now();
      const dt     = now - lastTouchTimeRef.current;
      if (dt > 0) {
        const raw = (deltaY / dt) * 16;
        velocityRef.current = Math.max(-MAX_INERTIA_VELOCITY, Math.min(MAX_INERTIA_VELOCITY, raw));
      }
      lastTouchTimeRef.current = now;
      touchYRef.current = nextY;
      if (!canConsumeScroll(deltaY)) return;
      e.preventDefault();
      applyProgressDelta(deltaY, TOUCH_SENSITIVITY, true);
    };

    const handleTouchEnd = () => {
      touchYRef.current = null;
      if (isReadyRef.current && Math.abs(velocityRef.current) > MIN_INERTIA_VELOCITY) {
        inertiaActiveRef.current = true;
      } else {
        velocityRef.current = 0;
      }
    };

    const clearTouch = () => {
      touchYRef.current = null;
      velocityRef.current = 0;
      inertiaActiveRef.current = false;
    };

    window.addEventListener('wheel',       handleWheel,      { passive: false, capture: true });
    window.addEventListener('keydown',     handleKeyDown,    { capture: true });
    window.addEventListener('touchstart',  handleTouchStart, { passive: true,  capture: true });
    window.addEventListener('touchmove',   handleTouchMove,  { passive: false, capture: true });
    window.addEventListener('touchend',    handleTouchEnd,   { capture: true });
    window.addEventListener('touchcancel', clearTouch,       { capture: true });

    return () => {
      window.removeEventListener('wheel',       handleWheel,      true);
      window.removeEventListener('keydown',     handleKeyDown,    true);
      window.removeEventListener('touchstart',  handleTouchStart, true);
      window.removeEventListener('touchmove',   handleTouchMove,  true);
      window.removeEventListener('touchend',    handleTouchEnd,   true);
      window.removeEventListener('touchcancel', clearTouch,       true);
    };
  }, [applyProgressDelta, canConsumeScroll, isSectionVisible]);

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
        {/* Poster — shown until video can be scrubbed */}
        <img
          src={posterSrc}
          alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: isLoaded ? 0 : 1, transition: 'opacity 0.35s ease' }}
        />

        {/* Video — scrubbed via currentTime, hardware-decoded by the browser */}
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.35s ease', zIndex: 1, transform: 'translateZ(0)' }}
        />

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-[#07070a]/50 pointer-events-none" style={{ zIndex: 3 }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070a]/80 via-transparent to-[#07070a]/60 pointer-events-none" style={{ zIndex: 3 }} />

        {/* Bottom vignette */}
        <div
          className="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #f7f7f7 0%, transparent 100%)', zIndex: 3 }}
        />

        {/* Background parallax word */}
        <div
          ref={bgWordRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ zIndex: 4, willChange: 'transform' }}
        >
          <span
            className="font-bold text-white/[0.03] uppercase tracking-widest select-none"
            style={{ fontSize: 'clamp(32px,10vw,120px)', lineHeight: 1.1, wordBreak: 'break-word', whiteSpace: 'pre-line', textAlign: 'center', width: '100%', display: 'block' }}
          >
            {bgWord}
          </span>
        </div>

        {/* Brand bar */}
        <div className="absolute top-8 left-8" style={{ zIndex: 20 }}>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.3em]">{eyebrow}</p>
        </div>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800/50" style={{ zIndex: 30 }}>
          <div ref={progressFill} className="h-full bg-amber-500" style={{ width: '0%' }} />
        </div>

        {/* Headline — reveals at 78% */}
        <div
          className="absolute bottom-24 left-0 right-0 flex justify-center px-6"
          style={{ zIndex: 20, opacity: showHeadline ? 1 : 0, transform: `translateY(${showHeadline ? 0 : 30}px)`, transition: 'opacity 0.6s ease, transform 0.6s ease' }}
        >
          <h1 className="text-[clamp(36px,6vw,80px)] font-bold text-white leading-[0.95] tracking-tight text-center">
            {headline}
          </h1>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ zIndex: 20, opacity: showScrollHint ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{scrollHint}</span>
          <ChevronDown className="w-5 h-5 text-zinc-500 animate-bounce" />
        </div>

        {/* Stats — desktop */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block" style={{ zIndex: 20 }}>
          {[
            { value: stat1Value, label: stat1Label },
            { value: stat2Value, label: stat2Label },
            { value: stat3Value, label: stat3Label },
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

export default ScrollImageSequenceHero;
