import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Menu, X, Star, Zap, Shield, Heart } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ConcreteCube } from '@/components/three/ConcreteCube';
import { useInView } from '@/hooks/useInView';
import { useTranslation, type Lang } from '@/lib/i18nContext';

gsap.registerPlugin(ScrollTrigger);

const LANGS: { code: Lang; label: string }[] = [
  { code: 'al', label: 'AL' },
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
];

const valueIcons = [Star, Zap, Shield, Heart];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [elRef, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const done = useRef(false);

  useEffect(() => {
    if (!inView || done.current || !ref.current) return;
    done.current = true;
    const el = ref.current;
    const counter = { val: 0 };
    gsap.to(counter, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate() { el.textContent = Math.round(counter.val) + suffix; },
    });
  }, [inView, target, suffix]);

  return (
    <div ref={elRef}>
      <span ref={ref}>{target}{suffix}</span>
    </div>
  );
}

const AboutPage: React.FC = () => {
  const { t, lang, setLang } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [storyRef, storyInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [valuesRef, valuesInView] = useInView<HTMLDivElement>({ threshold: 0.1 });

  const navItems = [
    { labelKey: 'navHome'     as const, section: '',         page: '/'      },
    { labelKey: 'navAbout'    as const, section: 'about',   page: '/about' },
    { labelKey: 'navServices' as const, section: 'services', page: null    },
    { labelKey: 'navWhyUs'   as const, section: 'why-us',   page: null    },
    { labelKey: 'navGallery' as const, section: 'sectors',  page: null    },
    { labelKey: 'navContact' as const, section: 'footer',   page: null    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hero entrance animation
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current!.querySelectorAll('.hero-anim'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out', delay: 0.2 }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleNav = (section: string) => {
    navigate(`/#${section}`);
    setMobileOpen(false);
  };

  const valueTitleKeys = ['aboutPageVal1Title', 'aboutPageVal2Title', 'aboutPageVal3Title', 'aboutPageVal4Title'] as const;
  const valueDescKeys  = ['aboutPageVal1Desc',  'aboutPageVal2Desc',  'aboutPageVal3Desc',  'aboutPageVal4Desc' ] as const;

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.08)]' : 'bg-transparent'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex-shrink-0">
              <Logo light={!scrolled} />
            </Link>

            <nav className="hidden lg:flex items-center gap-7">
              {navItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNav(item.section)}
                  className={`text-[12px] font-medium tracking-[0.08em] uppercase transition-colors hover:text-[#c41e3a] ${scrolled ? 'text-[#1a1a1a]' : 'text-white'}`}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-0">
                {LANGS.map((l, idx) => (
                  <React.Fragment key={l.code}>
                    <button
                      onClick={() => setLang(l.code)}
                      className={`text-[11px] font-medium tracking-widest uppercase px-1 transition-colors ${
                        lang === l.code ? 'text-[#c41e3a]' : scrolled ? 'text-[#999] hover:text-[#1a1a1a]' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {l.label}
                    </button>
                    {idx < LANGS.length - 1 && <span className={`text-[10px] ${scrolled ? 'text-[#ddd]' : 'text-white/20'}`}>|</span>}
                  </React.Fragment>
                ))}
              </div>
              <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-2 ${scrolled ? 'text-[#1a1a1a]' : 'text-white'}`}>
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navItems.map((item) => (
            <button key={item.section} onClick={() => handleNav(item.section)}
              className="text-xl font-medium text-[#1a1a1a] uppercase tracking-wide hover:text-[#c41e3a] transition-colors">
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative w-full min-h-[55vh] bg-[#111] flex items-end overflow-hidden">
        {/* Concrete texture background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a2525]" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)' }}
        />

        {/* Amber accent line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#c41e3a] via-amber-500 to-transparent" />

        <div ref={heroRef} className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 pt-40">
          <div className="hero-anim">
            <SectionLabel text={t('aboutPageLabel')} color="#666" />
          </div>
          <h1 className="hero-anim text-[clamp(36px,5.5vw,80px)] font-normal text-white leading-[1.0] tracking-tight mb-6 max-w-[800px]">
            {t('aboutPageHeading')}
          </h1>
          <p className="hero-anim text-[18px] text-[#999] max-w-[560px] leading-relaxed">
            {t('aboutPageSubheading')}
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-[#c41e3a]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
          <div className="grid grid-cols-3 gap-6 divide-x divide-white/20">
            {[
              { value: 15, suffix: '+', label: t('aboutStat1Label') },
              { value: 500, suffix: '+', label: t('aboutStat2Label') },
              { value: 50, suffix: '+', label: t('aboutStat3Label') },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <div className="text-[36px] lg:text-[48px] font-light text-white leading-none">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] text-white/70 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div ref={storyRef} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Text */}
            <div style={{
              opacity: storyInView ? 1 : 0,
              transform: storyInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.33,1,0.68,1)',
            }}>
              <h2 className="text-[clamp(28px,3vw,42px)] font-normal text-[#1a1a1a] leading-[1.1] tracking-tight mb-6">
                {t('aboutPageStory1Title')}
              </h2>
              <p className="text-[17px] text-[#666] leading-relaxed mb-10">
                {t('aboutPageStory1')}
              </p>

              <div className="border-t border-[#eee] pt-8">
                <h3 className="text-[22px] font-normal text-[#1a1a1a] mb-4">{t('aboutPageStory2Title')}</h3>
                <p className="text-[17px] text-[#666] leading-relaxed">{t('aboutPageStory2')}</p>
              </div>
            </div>

            {/* 3D Cube accent */}
            <div style={{
              opacity: storyInView ? 1 : 0,
              transform: storyInView ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s cubic-bezier(0.33,1,0.68,1) 0.2s',
            }}>
              {/* Real company photos */}
              <img src="/assets/gallery/20260427_144429.jpg" alt="" className="w-full aspect-[16/9] object-cover mb-4" loading="lazy" />
              <div className="grid grid-cols-2 gap-4">
                <img src="/assets/gallery/53530.jpg" alt="" className="w-full aspect-square object-cover" loading="lazy" />
                <div className="bg-[#111] relative overflow-hidden aspect-square">
                  <ConcreteCube className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="py-24 lg:py-32 bg-[#f7f7f7]">
        <div ref={valuesRef} className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div style={{
            opacity: valuesInView ? 1 : 0,
            transform: valuesInView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.7s cubic-bezier(0.33,1,0.68,1)',
          }}>
            <SectionLabel text={t('aboutPageValuesTitle')} />
            <h2 className="text-[clamp(28px,3.5vw,48px)] font-normal text-[#1a1a1a] leading-[1.05] tracking-tight mb-14">
              {t('aboutPageValuesTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueTitleKeys.map((titleKey, idx) => {
              const Icon = valueIcons[idx];
              return (
                <div
                  key={titleKey}
                  className="bg-white border border-[#eee] p-8 hover:border-[#c41e3a]/30 hover:shadow-md transition-all duration-300"
                  style={{
                    opacity: valuesInView ? 1 : 0,
                    transform: valuesInView ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.65s cubic-bezier(0.33,1,0.68,1) ${0.1 + idx * 0.1}s`,
                  }}
                >
                  <div className="w-10 h-10 bg-[#f7f7f7] flex items-center justify-center mb-5">
                    <Icon className="w-4 h-4 text-[#c41e3a]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[17px] font-medium text-[#1a1a1a] mb-3">{t(titleKey)}</h3>
                  <p className="text-[14px] text-[#888] leading-relaxed">{t(valueDescKeys[idx])}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real company photos grid */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              '/assets/gallery/52860.jpg',
              '/assets/gallery/53530.jpg',
              '/assets/gallery/53532.jpg',
              '/assets/gallery/20260427_144429.jpg',
            ].map((src) => (
              <div key={src} className="overflow-hidden group aspect-[4/3]">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-[clamp(28px,3.5vw,48px)] font-normal text-white leading-[1.1] tracking-tight mb-6">
            {t('aboutPageCTA')}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/#footer"
              className="inline-flex items-center gap-3 bg-[#c41e3a] text-white px-8 py-4 text-[13px] font-medium uppercase tracking-wider hover:bg-[#a01830] transition-colors"
            >
              {t('aboutPageCTABtn')}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-3 border border-white/30 text-white px-8 py-4 text-[13px] font-medium uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={15} />
              {t('aboutPageBackBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="py-6 bg-[#0a0a0a] border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between">
          <Logo light />
          <p className="text-[#444] text-[12px]">
            © {new Date().getFullYear()} Mantovani Beton sh.p.k. {t('footerRights')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
