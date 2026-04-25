import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollImageSequenceHeroProps {
  frameCount?: number;
  framePath?: (idx: number) => string;
  scrollLength?: number;
  eyebrow?: string;
  headline?: React.ReactNode;
  bgWord?: string;
  posterSrc?: string;
}

const defaultFramePath = (idx: number) =>
  `/assets/hero/frames/frame_${String(idx).padStart(4, '0')}.png`;

const MIN_PROGRESS = 0;
const MAX_PROGRESS = 1;
const PROGRESS_EPSILON = 0.0005;
// Higher lerp = more responsive to input; blending handles visual continuity
const LERP_FACTOR = 0.12;
const WHEEL_SENSITIVITY = 0.0009;
const TOUCH_SENSITIVITY = 0.0035;
const HEADLINE_REVEAL_THRESHOLD = 0.78;
const SCROLL_HINT_FADE_THRESHOLD = 0.05;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const shouldIgnoreKeyboardTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
};

export const ScrollImageSequenceHero: React.FC<ScrollImageSequenceHeroProps> = ({
  frameCount = 171,
  framePath = defaultFramePath,
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
  posterSrc = '/assets/hero/mixer-poster.jpeg',
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const touchYRef = useRef<number | null>(null);
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const pendingPageScrollRef = useRef(0);
  // Store GPU-resident bitmaps for zero-copy drawImage
  const bitmapsRef = useRef<ImageBitmap[]>([]);
  const loadedCountRef = useRef(0);
  const lastDrawnProgressRef = useRef(-1);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [bgWordOffset, setBgWordOffset] = useState(0);

  // Preload frames → convert to ImageBitmap (GPU-resident, fastest drawImage source)
  useEffect(() => {
    const bitmaps: ImageBitmap[] = new Array(frameCount);
    bitmapsRef.current = bitmaps;
    loadedCountRef.current = 0;

    for (let i = 1; i <= frameCount; i++) {
      const idx = i - 1;
      const img = new window.Image();
      img.src = framePath(i);
      img.onload = () => {
        createImageBitmap(img).then((bmp) => {
          bitmaps[idx] = bmp;
          loadedCountRef.current += 1;
          if (loadedCountRef.current === 1) {
            setIsLoaded(true);
            // Draw first frame immediately
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
              ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
            }
          }
        });
      };
    }
  }, [frameCount, framePath]);

  // Blended draw: interpolate between two adjacent frames for sub-frame smoothness
  const drawBlended = useCallback(
    (exactIdx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const bitmaps = bitmapsRef.current;

      const lo = Math.floor(exactIdx);
      const hi = Math.min(lo + 1, frameCount - 1);
      const alpha = exactIdx - lo;

      const bLo = bitmaps[lo];
      const bHi = bitmaps[hi];
      if (!bLo) return;

      ctx.globalAlpha = 1;
      ctx.drawImage(bLo, 0, 0, canvas.width, canvas.height);

      if (bHi && alpha > 0.01) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(bHi, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
    },
    [frameCount]
  );

  // Keep canvas resolution in sync with window
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Redraw at current progress after resize
      const exactIdx = currentProgressRef.current * (frameCount - 1);
      drawBlended(exactIdx);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawBlended, frameCount]);

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

  // RAF loop: lerp progress, blend frames, update UI state
  useEffect(() => {
    const animate = () => {
      const current = currentProgressRef.current;
      const target = targetProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) <= PROGRESS_EPSILON) {
        currentProgressRef.current = target;
      } else {
        currentProgressRef.current = clamp(current + diff * LERP_FACTOR, MIN_PROGRESS, MAX_PROGRESS);
      }

      const progress = currentProgressRef.current;

      // Only redraw canvas when progress has actually changed
      if (Math.abs(progress - lastDrawnProgressRef.current) > 0.00001) {
        drawBlended(progress * (frameCount - 1));
        lastDrawnProgressRef.current = progress;
      }

      setProgressBarWidth(progress * 100);
      setShowHeadline(progress > HEADLINE_REVEAL_THRESHOLD);
      setShowScrollHint(progress < SCROLL_HINT_FADE_THRESHOLD);
      setBgWordOffset(-progress * 200);

      const pending = pendingPageScrollRef.current;
      if (Math.abs(pending) > 0) {
        const atBottom = pending > 0 && progress >= MAX_PROGRESS - PROGRESS_EPSILON;
        const atTop = pending < 0 && progress <= MIN_PROGRESS + PROGRESS_EPSILON;
        if (atBottom || atTop) {
          window.scrollBy({ top: pending, left: 0, behavior: 'auto' });
          pendingPageScrollRef.current = 0;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawBlended, frameCount]);

  // Intercept scroll/touch/keyboard while animation is running
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
      if (e.key === 'ArrowUp') deltaY = -120;
      if (e.key === 'PageDown') deltaY = 360;
      if (e.key === 'PageUp') deltaY = -360;
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
      const nextY = e.touches[0].clientY;
      const deltaY = touchYRef.current - nextY;
      touchYRef.current = nextY;
      if (!canConsumeScroll(deltaY)) return;
      e.preventDefault();
      applyProgressDelta(deltaY, TOUCH_SENSITIVITY, true);
    };

    const clearTouch = () => { touchYRef.current = null; };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', clearTouch, { capture: true });
    window.addEventListener('touchcancel', clearTouch, { capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheel, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('touchstart', handleTouchStart, true);
      window.removeEventListener('touchmove', handleTouchMove, true);
      window.removeEventListener('touchend', clearTouch, true);
      window.removeEventListener('touchcancel', clearTouch, true);
    };
  }, [applyProgressDelta, canConsumeScroll, isSectionVisible]);

  const sectionHeight = `${Math.max(scrollLength, 1) * 100}vh`;

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#07070a]">
        {/* Loading state */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#07070a]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
              <p className="text-zinc-500 text-sm uppercase tracking-widest">Loading</p>
            </div>
          </div>
        )}

        {/* Canvas — GPU-blended frame renderer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
            objectFit: 'cover',
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-[#07070a]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070a]/80 via-transparent to-[#07070a]/60 pointer-events-none" />

        {/* Bottom vignette */}
        <div
          className="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #f7f7f7 0%, transparent 100%)' }}
        />

        {/* Background parallax word */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ transform: `translateY(${bgWordOffset}px)` }}
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

        {/* Brand bar top-left */}
        <div className="absolute top-8 left-8 z-20">
          <p className="text-zinc-500 text-xs uppercase tracking-[0.3em]">{eyebrow}</p>
        </div>

        {/* Top progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800/50 z-30">
          <div
            className="h-full bg-amber-500 transition-none"
            style={{ width: `${progressBarWidth}%` }}
          />
        </div>

        {/* Headline — reveals at 78% */}
        <div
          className="absolute bottom-24 left-0 right-0 flex justify-center px-6 z-20"
          style={{
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
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
          style={{ opacity: showScrollHint ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Scroll to explore
          </span>
          <ChevronDown className="w-5 h-5 text-zinc-500 animate-bounce" />
        </div>

        {/* Stats — right side, desktop only */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block z-20">
          {[
            { value: '25+', label: 'Vite' },
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
