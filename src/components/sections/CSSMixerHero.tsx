import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const CSSMixerHero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const drumRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !drumRef.current || !containerRef.current) return;

    const drum = drumRef.current;
    const container = containerRef.current;
    const text = textRef.current;

    // Main scroll timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          // Rotate drum based on scroll
          gsap.set(drum, {
            rotation: self.progress * 720,
          });
        },
      },
    });

    if (tl.scrollTrigger) {
      triggersRef.current.push(tl.scrollTrigger);
    }

    // Container scale and position
    const containerTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '50% top',
        scrub: 1,
      },
    });

    containerTl.fromTo(
      container,
      { scale: 0.8, y: 100 },
      { scale: 1.2, y: -50, ease: 'none' }
    );

    if (containerTl.scrollTrigger) {
      triggersRef.current.push(containerTl.scrollTrigger);
    }

    // Text animations
    if (text) {
      const headline = text.querySelector('.headline');
      const subheadline = text.querySelector('.subheadline');
      const chars = headline?.querySelectorAll('.char');

      // Character reveal
      if (chars) {
        gsap.set(chars, { opacity: 0, y: 40 });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '30% top',
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
      }

      // Subheadline
      if (subheadline) {
        gsap.set(subheadline, { opacity: 0, y: 30 });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: '15% top',
          end: '35% top',
          scrub: 0.5,
          onUpdate: (self) => {
            gsap.set(subheadline, {
              opacity: self.progress,
              y: 30 * (1 - self.progress),
            });
          },
        });
      }

      // Fade out at end
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: '70% top',
        end: '90% top',
        scrub: 0.5,
        onUpdate: (self) => {
          gsap.set(text, {
            opacity: 1 - self.progress,
            y: -30 * self.progress,
          });
        },
      });
    }

    // Cleanup
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
      style={{ height: '300vh' }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-[#0a0a0a]" />

        {/* Concrete particles */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#6a6a6a] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.4,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* CSS 3D Mixer */}
        <div
          ref={containerRef}
          className="relative"
          style={{
            width: '600px',
            height: '400px',
            perspective: '1000px',
          }}
        >
          {/* Drum container */}
          <div
            ref={drumRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '500px',
              height: '300px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Main drum - conical shape made of circles */}
            {Array.from({ length: 12 }).map((_, i) => {
              const progress = i / 11;
              // Conical profile
              const radius = 0.5 + Math.sin(progress * Math.PI) * 0.5;
              const x = progress * 400 - 200;

              return (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 rounded-full border-4 border-[#7a7a7a]"
                  style={{
                    width: `${radius * 280}px`,
                    height: `${radius * 280}px`,
                    left: `calc(50% + ${x}px)`,
                    transform: 'translate(-50%, -50%)',
                    background: `linear-gradient(135deg, ${
                      i % 2 === 0 ? '#6a6a6a' : '#5a5a5a'
                    } 0%, ${i % 2 === 0 ? '#4a4a4a' : '#3a3a3a'} 100%)`,
                    boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.3)',
                  }}
                />
              );
            })}

            {/* Spiral fins */}
            <div
              className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2"
              style={{
                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 20px,
                  rgba(0,0,0,0.1) 20px,
                  rgba(0,0,0,0.1) 40px
                )`,
                borderRadius: '50%',
              }}
            />

            {/* Front ring */}
            <div
              className="absolute top-1/2 left-[85%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-8 border-[#4a4a4a]"
              style={{
                background: '#2a2a2a',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
              }}
            />

            {/* Back ring */}
            <div
              className="absolute top-1/2 left-[15%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-6 border-[#4a4a4a]"
              style={{
                background: '#2a2a2a',
              }}
            />
          </div>

          {/* Support frame */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-2 bg-[#3a3a3a] rounded" />

          {/* Front support */}
          <div
            className="absolute top-[60%] left-[85%] w-2 h-24 bg-[#4a4a4a]"
            style={{ transform: 'rotate(-15deg)', transformOrigin: 'top' }}
          />
          <div
            className="absolute top-[60%] left-[85%] w-2 h-24 bg-[#4a4a4a]"
            style={{ transform: 'rotate(15deg)', transformOrigin: 'top' }}
          />

          {/* Back support */}
          <div
            className="absolute top-[60%] left-[15%] w-2 h-20 bg-[#4a4a4a]"
            style={{ transform: 'rotate(-20deg)', transformOrigin: 'top' }}
          />
          <div
            className="absolute top-[60%] left-[15%] w-2 h-20 bg-[#4a4a4a]"
            style={{ transform: 'rotate(20deg)', transformOrigin: 'top' }}
          />
        </div>

        {/* Text overlay */}
        <div
          ref={textRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
        >
          <p className="text-[12px] font-medium tracking-[0.3em] uppercase text-[#c41e3a] mb-6">
            Mantovani Beton
          </p>

          <h1 className="headline text-[clamp(48px,10vw,120px)] font-bold text-white leading-[0.95] tracking-tight text-center">
            {headlineText.split('').map((char, i) => (
              <span key={i} className="inline-block char">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>

          <p className="subheadline text-xl md:text-2xl text-white/60 mt-6 text-center max-w-[600px] px-6">
            Për ndërtime që qëndrojnë në kohë
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
            Scroll to explore
          </span>
          <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" />
        </div>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, transparent 0%, rgba(10,10,10,0.4) 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-[5]"
          style={{
            background: 'linear-gradient(to top, #f7f7f7, transparent)',
          }}
        />

        {/* Stats */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block z-20">
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
};

export default CSSMixerHero;
