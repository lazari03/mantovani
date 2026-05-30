import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getServiceById } from '@/data/servicesData';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Logo } from '@/components/ui/Logo';
import { Lightbox } from '@/components/ui/Lightbox';
import { ArrowLeft, Check, Hammer, MapPin, Award, Menu, X } from 'lucide-react';
import { useTranslation, type Lang } from '@/lib/i18nContext';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'al', label: 'AL' },
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
];

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();

  const service = getServiceById(id || '', t);

  const [headerRef, headerInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [contentRef, contentInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navItems = [
    { labelKey: 'navHome'     as const, section: '',         page: '/'      },
    { labelKey: 'navAbout'    as const, section: 'about',   page: '/about' },
    { labelKey: 'navServices' as const, section: 'services', page: null    },
    { labelKey: 'navWhyUs'   as const, section: 'why-us',   page: null    },
    { labelKey: 'navGallery' as const, section: 'sectors',  page: null    },
    { labelKey: 'navContact' as const, section: 'footer',   page: null    },
  ];

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (section: string, page?: string | null) => {
    if (page) {
      navigate(page);
    } else {
      navigate(`/#${section}`);
    }
    setMobileOpen(false);
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-[#1a1a1a] mb-4">{t('sdNotFound')}</h1>
          <Link to="/" className="inline-flex items-center gap-2 text-[#c41e3a] hover:underline">
            <ArrowLeft size={18} />
            {t('sdBackHome')}
          </Link>
        </div>
      </div>
    );
  }

  const lightboxImages = [{ src: service.image, alt: service.title }];

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
                  key={item.labelKey}
                  onClick={() => handleNav(item.section, item.page)}
                  className="text-[12px] font-medium tracking-[0.08em] uppercase transition-colors duration-200 hover:text-[#c41e3a] text-[#1a1a1a]"
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* Language switcher */}
              <div className="hidden sm:flex items-center gap-0">
                {LANGS.map((l, idx) => (
                  <React.Fragment key={l.code}>
                    <button
                      onClick={() => setLang(l.code)}
                      className={`text-[11px] font-medium tracking-widest uppercase px-1 transition-colors ${
                        lang === l.code ? 'text-[#c41e3a]' : 'text-[#999] hover:text-[#1a1a1a]'
                      }`}
                    >
                      {l.label}
                    </button>
                    {idx < LANGS.length - 1 && <span className="text-[#ddd] text-[10px]">|</span>}
                  </React.Fragment>
                ))}
              </div>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-[#1a1a1a]"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
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
              key={item.labelKey}
              onClick={() => handleNav(item.section, item.page)}
              className="text-xl font-medium text-[#1a1a1a] tracking-wide uppercase hover:text-[#c41e3a] transition-colors"
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div ref={headerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Image */}
            <div
              style={{
                opacity: headerInView ? 1 : 0,
                transform: headerInView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
              }}
            >
              <div
                className="relative overflow-hidden aspect-[4/3] cursor-pointer group"
                onClick={() => { setCurrentImageIndex(0); setLightboxOpen(true); }}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2">
                  <span className="text-[12px] font-medium tracking-wider text-[#1a1a1a]">
                    {service.num}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1a1a]">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Title + Description */}
            <div
              style={{
                opacity: headerInView ? 1 : 0,
                transform: headerInView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.1s',
              }}
            >
              <SectionLabel text={t('sdLabel')} />
              <h1 className="text-[clamp(36px,5vw,56px)] font-normal text-[#1a1a1a] leading-[1.05] tracking-tight mb-6">
                {service.title}
              </h1>
              <p className="text-[17px] text-[#666] leading-relaxed mb-8">
                {service.fullDescription}
              </p>
              <button
                onClick={() => handleNav('footer')}
                className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white px-8 py-4 text-[13px] font-medium uppercase tracking-wider hover:bg-[#c41e3a] transition-colors duration-300"
              >
                {t('sdRequestQuote')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div ref={contentRef} className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* Features */}
            <DetailColumn
              icon={Hammer}
              title={t('sdFeatures')}
              items={service.features}
              inView={contentInView}
              delay={0.1}
            />

            {/* Applications */}
            <DetailColumn
              icon={MapPin}
              title={t('sdApplications')}
              items={service.applications}
              inView={contentInView}
              delay={0.2}
            />

            {/* Benefits */}
            <DetailColumn
              icon={Award}
              title={t('sdBenefits')}
              items={service.benefits}
              inView={contentInView}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-[clamp(28px,3vw,40px)] font-normal text-white leading-[1.1] tracking-tight mb-6">
            {t('sdNeedService')}
          </h2>
          <p className="text-[#999] max-w-[500px] mx-auto mb-8 text-[16px] leading-relaxed">
            {t('sdNeedServiceDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleNav('footer')}
              className="inline-flex items-center gap-3 bg-[#c41e3a] text-white px-8 py-4 text-[13px] font-medium uppercase tracking-wider hover:bg-[#a01830] transition-colors duration-300"
            >
              {t('sdContactUs')}
            </button>
            <button
              onClick={() => handleNav('services')}
              className="inline-flex items-center gap-3 border border-white/30 text-white px-8 py-4 text-[13px] font-medium uppercase tracking-wider hover:bg-white/10 transition-colors duration-300"
            >
              <ArrowLeft size={16} />
              {t('sdAllServices')}
            </button>
          </div>
        </div>
      </section>

      {/* Mini Footer */}
      <footer className="py-8 bg-[#1a1a1a] border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#555] text-[13px]">
              © {new Date().getFullYear()} Mantovani Beton sh.p.k. {t('sdCopyright')}
            </p>
            <Link to="/" className="text-[#555] hover:text-white text-[13px] transition-colors">
              {t('sdHomePage')}
            </Link>
          </div>
        </div>
      </footer>

      <Lightbox
        images={lightboxImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => {}}
        onNext={() => {}}
      />
    </div>
  );
};

function DetailColumn({
  icon: Icon,
  title,
  items,
  inView,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  inView: boolean;
  delay: number;
}) {
  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.8s cubic-bezier(0.33, 1, 0.68, 1) ${delay}s`,
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#f7f7f7] flex items-center justify-center">
          <Icon size={18} className="text-[#c41e3a]" />
        </div>
        <h3 className="text-lg font-medium text-[#1a1a1a]">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-[15px] text-[#666] leading-relaxed">
            <Check size={16} className="text-[#c41e3a] mt-1 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServiceDetail;
