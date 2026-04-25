import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollImageSequenceHeroProps {
  frameCount?: number;
  framePath?: (idx: number) => string;
  posterSrc?: string;
  scrollLength?: number;
  eyebrow?: string;
  headline?: React.ReactNode;
  bgWord?: string;
}

const defaultFramePath = (idx: number) =>
  `/assets/hero/frames/frame_${String(idx).padStart(4, '0')}.jpg`;

const MIN_PROGRESS = 0;
const MAX_PROGRESS = 1;
const PROGRESS_EPSILON = 0.0005;
const WHEEL_SENSITIVITY = 0.0009;
const TOUCH_SENSITIVITY = 0.0035;
const HEADLINE_REVEAL_THRESHOLD = 0.78;
const SCROLL_HINT_FADE_THRESHOLD = 0.05;
const LOOKAHEAD = 60; // frames to keep loaded ahead of current position
const INITIAL_BATCH = 60; // frames to load on mount before user scrolls

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const shouldIgnoreKeyboardTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
};

export const ScrollImageSequenceHero: React.FC<ScrollImageSequenceHeroProps> = ({
  frameCount = 339,
  framePath = defaultFramePath,
  posterSrc = '/assets/hero/mixer-poster.jpeg',
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
  const sectionRef   = useRef<HTMLElement>(null);
  const loImgRef     = useRef<HTMLImageElement>(null);
  const hiImgRef     = useRef<HTMLImageElement>(null);
  const progressFill = useRef<HTMLDivElement>(null);
  const bgWordRef    = useRef<HTMLDivElement>(null);

  const rafRef               = useRef<number>(0);
  const touchYRef            = useRef<number | null>(null);
  const currentProgressRef   = useRef(0);
  const targetProgressRef    = useRef(0);
  const pendingPageScrollRef = useRef(0);
  const preloadedRef         = useRef<(HTMLImageElement | null)[]>([]);
  const loadFrameRef         = useRef<(i: number) => void>(() => {});
  const loIdxRef = useRef(-1);
  const hiIdxRef = useRef(-1);

  const [isLoaded, setIsLoaded]             = useState(false);
  const [showHeadline, setShowHeadline]     = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Progressive preload: load frame 0 immediately, then INITIAL_BATCH frames,
  // then load on-demand via lookahead in the RAF loop.
  useEffect(() => {
    const pool: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    preloadedRef.current = pool;

    const loadFrame = (i: number) => {
      if (i < 0 || i >= frameCount || pool[i]) return;
      const img = new window.Image();
      pool[i] = img;
      // Give frame 0 maximum priority so the poster swaps out ASAP
      if (i === 0) {
        (img as HTMLImageElement & { fetchpriority?: string }).fetchpriority = 'high';
        img.onload = () => {
          const lo = loImgRef.current;
          if (lo) lo.src = img.src;
          loIdxRef.current = 0;
          setIsLoaded(true);
        };
      }
      img.src = framePath(i + 1);
    };

    loadFrameRef.current = loadFrame;

    // Load first batch only — RAF loop handles the rest as user scrolls
    for (let i = 0; i < Math.min(INITIAL_BATCH, frameCount); i++) {
      loadFrame(i);
    }

    return () => {
      loadFrameRef.current = () => {};
    };
  }, [frameCount, framePath]);

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
    },
    []
  );

  useEffect(() => {
    let prevShowHeadline   = false;
    let prevShowScrollHint = true;

    const animate = () => {
      currentProgressRef.current = targetProgressRef.current;
      const progress = currentProgressRef.current;
      const exactIdx = progress * (frameCount - 1);
      const lo       = Math.floor(exactIdx);
      const hi       = Math.min(lo + 1, frameCount - 1);
      const alpha    = exactIdx - lo;

      const pool  = preloadedRef.current;
      const loEl  = loImgRef.current;
      const hiEl  = hiImgRef.current;
      const loadFn = loadFrameRef.current;

      // Lookahead: trigger loading for frames ahead of current position
      const aheadEnd = Math.min(lo + LOOKAHEAD, frameCount - 1);
      for (let j = lo; j <= aheadEnd; j++) {
        if (!pool[j]) loadFn(j);
      }

      if (loEl && lo !== loIdxRef.current) {
        const img = pool[lo];
        if (img?.complete && img.naturalWidth > 0) {
          loEl.src = img.src;
          loIdxRef.current = lo;
        }
      }
      if (hiEl && hi !== hiIdxRef.current) {
        const img = pool[hi];
        if (img?.complete && img.naturalWidth > 0) {
          hiEl.src = img.src;
          hiIdxRef.current = hi;
        }
      }

      if (hiEl) hiEl.style.opacity = String(alpha);

      if (progressFill.current)
        progressFill.current.style.width = `${progress * 100}%`;
      if (bgWordRef.current)
        bgWordRef.current.style.transform = `translateY(${-progress * 200}px)`;

      const nextShowHeadline   = progress > HEADLINE_REVEAL_THRESHOLD;
      const nextShowScrollHint = progress < SCROLL_HINT_FADE_THRESHOLD;
      if (nextShowHeadline !== prevShowHeadline) {
        prevShowHeadline = nextShowHeadline;
        setShowHeadline(nextShowHeadline);
      }
      if (nextShowScrollHint !== prevShowScrollHint) {
        prevShowScrollHint = nextShowScrollHint;
        setShowScrollHint(nextShowScrollHint);
      }

      const pending = pendingPageScrollRef.current;
      if (Math.abs(pending) > 0) {
        const atBottom = pending > 0 && progress >= MAX_PROGRESS - PROGRESS_EPSILON;
        const atTop    = pending < 0 && progress <= MIN_PROGRESS + PROGRESS_EPSILON;
        if (atBottom || atTop) {
          window.scrollBy({ top: pending, left: 0, behavior: 'auto' });
          pendingPageScrollRef.current = 0;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frameCount]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isSectionVisible() || !canConsumeScroll(e.deltaY)) return;
      e.preventDefault();
      applyProgressDelta(e.deltaY, WHEEL_SENSITIVITY, true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSectionVisible() || shouldIgnoreKeyboardTarget(e.target)) return;
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
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSectionVisible() || touchYRef.current === null || e.touches.length !== 1) return;
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

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${Math.max(scrollLength, 1) * 100}vh` }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#07070a]">

        {/* Poster — shown immediately, fades out once frame 0 is ready */}
        <img
          src={posterSrc}
          alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: isLoaded ? 0 : 1, transition: 'opacity 0.35s ease' }}
        />

        {/* Base frame (lo) — always fully opaque */}
        <img
          ref={loImgRef}
          alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.35s ease', zIndex: 1 }}
        />

        {/* Overlay frame (hi) — opacity driven by fractional progress */}
        <img
          ref={hiImgRef}
          alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: 0, zIndex: 2 }}
        />

        {/* Gradient overlays */}
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
          style={{ zIndex: 4 }}
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

        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800/50" style={{ zIndex: 30 }}>
          <div ref={progressFill} className="h-full bg-amber-500" style={{ width: '0%' }} />
        </div>

        {/* Headline — reveals at 78% */}
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
            Scroll to explore
          </span>
          <ChevronDown className="w-5 h-5 text-zinc-500 animate-bounce" />
        </div>

        {/* Stats — desktop only */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block" style={{ zIndex: 20 }}>
          {[
            { value: '25+',  label: 'Vite' },
            { value: '500+', label: 'Projekte' },
            { value: '50k+', label: 'm³' },
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
