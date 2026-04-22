import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Rreth Nesh', section: 'about' },
  { label: 'Shërbimet', section: 'services' },
  { label: 'Pse Ne', section: 'why-us' },
  { label: 'Galeria', section: 'gallery' },
  { label: 'Misioni', section: 'mission' },
  { label: 'Kontakti', section: 'footer' },
];

const Cookies: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (section: string) => {
    navigate(`/#${section}`);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.08)]'
            : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex-shrink-0">
              <Logo light={false} />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNav(item.section)}
                  className="text-[13px] font-medium tracking-wide uppercase transition-colors duration-200 hover:text-[#c41e3a] text-[#1a1a1a]"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[#1a1a1a]"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navItems.map((item) => (
            <button
              key={item.section}
              onClick={() => handleNav(item.section)}
              className="text-xl font-medium text-[#1a1a1a] tracking-wide uppercase hover:text-[#c41e3a] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-[900px] mx-auto px-6 lg:px-10">
          <div className="bg-white p-8 lg:p-12">
            <h1 className="text-[clamp(32px,4vw,48px)] font-normal text-[#1a1a1a] leading-[1.1] tracking-tight mb-8">
              Politika e Cookies
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-[#666] leading-relaxed mb-6">
                Kjo politikë cookies shpjegon se çfarë janë cookies, si i përdorim ne ato në faqen tonë, dhe si mund t'i menaxhoni preferencat tuaja.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">1. Çfarë janë Cookies?</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Cookies janë skedarë të vegjël teksti që ruhen në pajisjen tuaj (kompjuter, tablet ose telefon celular) kur vizitoni një faqe interneti. Ato përdoren për të bërë faqet të funksionojnë më mirë, si dhe për të siguruar informacion për pronarët e faqes.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">2. Llojet e Cookies që Përdorim</h2>
              
              <h3 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">Cookies thelbësore</h3>
              <p className="text-[#666] leading-relaxed mb-4">
                Këto cookies janë të nevojshme për funksionimin bazal të faqes. Ato ju lejojnë të lëvizni nëpër faqe dhe të përdorni karakteristikat e saj, siç është aksesi në zona të sigurta. Pa këto cookies, shërbime të caktuara nuk mund të ofrohen.
              </p>

              <h3 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">Cookies për performancë</h3>
              <p className="text-[#666] leading-relaxed mb-4">
                Këto cookies mbledhin informacion se si vizitorët përdorin faqen tonë, siç janë faqet që vizitojnë më shpesh dhe mesazhet e gabimit që marrin. Të gjitha informacionet e mbledhura janë anonime dhe përdoren vetëm për të përmirësuar funksionimin e faqes.
              </p>

              <h3 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">Cookies për funksionalitet</h3>
              <p className="text-[#666] leading-relaxed mb-4">
                Këto cookies lejojnë që faqja të mbajë mend zgjedhjet që bëni (siç është emri juaj, gjuhë ose rajon) dhe ofrojnë karakteristika të përmirësuara, më personale.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">3. Si të Menaxhoni Cookies</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Shumica e shfletuesve të internetit lejojnë kontrollin e cookies përmes cilësimeve të tyre. Ju mund të:
              </p>
              <ul className="list-disc list-inside text-[#666] leading-relaxed mb-4 ml-4">
                <li>Pranoni të gjitha cookies</li>
                <li>Refuzoni të gjitha cookies</li>
                <li>Pranoni vetëm cookies nga faqet që vizitoni</li>
                <li>Fshini cookies ekzistuese</li>
              </ul>
              <p className="text-[#666] leading-relaxed mb-4">
                Ju lutemi vini re se çaktivizimi i cookies mund të ndikojë në funksionalitetin e disa pjesëve të faqes sonë.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">4. Cookies nga Palë të Treta</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Në disa raste të veçanta, ne gjithashtu përdorim cookies të ofruara nga palë të treta të besuara. Kjo ndodh pasi ne përdorim shërbime të jashtme si Google Analytics, i cili është një nga zgjidhjet më të njohura dhe më të besuara për analizën në internet.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">5. Koha e Ruajtjes së Cookies</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Cookies mund të ruhen për periudha të ndryshme kohe:
              </p>
              <ul className="list-disc list-inside text-[#666] leading-relaxed mb-4 ml-4">
                <li><strong>Cookies sesioni:</strong> Ruhen vetëm gjatë vizitës tuaj në faqe dhe fshihen kur mbyllni shfletuesin.</li>
                <li><strong>Cookies të përhershme:</strong> Ruhen në pajisjen tuaj për një periudhë të caktuar ose derisa t'i fshini manualisht.</li>
              </ul>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">6. Më Shumë Informacion</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Për më shumë informacion rreth cookies dhe si t'i menaxhoni ato, ju rekomandojmë të vizitoni{' '}
                <a 
                  href="https://www.aboutcookies.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#c41e3a] hover:underline"
                >
                  www.aboutcookies.org
                </a>
                {' '}ose{' '}
                <a 
                  href="https://www.allaboutcookies.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#c41e3a] hover:underline"
                >
                  www.allaboutcookies.org
                </a>
                .
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">7. Ndryshimet në Politikë</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Ne mund të azhurnojmë këtë politikë cookies herë pas here për të pasqyruar ndryshimet në teknologjinë ose kërkesat ligjore. Ju rekomandojmë të kontrolloni këtë faqe periodikisht për çdo azhurnim.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">8. Kontakti</h2>
              <p className="text-[#666] leading-relaxed">
                Nëse keni pyetje rreth politikës sonë të cookies, ju lutemi na kontaktoni në{' '}
                <a href="mailto:info@mantovanibeton.al" className="text-[#c41e3a] hover:underline">
                  info@mantovanibeton.al
                </a>
                .
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-[#e5e5e5]">
              <p className="text-[13px] text-[#999]">
                Përditësimi i fundit: {new Date().toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#666] text-[13px]">
              © {new Date().getFullYear()} Mantovani Beton sh.p.k. Të gjitha të drejtat e rezervuara.
            </p>
            <Link
              to="/"
              className="text-[#666] hover:text-white text-[13px] transition-colors"
            >
              Faqja Kryesore
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Cookies;
