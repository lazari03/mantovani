import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useTranslation, type Lang } from '@/lib/i18nContext';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

const LANGS: { code: Lang; label: string }[] = [
  { code: 'al', label: 'AL' },
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
];

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { t, lang, setLang } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { labelKey: 'navHome'     as const, section: '',         page: '/'      },
    { labelKey: 'navAbout'    as const, section: 'about',   page: '/about' },
    { labelKey: 'navServices' as const, section: 'services', page: null    },
    { labelKey: 'navWhyUs'   as const, section: 'why-us',   page: null    },
    { labelKey: 'navGallery' as const, section: 'sectors',  page: null    },
    { labelKey: 'navContact' as const, section: 'footer',   page: null    },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (section: string) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  const onHome = location.pathname === '/';
  const textColor  = (!onHome || scrolled) ? 'text-[#1a1a1a]' : 'text-white';
  const hoverColor = 'hover:text-[#c41e3a]';
  const bgClass    = (!onHome || scrolled)
    ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.08)]'
    : 'bg-transparent';

  const langDividerColor = (!onHome || scrolled) ? 'text-[#ddd]' : 'text-white/20';
  const langBaseColor    = (!onHome || scrolled) ? 'text-[#999] hover:text-[#1a1a1a]' : 'text-white/50 hover:text-white';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo — always goes to homepage top */}
            <Link
              to="/"
              className="flex-shrink-0"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Logo light={onHome && !scrolled} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              {navItems.map((item) =>
                item.page ? (
                  <Link
                    key={item.section}
                    to={item.page}
                    className={`text-[12px] font-medium tracking-[0.08em] uppercase transition-colors duration-200 ${textColor} ${hoverColor}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(item.labelKey)}
                  </Link>
                ) : (
                  <button
                    key={item.section}
                    onClick={() => handleNav(item.section)}
                    className={`text-[12px] font-medium tracking-[0.08em] uppercase transition-colors duration-200 ${textColor} ${hoverColor}`}
                  >
                    {t(item.labelKey)}
                  </button>
                )
              )}
            </nav>

            {/* Language Switcher + Mobile Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-0">
                {LANGS.map((l, idx) => (
                  <React.Fragment key={l.code}>
                    <button
                      onClick={() => setLang(l.code)}
                      className={`text-[11px] font-medium tracking-widest uppercase px-1 transition-colors duration-200 ${
                        lang === l.code ? 'text-[#c41e3a]' : langBaseColor
                      }`}
                      aria-label={`Language: ${l.label}`}
                    >
                      {l.label}
                    </button>
                    {idx < LANGS.length - 1 && (
                      <span className={`text-[10px] ${langDividerColor}`}>|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2 transition-colors ${textColor}`}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute top-5 right-6 flex items-center gap-1">
          {LANGS.map((l, idx) => (
            <React.Fragment key={l.code}>
              <button
                onClick={() => setLang(l.code)}
                className={`text-[11px] font-medium tracking-widest uppercase px-1 transition-colors ${lang === l.code ? 'text-[#c41e3a]' : 'text-[#999] hover:text-[#1a1a1a]'}`}
              >
                {l.label}
              </button>
              {idx < LANGS.length - 1 && <span className="text-[#ddd] text-[10px]">|</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navItems.map((item) =>
            item.page ? (
              <Link
                key={item.section}
                to={item.page}
                onClick={() => setMobileOpen(false)}
                className="text-xl font-medium text-[#1a1a1a] tracking-wide uppercase hover:text-[#c41e3a] transition-colors"
              >
                {t(item.labelKey)}
              </Link>
            ) : (
              <button
                key={item.section}
                onClick={() => handleNav(item.section)}
                className="text-xl font-medium text-[#1a1a1a] tracking-wide uppercase hover:text-[#c41e3a] transition-colors"
              >
                {t(item.labelKey)}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
