import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollImageSequenceHero } from '@/components/sections/ScrollImageSequenceHero';
import { About } from '@/components/sections/About';
import { Services } from '@/components/sections/Services';
import { WhyUs } from '@/components/sections/WhyUs';
import { Gallery } from '@/components/sections/Gallery';
import { Mission } from '@/components/sections/Mission';

const PRELOAD_COUNT = 339;
const MIN_LOADER_MS = 2000;

const heroFrameSrc = (i: number) =>
  `/assets/hero/frames/frame_${String(i).padStart(4, '0')}.webp`;

function App() {
  const [loading, setLoading]           = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [fadeOut, setFadeOut]           = useState(false);

  const handleNavigate = useCallback((section: string) => {
    const element = document.getElementById(section);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const startTime = performance.now();

    const finish = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startTime;
      const wait = Math.max(0, MIN_LOADER_MS - elapsed);
      setTimeout(() => {
        if (cancelled) return;
        setFadeOut(true);
        setTimeout(() => { if (!cancelled) setLoading(false); }, 500);
      }, wait);
    };

    let finished = false;
    const onEach = () => {
      if (cancelled || finished) return;
      loaded++;
      setLoadProgress(Math.round((loaded / PRELOAD_COUNT) * 100));
      if (loaded >= PRELOAD_COUNT) {
        finished = true;
        finish();
      }
    };

    for (let i = 1; i <= PRELOAD_COUNT; i++) {
      const img = new Image();
      img.onload = onEach;
      img.onerror = onEach; // count errors so loader never hangs
      img.src = heroFrameSrc(i);
    }

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative">
      {loading && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          style={{
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: fadeOut ? 'none' : 'auto',
          }}
        >
          <div className="flex flex-col items-center gap-6">
            {/* MANTOVANI text that fills left → right as frames load */}
            <div
              className="relative select-none"
              style={{ fontSize: 'clamp(22px, 5.5vw, 60px)' }}
            >
              {/* Unfilled (ghost) layer */}
              <span className="block font-bold uppercase tracking-[0.22em] text-[#d4d4d4]">
                MANTOVANI
              </span>
              {/* Filled layer — width driven by loadProgress */}
              <span
                className="absolute inset-0 font-bold uppercase tracking-[0.22em] text-[#1a1a1a] overflow-hidden whitespace-nowrap"
                style={{
                  width: `${loadProgress}%`,
                  transition: 'width 0.3s ease-out',
                }}
              >
                MANTOVANI
              </span>
            </div>

            {/* Thin amber progress bar */}
            <div className="w-40 h-px bg-[#e5e5e5] overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{
                  width: `${loadProgress}%`,
                  transition: 'width 0.3s ease-out',
                }}
              />
            </div>

            {/* Percentage */}
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#bbb]">
              {loadProgress}%
            </p>
          </div>
        </div>
      )}

      <Header onNavigate={handleNavigate} />
      <main
        style={{
          filter: loading ? 'blur(4px)' : 'none',
          transition: 'filter 0.4s ease',
          pointerEvents: loading ? 'none' : 'auto',
        }}
      >
        <ScrollImageSequenceHero />
        <About />
        <Services />
        <WhyUs />
        <Gallery />
        <Mission />
      </main>
      <Footer />
    </div>
  );
}

export default App;
