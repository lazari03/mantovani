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

const Privacy: React.FC = () => {
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
              Politika e Privatësisë
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-[#666] leading-relaxed mb-6">
                Mantovani Beton sh.p.k. i jep rëndësi të madhe mbrojtjes së të dhënave tuaja personale. Kjo politikë privatësie shpjegon se si mbledhim, përdorim dhe mbrojmë informacionin tuaj kur përdorni faqen tonë të internetit.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">1. Të Dhënat që Mbledhim</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Ne mbledhim vetëm të dhënat që ju na jepni vullnetarisht, si:
              </p>
              <ul className="list-disc list-inside text-[#666] leading-relaxed mb-4 ml-4">
                <li>Emri dhe mbiemri</li>
                <li>Adresa e email-it</li>
                <li>Numri i telefonit</li>
                <li>Mesazhet që dërgoni përmes formularit të kontaktit</li>
              </ul>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">2. Si i Përdorim Të Dhënat</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Të dhënat tuaja përdoren ekskluzivisht për:
              </p>
              <ul className="list-disc list-inside text-[#666] leading-relaxed mb-4 ml-4">
                <li>T'ju përgjigjemi kërkesave dhe pyetjeve tuaja</li>
                <li>T'ju ofrojmë oferta për shërbimet tona</li>
                <li>Të përmirësojmë shërbimet tona</li>
                <li>T'ju informojmë për përditësime të rëndësishme</li>
              </ul>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">3. Mbrojtja e Të Dhënave</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Ne zbatojmë masa teknike dhe organizative të aprovuara për të mbrojtur të dhënat tuaja nga aksesi i paautorizuar, humbja ose shkatërrimi. Të dhënat ruhen në servera të sigurt dhe aksesi ndaj tyre kufizohet vetëm për personelin e autorizuar.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">4. Koha e Ruajtjes</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Të dhënat tuaja ruhen vetëm për kohën e nevojshme për qëllimet për të cilat janë mbledhur, ose sipas kërkesave ligjore. Pas kësaj periudhe, ato fshihen ose anonimizohen në mënyrë të sigurt.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">5. Të Drejtat Tuaja</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Ju keni të drejtë të:
              </p>
              <ul className="list-disc list-inside text-[#666] leading-relaxed mb-4 ml-4">
                <li>Kërkoni akses në të dhënat tuaja personale</li>
                <li>Kërkoni korrigjim të të dhënave të pasakta</li>
                <li>Kërkoni fshirjen e të dhënave tuaja</li>
                <li>Të kundërshtoni përpunimin e të dhënave tuaja</li>
                <li>Të kërkoni transferimin e të dhënave</li>
              </ul>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">6. Ndërlidhje me Palë të Treta</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Ne nuk shesim, nuk japim me qira dhe nuk ndajmë të dhënat tuaja personale me palë të treta për qëllime marketingu. Të dhënat mund të ndahen vetëm me furnitorët tanë të shërbimeve të nevojshme për operimin e biznesit, të cilët janë të detyruar t'i mbajnë ato konfidenciale.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">7. Ndryshimet në Politikë</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Ne mund të azhurnojmë këtë politikë privatësie herë pas here. Ndryshimet do të publikohen në këtë faqe dhe do të hyjnë në fuqi menjëherë. Ju rekomandojmë të kontrolloni këtë faqe periodikisht.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">8. Kontakti</h2>
              <p className="text-[#666] leading-relaxed">
                Për çdo pyetje lidhur me këtë politikë privatësie ose për të ushtruar të drejtat tuaja, ju lutemi na kontaktoni në{' '}
                <a href="mailto:info@mantovanibeton.al" className="text-[#c41e3a] hover:underline">
                  info@mantovanibeton.al
                </a>
                {' '}ose në adresën tonë fizike në Shkodër, Shqipëri.
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

export default Privacy;
