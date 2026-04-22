import { useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollVideoHero } from '@/components/sections/ScrollVideoHero';
import { About } from '@/components/sections/About';
import { Services } from '@/components/sections/Services';
import { WhyUs } from '@/components/sections/WhyUs';
import { Gallery } from '@/components/sections/Gallery';
import { Mission } from '@/components/sections/Mission';

function App() {
  const handleNavigate = useCallback((section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative">
      <Header onNavigate={handleNavigate} />
      <main>
        <ScrollVideoHero />
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
