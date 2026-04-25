'use client';

import React, { useEffect, useRef, useState } from 'react';
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

const LERP_FACTOR = 0.38; // Further increased for even faster video seeking
const HEADLINE_REVEAL_THRESHOLD = 0.78;
const SCROLL_HINT_FADE_THRESHOLD = 0.05;

export const ScrollVideoHero: React.FC<ScrollVideoHeroProps> = ({
  videoSrc = '/assets/hero/mixer_optimized.mp4',
  videoSrcWebm,
  posterSrc = '/assets/hero/mixer-poster.jpg',
  scrollLength = 2.1, // Further reduced for even faster scroll effect
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
  const scrollProgressRef = useRef(0);
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

    const handleLoadedMetadata = () => {
      videoDurationRef.current = video.duration;
      isVideoReadyRef.current = true;
      video.pause();
      setIsLoaded(true);
    };

    const handleError = () => {
      console.error('Video failed to load');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    // Attempt to load
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // Scroll handling with RAF-based lerp
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const windowHeight = window.innerHeight;

          // Calculate scroll progress within section (0 to 1)
          const rawProgress = (scrollY - sectionTop) / (sectionHeight - windowHeight);
          const clampedProgress = Math.max(0, Math.min(1, rawProgress));

          scrollProgressRef.current = clampedProgress;

          // Update target video time
          if (videoDurationRef.current > 0) {
            targetTimeRef.current = clampedProgress * videoDurationRef.current;
          }

          // UI state updates
          setProgressBarWidth(clampedProgress * 100);
          setShowHeadline(clampedProgress > HEADLINE_REVEAL_THRESHOLD);
          setShowScrollHint(clampedProgress < SCROLL_HINT_FADE_THRESHOLD);

          // Background word parallax (moves opposite to scroll)
          setBgWordOffset(-clampedProgress * 200);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // RAF loop for smooth video time interpolation
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const animate = () => {
      if (isVideoReadyRef.current && videoDurationRef.current > 0) {
        // Lerp current time towards target time
        const diff = targetTimeRef.current - currentTimeRef.current;

        if (Math.abs(diff) > 0.045) { // Only update if difference is significant (tuned)
          currentTimeRef.current += diff * LERP_FACTOR;

          // Set video time with safety checks
          try {
            if (video.readyState >= 2 && Math.abs(video.currentTime - currentTimeRef.current) > 0.03) {
              video.currentTime = currentTimeRef.current;
            }
          } catch (err) {
            // Silently ignore seeking errors
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Calculate section height based on scrollLength
  const sectionHeight = `${scrollLength * 100}vh`;

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
          <span className="text-[clamp(120px,20vw,300px)] font-bold text-white/[0.03] uppercase tracking-widest whitespace-nowrap select-none">
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
            { value: '500+', label: 'Projekte' },
            { value: '50k+', label: 'm³' },
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
