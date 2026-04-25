'use client';

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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const shouldIgnoreKeyboardTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
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
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const touchYRef = useRef<number | null>(null);
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const pendingPageScrollRef = useRef(0);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const videoDurationRef = useRef(0);
  const isVideoReadyRef = useRef(false);

  const [showHeadline, setShowHeadline] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgWordOffset, setBgWordOffset] = useState(0);

  // Video setup and metadata handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isAlive = true;

    const markReady = () => {
      if (!isAlive) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      videoDurationRef.current = duration;
      isVideoReadyRef.current = true;

      try {
        video.currentTime = 0;
        currentTimeRef.current = 0;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => video.pause()).catch(() => video.pause());
        } else {
          video.pause();
        }
      } catch {
        // Ignore autoplay/seek errors
      }

      setIsLoaded(true);
    };

    const checkReady = () => {
      if (!isAlive) return;
      if (video.readyState >= 2) {
        markReady();
      } else {
        requestAnimationFrame(checkReady);
      }
    };

    const handleLoadedMetadata = () => {
      markReady();
      checkReady();
    };

    const handleError = () => {
      console.error('Video failed to load');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    // Attempt to load
    video.load();
    checkReady();

    return () => {
      isAlive = false;
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const isSectionVisible = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }, []);

  const canConsumeScroll = useCallback((deltaY: number) => {
    if (deltaY > 0) {
      return currentProgressRef.current < MAX_PROGRESS - PROGRESS_EPSILON;
    }
    if (deltaY < 0) {
      return currentProgressRef.current > MIN_PROGRESS + PROGRESS_EPSILON;
    }
    return false;
  }, []);

  const applyProgressDelta = useCallback(
    (deltaY: number, sensitivity: number, passOverflowToPage: boolean) => {
      if (deltaY === 0) return;

      const deltaProgress = deltaY * sensitivity;
      const previousTarget = targetProgressRef.current;
      const nextTarget = clamp(previousTarget + deltaProgress, MIN_PROGRESS, MAX_PROGRESS);
      targetProgressRef.current = nextTarget;

      if (!passOverflowToPage || sensitivity === 0) return;

      const overflowProgress = previousTarget + deltaProgress - nextTarget;
      if (Math.abs(overflowProgress) <= PROGRESS_EPSILON) return;

      const overflowDeltaY = overflowProgress / sensitivity;
      if (overflowDeltaY !== 0) {
        pendingPageScrollRef.current += overflowDeltaY;
      }
    },
    []
  );

  // RAF loop: smooth progress, smooth seeking, and release body scroll only at boundaries.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const animate = () => {
      const currentProgress = currentProgressRef.current;
      const targetProgress = targetProgressRef.current;
      const progressDiff = targetProgress - currentProgress;

      if (Math.abs(progressDiff) <= PROGRESS_EPSILON) {
        currentProgressRef.current = targetProgress;
      } else {
        currentProgressRef.current = clamp(
          currentProgress + progressDiff * PROGRESS_LERP_FACTOR,
          MIN_PROGRESS,
          MAX_PROGRESS
        );
      }

      const progress = currentProgressRef.current;
      setProgressBarWidth(progress * 100);
      setShowHeadline(progress > HEADLINE_REVEAL_THRESHOLD);
      setShowScrollHint(progress < SCROLL_HINT_FADE_THRESHOLD);
      setBgWordOffset(-progress * 200);

      if (isVideoReadyRef.current && videoDurationRef.current > 0) {
        targetTimeRef.current = progress * videoDurationRef.current;
        const timeDiff = targetTimeRef.current - currentTimeRef.current;

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
          } catch {
            // Silently ignore seeking errors
          }
        }
      }

      const pendingScroll = pendingPageScrollRef.current;
      if (Math.abs(pendingScroll) > 0) {
        const reachedBottom =
          pendingScroll > 0 && progress >= MAX_PROGRESS - PROGRESS_EPSILON;
        const reachedTop =
          pendingScroll < 0 && progress <= MIN_PROGRESS + PROGRESS_EPSILON;

        if (reachedBottom || reachedTop) {
          window.scrollBy({ top: pendingScroll, left: 0, behavior: 'auto' });
          pendingPageScrollRef.current = 0;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Lock page scrolling while the hero video is in progress.
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (!isSectionVisible()) return;
      if (!canConsumeScroll(event.deltaY)) return;

      event.preventDefault();
      applyProgressDelta(event.deltaY, WHEEL_SENSITIVITY, true);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSectionVisible()) return;
      if (shouldIgnoreKeyboardTarget(event.target)) return;

      let deltaY = 0;
      if (event.key === 'ArrowDown') deltaY = 120;
      if (event.key === 'ArrowUp') deltaY = -120;
      if (event.key === 'PageDown') deltaY = 360;
      if (event.key === 'PageUp') deltaY = -360;
      if (event.key === ' ' || event.key === 'Spacebar') {
        deltaY = event.shiftKey ? -360 : 360;
      }

      if (deltaY === 0 || !canConsumeScroll(deltaY)) return;

      event.preventDefault();
      applyProgressDelta(deltaY, WHEEL_SENSITIVITY, true);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchYRef.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isSectionVisible()) return;
      if (touchYRef.current === null || event.touches.length !== 1) return;

      const nextY = event.touches[0].clientY;
      const deltaY = touchYRef.current - nextY;
      touchYRef.current = nextY;

      if (!canConsumeScroll(deltaY)) return;

      event.preventDefault();
      applyProgressDelta(deltaY, TOUCH_SENSITIVITY, true);
    };

    const clearTouch = () => {
      touchYRef.current = null;
    };

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

  // Calculate section height based on scrollLength
  const sectionHeight = `${Math.max(scrollLength, 1) * 100}vh`;

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: sectionHeight }}
    >
      {/* Sticky container */}
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

        {/* Video element */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          poster={posterSrc}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          {videoSrcWebm && <source src={videoSrcWebm} type="video/webm" />}
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-[#07070a]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070a]/80 via-transparent to-[#07070a]/60 pointer-events-none" />

        {/* Bottom vignette for fade into page */}
        <div
          className="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #f7f7f7 0%, transparent 100%)',
          }}
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

        {/* Headline - bottom center, reveals at 78% */}
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

        {/* Scroll hint - fades at 5% */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
          style={{
            opacity: showScrollHint ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Scroll to explore
          </span>
          <ChevronDown className="w-5 h-5 text-zinc-500 animate-bounce" />
        </div>

        {/* Stats - right side */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block z-20">
          {[
            { value: '25+', label: 'Vite' },
            { value: '5000+', label: 'Projekte' },
            { value: '500k+', label: 'm³' },
          ].map((stat) => (
            <div key={stat.label} className="text-right mb-6 last:mb-0">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollVideoHero;
