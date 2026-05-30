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
  scrollHint?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
}

const defaultFramePath = (idx: number) =>
  `/assets/hero/frames/frame_${String(idx).padStart(4, '0')}.webp`;

const MIN_PROGRESS         = 0;
const MAX_PROGRESS         = 1;
const PROGRESS_EPSILON     = 0.0005;
const WHEEL_SENSITIVITY    = 0.0009;
const TOUCH_SENSITIVITY    = 0.0035;
const HEADLINE_REVEAL_THRESHOLD  = 0.78;
const SCROLL_HINT_FADE_THRESHOLD = 0.05;
const INITIAL_BATCH        = 40;   // frames to kick off on mount
const BITMAP_LOOKAHEAD     = 55;   // frames to pre-decode ahead of current position
const BITMAP_BEHIND        = 8;    // frames to keep decoded behind current position
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

// Draw bitmap onto canvas with object-fit:cover semantics
function drawCover(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  cw: number,
  ch: number,
  alpha: number
) {
  if (alpha <= 0) return;
  const scale = Math.max(cw / bitmap.width, ch / bitmap.height);
  const dw = bitmap.width * scale;
  const dh = bitmap.height * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.globalAlpha = alpha;
  ctx.drawImage(bitmap, dx, dy, dw, dh);
  ctx.globalAlpha = 1;
}

