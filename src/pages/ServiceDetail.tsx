import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getServiceById } from '@/data/servicesData';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Logo } from '@/components/ui/Logo';
import { Lightbox } from '@/components/ui/Lightbox';
import { ArrowLeft, Check, Hammer, MapPin, Award, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Rreth Nesh', section: 'about' },
  { label: 'Shërbimet', section: 'services' },
  { label: 'Pse Ne', section: 'why-us' },
  { label: 'Galeria', section: 'gallery' },
  { label: 'Misioni', section: 'mission' },
  { label: 'Kontakti', section: 'footer' },
];

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const service = getServiceById(id || '');
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [contentRef, contentInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleNav = (section: string) => {
    navigate(`/#${section}`);
    setMobileOpen(false);
  };

  const openLightbox = () => {
    setCurrentImageIndex(0);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-[#1a1a1a] mb-4">
            Shërbimi nuk u gjet
          </h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#c41e3a] hover:underline"
          >
            <ArrowLeft size={18} />
            Kthehu në faqen kryesore
          </Link>
        </div>
      </div>
    );
  }

  // Images array for lightbox (just the main service image)
  const lightboxImages = [{ src: service.image, alt: service.title }];

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header / Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.08)]'
            : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <Logo light={false} />
            </Link>

            {/* Desktop Navigation */}
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

            {/* Mobile Menu Button */}
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

      {/* Mobile Menu Overlay */}
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

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div
            ref={headerRef}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Image with Lightbox */}
            <div
              style={{
                opacity: headerInView ? 1 : 0,
                transform: headerInView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
              }}
            >
              <div 
                className="relative overflow-hidden aspect-[4/3] cursor-pointer group"
                onClick={openLightbox}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Number overlay */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2">
                  <span className="text-[12px] font-medium tracking-wider text-[#1a1a1a]">
                    {service.num}
                  </span>
                </div>
                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-[#1a1a1a]"
                    >
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="11" y1="8" x2="11" y2="14"/>
                      <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Title and Description */}
            <div
              style={{
                opacity: headerInView ? 1 : 0,
                transform: headerInView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.1s',
              }}
            >
              <SectionLabel text="SHËRBIMI" />
              <h1 className="text-[clamp(36px,5vw,56px)] font-normal text-[#1a1a1a] leading-[1.05] tracking-tight mb-6">
                {service.title}
              </h1>
              <p className="text-[17px] text-[#666] leading-relaxed mb-8">
                {service.fullDescription}
              </p>
              <button
                onClick={() => handleNav('footer')}
                className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white px-8 py-4 text-[14px] font-medium uppercase tracking-wider hover:bg-[#c41e3a] transition-colors duration-300"
              >
                Kërko Ofertë
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div
          ref={contentRef}
          className="max-w-[1400px] mx-auto px-6 lg:px-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Features */}
            <div
              style={{
                opacity: contentInView ? 1 : 0,
                transform: contentInView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.1s',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#f7f7f7] flex items-center justify-center">
                  <Hammer size={18} className="text-[#c41e3a]" />
                </div>
                <h3 className="text-lg font-medium text-[#1a1a1a]">
                  Karakteristikat
                </h3>
              </div>
              <ul className="space-y-4">
                {service.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-[15px] text-[#666] leading-relaxed"
                  >
                    <Check size={16} className="text-[#c41e3a] mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Applications */}
            <div
              style={{
                opacity: contentInView ? 1 : 0,
                transform: contentInView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.2s',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#f7f7f7] flex items-center justify-center">
                  <MapPin size={18} className="text-[#c41e3a]" />
                </div>
                <h3 className="text-lg font-medium text-[#1a1a1a]">
                  Zbatimet
                </h3>
              </div>
              <ul className="space-y-4">
                {service.applications.map((app, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-[15px] text-[#666] leading-relaxed"
                  >
                    <Check size={16} className="text-[#c41e3a] mt-1 flex-shrink-0" />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div
              style={{
                opacity: contentInView ? 1 : 0,
                transform: contentInView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.3s',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#f7f7f7] flex items-center justify-center">
                  <Award size={18} className="text-[#c41e3a]" />
                </div>
                <h3 className="text-lg font-medium text-[#1a1a1a]">
                  Përfitimet
                </h3>
              </div>
              <ul className="space-y-4">
                {service.benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-[15px] text-[#666] leading-relaxed"
                  >
                    <Check size={16} className="text-[#c41e3a] mt-1 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-[clamp(28px,3vw,40px)] font-normal text-white leading-[1.1] tracking-tight mb-6">
            Keni nevojë për këtë shërbim?
          </h2>
          <p className="text-[#999] max-w-[500px] mx-auto mb-8 text-[16px] leading-relaxed">
            Na kontaktoni për një konsultim falas dhe merrni ofertën më të mirë për projektin tuaj.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleNav('footer')}
              className="inline-flex items-center gap-3 bg-[#c41e3a] text-white px-8 py-4 text-[14px] font-medium uppercase tracking-wider hover:bg-[#a01830] transition-colors duration-300"
            >
              Na Kontaktoni
            </button>
            <button
              onClick={() => handleNav('services')}
              className="inline-flex items-center gap-3 border border-white/30 text-white px-8 py-4 text-[14px] font-medium uppercase tracking-wider hover:bg-white/10 transition-colors duration-300"
            >
              <ArrowLeft size={16} />
              Të Gjitha Shërbimet
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#666] text-[13px]">
              © 2024 Mantovani. Të gjitha të drejtat e rezervuara.
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

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onPrev={() => {}}
        onNext={() => {}}
      />
    </div>
  );
};

export default ServiceDetail;
