import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MixerTruck3D } from '@/components/three/MixerTruck3D';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const TruckMixerHero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    // Simulate loading time for Three.js
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;

    // Main scroll trigger for 3D truck
    const mainTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });
    triggersRef.current.push(mainTrigger);

    // Text animations
    const headline = textRef.current.querySelector('.headline');
    const subheadline = textRef.current.querySelector('.subheadline');
    const chars = headline?.querySelectorAll('.char');

    if (chars) {
      gsap.set(chars, { opacity: 0, y: 40 });

      const textTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: '5% top',
        end: '35% top',
        scrub: 0.5,
        onUpdate: (self) => {
          chars.forEach((char, i) => {
            const delay = i * 0.02;
            const progress = Math.max(0, Math.min(1, (self.progress - delay) * 3));
            gsap.set(char, {
              opacity: progress,
              y: 40 * (1 - progress),
            });
          });
        },
      });
      triggersRef.current.push(textTrigger);
    }

    if (subheadline) {
      gsap.set(subheadline, { opacity: 0, y: 30 });

      const subTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: '20% top',
        end: '40% top',
        scrub: 0.5,
        onUpdate: (self) => {
          gsap.set(subheadline, {
            opacity: self.progress,
            y: 30 * (1 - self.progress),
          });
        },
      });
      triggersRef.current.push(subTrigger);
    }

    // Fade out text at end
    const fadeTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: '75% top',
      end: '95% top',
      scrub: 0.5,
      onUpdate: (self) => {
        gsap.set(textRef.current, {
          opacity: 1 - self.progress,
          y: -50 * self.progress,
        });
      },
    });
    triggersRef.current.push(fadeTrigger);

    return () => {
      triggersRef.current.forEach((trigger) => trigger.kill());
      triggersRef.current = [];
    };
  }, []);

  const headlineText = 'BETON CILËSOR';

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0a0a0a]"
      style={{ height: '400vh' }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-[#c41e3a] border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
              <p className="text-white/60 text-sm uppercase tracking-widest">Loading 3D...</p>
            </div>
          </div>
        )}

        {/* 3D Truck */}
        {isLoaded && <MixerTruck3D scrollProgress={scrollProgress} />}

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, transparent 0%, rgba(10,10,10,0.6) 60%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-48 pointer-events-none z-[5]"
          style={{
            background: 'linear-gradient(to top, #f7f7f7, transparent)',
          }}
        />

        {/* Text overlay */}
        <div
          ref={textRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
        >
          <p className="text-[12px] font-medium tracking-[0.3em] uppercase text-[#c41e3a] mb-6">
            Mantovani Beton sh.p.k
          </p>

          <h1 className="headline text-[clamp(48px,10vw,120px)] font-bold text-white leading-[0.95] tracking-tight text-center">
            {headlineText.split('').map((char, i) => (
              <span key={i} className="inline-block char">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>

          <p className="subheadline text-xl md:text-2xl text-white/60 mt-6 text-center max-w-[600px] px-6">
            Prodhim dhe furnizim betoni për projekte ndërtimi dhe infrastrukturore
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 transition-opacity duration-500"
          style={{ opacity: scrollProgress < 0.1 ? 1 : 0 }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
            Scroll to explore
          </span>
          <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" />
        </div>

        {/* Stats */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block z-20">
          {[
            { value: '25+', label: 'Vite Eksperiencë' },
            { value: '500+', label: 'Projekte' },
            { value: '50k+', label: 'm³ Beton' },
          ].map((stat) => (
            <div key={stat.label} className="text-right mb-8 last:mb-0">
              <div className="text-[clamp(28px,3vw,40px)] font-bold text-white leading-none">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-widest text-white/40 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TruckMixerHero;
