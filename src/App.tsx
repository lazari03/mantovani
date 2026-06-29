import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollImageSequenceHero } from '@/components/sections/ScrollImageSequenceHero';
import { About } from '@/components/sections/About';
import { Services } from '@/components/sections/Services';
import { WhyUs } from '@/components/sections/WhyUs';
import { Sectors } from '@/components/sections/Sectors';
import { Mission } from '@/components/sections/Mission';
import { useTranslation, type Lang } from '@/lib/i18nContext';

const MIN_LOADER_MS = 2000;
const HERO_VIDEO_SRC = '/assets/hero/hero.mp4';

function getHeroHeadline(lang: Lang) {
  switch (lang) {
    case 'en':
      return (<>Quality <span className="text-amber-500">concrete</span><br />for lasting structures</>);
    case 'it':
      return (<>Calcestruzzo <span className="text-amber-500">di qualità</span><br />per costruzioni durature</>);
    default:
      return (<>Beton <span className="text-amber-500">cilësor</span><br />për ndërtime të qëndrueshme</>);
  }
}

function App() {
  const { t, lang } = useTranslation();

  const [loading,      setLoading]      = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [fadeOut,      setFadeOut]      = useState(false);

  const handleNavigate = useCallback((section: string) => {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Preload the hero video while MANTOVANI fills in. fetch() puts the
  // response in the HTTP cache, so the <video src> in the hero plays
  // instantly once loading flips to false — no re-download.
  useEffect(() => {
    let cancelled = false;
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

    fetch(HERO_VIDEO_SRC)
      .then(async (res) => {
        const total = Number(res.headers.get('content-length')) || 0;
        if (!total || !res.body) { setLoadProgress(100); return; }
        let received = 0;
        const reader = res.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          received += value.length;
          setLoadProgress(Math.min(100, Math.round((received / total) * 100)));
        }
      })
      .catch(() => setLoadProgress(100)) // don't let a network hiccup hang the loader
      .finally(finish);

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative">
      {/* ── MANTOVANI loader ── */}
      {loading && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          style={{
            opacity:        fadeOut ? 0 : 1,
            transition:     'opacity 0.5s ease',
            pointerEvents:  fadeOut ? 'none' : 'auto',
          }}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative select-none" style={{ fontSize: 'clamp(22px,5.5vw,60px)' }}>
              <span className="block font-bold uppercase tracking-[0.22em] text-[#d4d4d4]">
                MANTOVANI
              </span>
              <span
                className="absolute inset-0 font-bold uppercase tracking-[0.22em] text-[#1a1a1a] overflow-hidden whitespace-nowrap"
                style={{ width: `${loadProgress}%`, transition: 'width 0.3s ease-out' }}
              >
                MANTOVANI
              </span>
            </div>
            <div className="w-40 h-px bg-[#e5e5e5] overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${loadProgress}%`, transition: 'width 0.3s ease-out' }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#bbb]">
              {loadProgress}%
            </p>
          </div>
        </div>
      )}

      <Header onNavigate={handleNavigate} />

      <main style={{ pointerEvents: loading ? 'none' : 'auto' }}>
        <ScrollImageSequenceHero
          videoSrc={HERO_VIDEO_SRC}
          eyebrow={t('heroEyebrow')}
          headline={getHeroHeadline(lang)}
          scrollHint={t('heroScrollHint')}
          stat1Value={t('heroStat1Value')}
          stat1Label={t('heroStat1Label')}
          stat2Value={t('heroStat2Value')}
          stat2Label={t('heroStat2Label')}
          stat3Value={t('heroStat3Value')}
          stat3Label={t('heroStat3Label')}
        />
        <About />
        <Services />
        <WhyUs />
        <Sectors />
        <Mission />
      </main>
      <Footer />
    </div>
  );
}

export default App;
