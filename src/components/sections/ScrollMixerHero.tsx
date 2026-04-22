import React, { useEffect, useRef, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useImageSequence } from '@/hooks/useImageSequence';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ScrollMixerHeroProps {
  onLoaded?: () => void;
}

const HEADLINE = 'BETON CILËSOR';
const SUBHEADLINE = 'Për ndërtime që qëndrojnë në kohë';

export const ScrollMixerHero: React.FC<ScrollMixerHeroProps> = ({ onLoaded }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isDrawingRef = useRef(false);

  const [showIndicator, setShowIndicator] = useState(true);

  // Image sequence configuration
  const FRAME_COUNT = 120;
  const { images, isLoaded, progress } = useImageSequence({
    frameCount: FRAME_COUNT,
    basePath: '/frames/mixer',
    padLength: 4,
    extension: 'webp',
    preloadBatch: 30,
  });

  // Canvas setup
  useEffect(() => {
    if (!canvasRef.current || !isLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    // Draw initial frame
    const drawFrame = (frameIndex: number) => {
      if (isDrawingRef.current) return;
      isDrawingRef.current = true;

      const clampedIndex = Math.max(0, Math.min(frameIndex, FRAME_COUNT - 1));
      const img = images[clampedIndex];

      if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate cover positioning
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.naturalWidth / img.naturalHeight;

        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          offsetX = (canvas.width - drawWidth) / 2;
        } else {
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }

      isDrawingRef.current = false;
    };

    // Initial draw
    drawFrame(0);

    // Animation loop - only redraw when frame changes
    const animate = () => {
      const targetFrame = frameRef.current;
      drawFrame(targetFrame);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [images, isLoaded]);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    if (!sectionRef.current || !textContainerRef.current || !isLoaded) return;

    const section = sectionRef.current;
    const textContainer = textContainerRef.current;

    // Split text into characters
    const headline = textContainer.querySelector('.headline');
    const subheadline = textContainer.querySelector('.subheadline');

    if (headline && subheadline) {
      // Split headline into spans
      const headlineText = headline.textContent || '';
      headline.innerHTML = headlineText
        .split('')
        .map((char) =>
          char === ' '
            ? '<span class="inline-block">&nbsp;</span>'
            : `<span class="inline-block char">${char}</span>`
        )
        .join('');

      // Get all character spans
      const chars = headline.querySelectorAll('.char');

      // Create main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          pin: false,
          onUpdate: (self) => {
            // Update frame based on scroll progress
            const targetFrame = Math.floor(self.progress * (FRAME_COUNT - 1));
            frameRef.current = targetFrame;

            // Hide indicator after scrolling
            if (self.progress > 0.05) {
              setShowIndicator(false);
            } else {
              setShowIndicator(true);
            }
          },
          onLeave: () => {
            if (onLoaded) onLoaded();
          },
        },
      });

      // Store ScrollTrigger reference for cleanup
      scrollTriggerRef.current = tl.scrollTrigger || null;

      // Animate headline characters with stagger
      gsap.set(chars, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '30% top',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          chars.forEach((char, i) => {
            const staggerDelay = i * 0.03;
            const charProgress = Math.max(0, Math.min(1, (progress - staggerDelay) * 2));
            gsap.set(char, {
              opacity: charProgress,
              y: 40 * (1 - charProgress),
            });
          });
        },
      });

      // Animate subheadline
      gsap.set(subheadline, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: section,
        start: '15% top',
        end: '40% top',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(subheadline, {
            opacity: progress,
            y: 30 * (1 - progress),
          });
        },
      });

      // Fade out text at end
      ScrollTrigger.create({
        trigger: section,
        start: '70% top',
        end: '90% top',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(textContainer, {
            opacity: 1 - progress,
            y: -50 * progress,
          });
        },
      });
    }

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) {
          st.kill();
        }
      });
    };
  }, [isLoaded, onLoaded]);

  // Memoize character spans to prevent re-renders
  const headlineChars = useMemo(() => {
    return HEADLINE.split('').map((char, i) => (
      <span
        key={i}
        className="inline-block char"
        style={{ opacity: 0, transform: 'translateY(40px)' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '300vh' }}
    >
      {/* Sticky container */}
      <div
        ref={containerRef}
        className="sticky top-0 w-full h-screen overflow-hidden bg-[#0a0a0a]"
      >
        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-[#c41e3a] border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
              <p className="text-white/60 text-sm uppercase tracking-widest">
                Loading {Math.round(progress * 100)}%
              </p>
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background:
              'radial-gradient(ellipse at 30% 50%, transparent 0%, rgba(10,10,10,0.6) 70%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, transparent 30%, transparent 70%, rgba(10,10,10,0.8) 100%)',
          }}
        />

        {/* Text overlay */}
        <div
          ref={textContainerRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Overline */}
          <p
            className="text-[12px] font-medium tracking-[0.3em] uppercase text-[#c41e3a] mb-6"
            style={{ opacity: isLoaded ? 1 : 0 }}
          >
            Mantovani Beton
          </p>

          {/* Main headline */}
          <h1 className="headline text-[clamp(48px,10vw,120px)] font-bold text-white leading-[0.95] tracking-tight text-center">
            {headlineChars}
          </h1>

          {/* Subheadline */}
          <p className="subheadline text-xl md:text-2xl text-white/60 mt-6 text-center max-w-[600px] px-6">
            {SUBHEADLINE}
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity duration-500"
          style={{
            zIndex: 10,
            opacity: showIndicator && isLoaded ? 1 : 0,
          }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
            Scroll to explore
          </span>
          <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" />
        </div>

        {/* Stats - right side */}
        <div
          className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block"
          style={{ zIndex: 10 }}
        >
          {[
            { value: '25+', label: 'Vite' },
            { value: '500+', label: 'Projekte' },
          ].map((stat) => (
            <div key={stat.label} className="text-right mb-6 last:mb-0">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-white/40">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollMixerHero;
