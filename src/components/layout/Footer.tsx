import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from '@/hooks/useInView';
import { Modal } from '@/components/ui/Modal';
import { Logo } from '@/components/ui/Logo';
import { useTranslation } from '@/lib/i18nContext';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1 });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
    setFormData({ name: '', email: '', message: '' });
  };

  const contactItems = [
    { icon: MapPin,  text: 'Shkodër, Shqipëri',                    href: null },
    { icon: Phone,   text: '+355 69 123 4567',                      href: 'tel:+355691234567' },
    { icon: Mail,    text: 'info@mantovanibeton.al',                 href: 'mailto:info@mantovanibeton.al' },
    { icon: Clock,   text: t('footerHours'),                        href: null },
  ];

  const legalLinks = [
    { labelKey: 'footerTerms'   as const, path: '/kushtet'    },
    { labelKey: 'footerPrivacy' as const, path: '/privatesia' },
    { labelKey: 'footerCookies' as const, path: '/cookies'    },
  ];

  const fadeIn = (delay = 0) => ({
    opacity: isInView ? 1 : 0,
    transform: isInView ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.8s cubic-bezier(0.33, 1, 0.68, 1) ${delay}s`,
  });

  return (
    <footer id="footer" ref={ref} className="bg-[#0a0a0a] text-white">

      {/* CTA Section */}
      <div className="border-b border-[#1c1c1c]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="max-w-[700px]" style={fadeIn()}>
            <h2 className="text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-tight mb-6">
              {t('footerCTA')}
            </h2>
            <p className="text-lg text-[#888] leading-relaxed mb-8">
              {t('footerCTADesc')}
            </p>
            <a
              href="mailto:info@mantovanibeton.al"
              className="inline-flex items-center gap-2 text-[#c41e3a] hover:text-white transition-colors duration-300 group"
            >
              <span className="text-[14px] font-medium uppercase tracking-wider">
                {t('footerContactAction')}
              </span>
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Contact Form */}
          <div style={fadeIn(0.1)}>
            <h3 className="text-xl font-medium mb-8">{t('footerFormHeading')}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#666] block mb-3">
                    {t('footerNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('footerNamePlaceholder')}
                    className="w-full bg-transparent border-b border-[#2a2a2a] text-white text-[15px] pb-3 focus:outline-none focus:border-[#c41e3a] transition-colors placeholder:text-[#444]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#666] block mb-3">
                    {t('footerEmailLabel')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('footerEmailPlaceholder')}
                    className="w-full bg-transparent border-b border-[#2a2a2a] text-white text-[15px] pb-3 focus:outline-none focus:border-[#c41e3a] transition-colors placeholder:text-[#444]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#666] block mb-3">
                  {t('footerMessageLabel')}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('footerMessagePlaceholder')}
                  rows={4}
                  className="w-full bg-transparent border-b border-[#2a2a2a] text-white text-[15px] pb-3 focus:outline-none focus:border-[#c41e3a] transition-colors resize-none placeholder:text-[#444]"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#c41e3a] text-white px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.1em] hover:bg-[#a31830] transition-colors duration-200"
              >
                {t('footerSubmit')}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="lg:pl-12" style={fadeIn(0.2)}>
            <h3 className="text-xl font-medium mb-8">{t('footerInfoHeading')}</h3>
            <div className="space-y-6">
              {contactItems.map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-start gap-4">
                  <Icon className="w-4 h-4 text-[#555] mt-1 flex-shrink-0" />
                  {href ? (
                    <a
                      href={href}
                      className="text-[15px] text-[#aaa] hover:text-[#c41e3a] transition-colors"
                    >
                      {text}
                    </a>
                  ) : (
                    <p className="text-[15px] text-[#aaa]">{text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#141414]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Logo light />
          <p className="text-[12px] text-[#444]">
            © {new Date().getFullYear()} Mantovani Beton sh.p.k. {t('footerRights')}
          </p>
          <div className="flex gap-5">
            {legalLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-[12px] text-[#444] hover:text-[#aaa] transition-colors"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('modalTitle')}>
        <p className="text-[#1a1a1a] text-lg">{t('modalMessage')}</p>
        <button
          onClick={() => setShowModal(false)}
          className="bg-[#c41e3a] text-white px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.1em] hover:bg-[#a31830] transition-colors duration-200 mt-6"
        >
          {t('modalClose')}
        </button>
      </Modal>
    </footer>
  );
};

export default Footer;
