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

const Terms: React.FC = () => {
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
              Kushtet e Përdorimit
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-[#666] leading-relaxed mb-6">
                Mirësevini në faqen zyrtare të Mantovani Beton sh.p.k. Duke përdorur këtë faqe interneti, ju pranoni të respektoni kushtet dhe kushtet e mëposhtme të përdorimit. Ju lutemi lexoni me kujdes këto kushte përpara se të përdorni faqen tonë.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">1. Përdorimi i Faqes</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Faqja jonë ofron informacion mbi shërbimet tona të prodhimit të betonit dhe punimeve ndërtimore. Ju mund ta përdorni këtë faqe vetëm për qëllime legale dhe në përputhje me këto kushte. Është e ndaluar të përdorni faqen për çdo aktivitet që mund të dëmtojë, çaktivizojë ose ndikojë negativisht në funksionimin e saj.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">2. Prona Intelektuale</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Të gjitha përmbajtjet në këtë faqe, përfshirë por jo vetëm tekstin, imazhet, logot dhe dizajnin, janë pronë e Mantovani Beton sh.p.k. dhe mbrohen nga ligjet e pronësisë intelektuale. Nuk lejohet riprodhimi, shpërndarja ose modifikimi i përmbajtjes pa lejen tonë të shkruar.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">3. Saktësia e Informacionit</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Përpjekjet tona janë që informacioni në këtë faqe të jetë i saktë dhe i përditësuar. Megjithatë, ne nuk garantojmë saktësinë absolute të të dhënave. Çdo vendim i marrë bazuar në informacionin e kësaj faqeje është në përgjegjësinë tuaj.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">4. Kufizimi i Përgjegjësisë</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Mantovani Beton sh.p.k. nuk do të jetë i përgjegjshëm për asnjë dëm të drejtpërdrejtë, të tërthortë ose aksidental që mund të ndodhë nga përdorimi i kësaj faqeje ose informacionit të saj. Kjo përfshin, por nuk kufizohet në, humbjen e të dhënave ose fitimeve.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">5. Ndryshimet në Kushte</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Ne rezervojmë të drejtën të modifikojmë këto kushte në çdo kohë. Ndryshimet do të hyjnë në fuqi menjëherë pas publikimit të tyre në këtë faqe. Përdorimi i vazhdueshëm i faqes pas ndryshimeve do të konsiderohet si pranimi i kushteve të reja.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">6. Ligji i Zbatueshëm</h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Këto kushte interpretohen dhe zbatohen në përputhje me ligjet e Republikës së Shqipërisë. Çdo mosmarrëveshje që mund të lindë do të zgjidhet nga gjykatat kompetente të Shqipërisë.
              </p>

              <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">7. Kontakti</h2>
              <p className="text-[#666] leading-relaxed">
                Për çdo pyetje lidhur me këto kushte, ju lutemi na kontaktoni në{' '}
                <a href="mailto:info@mantovanibeton.al" className="text-[#c41e3a] hover:underline">
                  info@mantovanibeton.al
                </a>
                {' '}ose në numrin e telefonit{' '}
                <a href="tel:+355691234567" className="text-[#c41e3a] hover:underline">
                  +355 69 123 4567
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

export default Terms;