type BitmapEntry = ImageBitmap | 'pending' | null;

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
  scrollHint = 'Scroll to explore',
  stat1Value = '25+',
  stat1Label = 'Vite',
  stat2Value = '500+',
  stat2Label = 'Projekte',
  stat3Value = '50k+',
  stat3Label = 'm³',
}) => {
  const sectionRef   = useRef<HTMLElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const ctxRef       = useRef<CanvasRenderingContext2D | null>(null);
  const progressFill = useRef<HTMLDivElement>(null);
  const bgWordRef    = useRef<HTMLDivElement>(null);

  const rafRef               = useRef<number>(0);
  const touchYRef            = useRef<number | null>(null);
  const currentProgressRef   = useRef(0);
  const targetProgressRef    = useRef(0);
  const pendingPageScrollRef = useRef(0);

  // Download pool: HTMLImageElement (just for network fetching)
  const imagePool  = useRef<(HTMLImageElement | null)[]>([]);
  // Decode pool: ImageBitmap decoded off main thread via createImageBitmap()
  const bitmapPool = useRef<BitmapEntry[]>([]);

  const loadFrameRef = useRef<(i: number) => void>(() => {});
  const isReadyRef   = useRef(false);

  const velocityRef      = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const inertiaActiveRef = useRef(false);
  const wasVisibleRef    = useRef(false);
  const rewindingRef     = useRef(false);

  // Track last rendered lo/hi/alpha to avoid redundant canvas draws
  const prevLoRef    = useRef(-1);
  const prevHiRef    = useRef(-1);
  const prevAlphaRef = useRef(-1);

  const [isLoaded, setIsLoaded]             = useState(false);
  const [showHeadline, setShowHeadline]     = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // ─── Canvas size ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Re-cache context after resize (context is invalidated by dimension change)
      ctxRef.current = canvas.getContext('2d');
      // Force a redraw by invalidating cached indices
      prevLoRef.current    = -1;
      prevHiRef.current    = -1;
      prevAlphaRef.current = -1;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ─── Frame loading + decoding ─────────────────────────────────────────────
  useEffect(() => {
    const imgPool: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    const bmPool: BitmapEntry[]               = new Array(frameCount).fill(null);
    imagePool.current  = imgPool;
    bitmapPool.current = bmPool;

    const loadFrame = (i: number) => {
      if (i < 0 || i >= frameCount) return;
      if (imgPool[i] !== null || bmPool[i] !== null) return; // already in-flight or done

      const img = new window.Image();
      if (i === 0) (img as HTMLImageElement & { fetchpriority?: string }).fetchpriority = 'high';
      imgPool[i] = img;
      bmPool[i]  = 'pending';

      img.src = framePath(i + 1);

      const decode = async () => {
        try {
          // img.decode() forces decode off the main thread before we touch the pixels
          await img.decode();
          // createImageBitmap gives us a GPU-ready bitmap — drawImage(bitmap) = zero-cost blit
          const bitmap = await createImageBitmap(img);
          bmPool[i] = bitmap;
          if (i === 0 && !isReadyRef.current) {
            isReadyRef.current = true;
            setIsLoaded(true);
          }
        } catch {
          bmPool[i] = null; // allow retry next lookahead tick
        }
      };

      img.onload  = decode;
      img.onerror = () => { bmPool[i] = null; };
    };

    loadFrameRef.current = loadFrame;

    // Kick off the first batch immediately
    for (let i = 0; i < Math.min(INITIAL_BATCH, frameCount); i++) loadFrame(i);

    return () => {
      loadFrameRef.current = () => {};
      // Release all GPU bitmaps on unmount
      bmPool.forEach(b => { if (b instanceof ImageBitmap) b.close(); });
    };
  }, [frameCount, framePath]);

  // ─── Section visibility ───────────────────────────────────────────────────
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
    },
    []
  );

  // ─── RAF animation loop ───────────────────────────────────────────────────
  useEffect(() => {
    let prevShowHeadline   = false;
    let prevShowScrollHint = true;

    const animate = () => {
      // Touch inertia
      if (inertiaActiveRef.current) {
        velocityRef.current *= INERTIA_DAMPING;
        if (Math.abs(velocityRef.current) < MIN_INERTIA_VELOCITY || !isSectionVisible()) {
          velocityRef.current = 0;
          inertiaActiveRef.current = false;
        } else {
          applyProgressDelta(velocityRef.current, TOUCH_SENSITIVITY, true);
        }
      }

      // Re-entry rewind
      const nowVisible = isSectionVisible();
      if (nowVisible && !wasVisibleRef.current && currentProgressRef.current > 0.8) {
        rewindingRef.current = true;
        pendingPageScrollRef.current = 0;
      }
      wasVisibleRef.current = nowVisible;

      // Progress lerp / rewind
      if (rewindingRef.current) {
        const newProg = Math.max(0, currentProgressRef.current - REWIND_SPEED);
        if (newProg <= PROGRESS_EPSILON) {
          rewindingRef.current = false;
          currentProgressRef.current = 0;
          targetProgressRef.current  = 0;
        } else {
          currentProgressRef.current = newProg;
          targetProgressRef.current  = newProg;
        }
      } else {
        const diff = targetProgressRef.current - currentProgressRef.current;
        currentProgressRef.current = Math.abs(diff) < PROGRESS_EPSILON
          ? targetProgressRef.current
          : currentProgressRef.current + diff * EASE_FACTOR;
      }

      const progress  = currentProgressRef.current;
      const exactIdx  = progress * (frameCount - 1);
      const lo        = Math.floor(exactIdx);
      const hi        = Math.min(lo + 1, frameCount - 1);
      const alpha     = exactIdx - lo;

      const bmPool  = bitmapPool.current;
      const loadFn  = loadFrameRef.current;

      // Trigger decode for the lookahead window
      const decodeStart = Math.max(0, lo - 2);
      const decodeEnd   = Math.min(lo + BITMAP_LOOKAHEAD, frameCount - 1);
      for (let j = decodeStart; j <= decodeEnd; j++) {
        if (bmPool[j] === null) loadFn(j);
      }

      // Release bitmaps that are far behind current position (free GPU memory)
      const closeIdx = lo - BITMAP_BEHIND - 1;
      if (closeIdx >= 0) {
        const old = bmPool[closeIdx];
        if (old instanceof ImageBitmap) {
          old.close();
          bmPool[closeIdx] = null;
          // Also allow the HTMLImageElement to be GC'd
          if (imagePool.current[closeIdx]) imagePool.current[closeIdx] = null;
        }
      }

      // Canvas render — only if lo/hi/alpha changed meaningfully
      const alphaChanged = Math.abs(alpha - prevAlphaRef.current) > 0.004;
      if (lo !== prevLoRef.current || hi !== prevHiRef.current || alphaChanged) {
        const ctx    = ctxRef.current;
        const canvas = canvasRef.current;
        const loBm   = bmPool[lo];
        const hiBm   = bmPool[hi];

        if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
          const cw = canvas.width;
          const ch = canvas.height;

          ctx.clearRect(0, 0, cw, ch);

          if (loBm instanceof ImageBitmap) {
            drawCover(ctx, loBm, cw, ch, 1);
          }
          if (hiBm instanceof ImageBitmap && alpha > 0.004) {
            drawCover(ctx, hiBm, cw, ch, alpha);
          }

          prevLoRef.current    = lo;
          prevHiRef.current    = hi;
          prevAlphaRef.current = alpha;
        }
      }

      // Progress bar (direct DOM — no React re-render)
      if (progressFill.current)
        progressFill.current.style.width = `${progress * 100}%`;
      if (bgWordRef.current)
        bgWordRef.current.style.transform = `translateY(${-progress * 200}px)`;

      // Headline + scroll hint state (only setState on actual change)
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

      // Pass excess scroll to page
      const pending = pendingPageScrollRef.current;
      if (Math.abs(pending) > 0) {
        const target = targetProgressRef.current;
        const atBottom = pending > 0 && target >= MAX_PROGRESS - PROGRESS_EPSILON;
        const atTop    = pending < 0 && target <= MIN_PROGRESS + PROGRESS_EPSILON;
        if (atBottom || atTop) {
          const scrollAmount = Math.sign(pending) * Math.min(Math.abs(pending), MAX_SCROLL_PER_FRAME);
          window.scrollBy({ top: scrollAmount, left: 0, behavior: 'instant' });
          pendingPageScrollRef.current -= scrollAmount;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frameCount, applyProgressDelta, isSectionVisible]);

  // ─── Input handlers (scroll / keyboard / touch) ──── unchanged ────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────
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
        {/* Poster — visible until frame 0 bitmap is ready */}
        <img
          src={posterSrc}
          alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: isLoaded ? 0 : 1, transition: 'opacity 0.35s ease', zIndex: 1 }}
        />

        {/*
          Single canvas replaces the two <img> cross-fade elements.
          Frames are drawn via ctx.drawImage(ImageBitmap) — pure GPU blit,
          zero main-thread decode cost on every frame transition.
        */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.35s ease',
            zIndex: 2,
          }}
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
          style={{ zIndex: 4, willChange: 'transform' }}
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

        {/* Scroll hint */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ zIndex: 20, opacity: showScrollHint ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            {scrollHint}
          </span>
          <ChevronDown className="w-5 h-5 text-zinc-500 animate-bounce" />
        </div>

        {/* Stats — desktop only */}
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
