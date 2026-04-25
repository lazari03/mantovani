import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollImageSequenceHero } from '@/components/sections/ScrollImageSequenceHero';
import { About } from '@/components/sections/About';
import { Services } from '@/components/sections/Services';
import { WhyUs } from '@/components/sections/WhyUs';
import { Gallery } from '@/components/sections/Gallery';
import { Mission } from '@/components/sections/Mission';

function App() {
  const [loading, setLoading] = useState(true);
  const handleNavigate = useCallback((section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Simulate waiting for main images/assets (replace with real logic if needed)
  useEffect(() => {
    // Wait for window load event (all assets loaded)
    const onLoad = () => setLoading(false);
    if (document.readyState === 'complete') {
      setLoading(false);
    } else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#0a0a0a] transition-opacity duration-500">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-[#c41e3a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#c41e3a] text-sm uppercase tracking-widest">Loading site...</p>
          </div>
        </div>
      )}
      <Header onNavigate={handleNavigate} />
      <main style={{ filter: loading ? 'blur(2px)' : 'none', pointerEvents: loading ? 'none' : 'auto' }}>
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
