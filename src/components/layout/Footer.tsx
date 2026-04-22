import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from '@/hooks/useInView';
import { Modal } from '@/components/ui/Modal';
import { Logo } from '@/components/ui/Logo';

export const Footer: React.FC = () => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1 });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
    setFormData({ name: '', email: '', message: '' });
  };

  const contactItems = [
    { icon: MapPin, text: 'Shkodër, Shqipëri', href: null },
    { icon: Phone, text: '+355 69 123 4567', href: 'tel:+355691234567' },
    { icon: Mail, text: 'info@mantovanibeton.al', href: 'mailto:info@mantovanibeton.al' },
    { icon: Clock, text: 'E Hënë – E Premte: 08:00 – 17:00', href: null },
  ];

  return (
    <footer
      id="footer"
      ref={ref}
      className="bg-[#0a0a0a] text-white"
    >
      {/* CTA Section */}
      <div className="border-b border-[#222]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div
            className="max-w-[700px]"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            <h2 className="text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-tight mb-6">
              Keni një projekt në plan?
            </h2>
            <p className="text-lg text-[#888] leading-relaxed mb-8">
              Na kontaktoni për informacion, ofertë dhe bashkëpunim profesional.
            </p>
            <a
              href="mailto:info@mantovanibeton.al"
              className="inline-flex items-center gap-2 text-[#c41e3a] hover:text-white transition-colors duration-300 group"
            >
              <span className="text-[14px] font-medium uppercase tracking-wider">
                Na kontaktoni
              </span>
              <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Form */}
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.1s',
            }}
          >
            <h3 className="text-xl font-medium mb-8">Dërgoni një mesazh</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#666] block mb-3">
                    Emri
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Emri juaj"
                    className="w-full bg-transparent border-b border-[#333] text-white text-[15px] pb-3 focus:outline-none focus:border-[#c41e3a] transition-colors placeholder:text-[#555]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#666] block mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email-i juaj"
                    className="w-full bg-transparent border-b border-[#333] text-white text-[15px] pb-3 focus:outline-none focus:border-[#c41e3a] transition-colors placeholder:text-[#555]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#666] block mb-3">
                  Mesazhi
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mesazhi juaj"
                  rows={4}
                  className="w-full bg-transparent border-b border-[#333] text-white text-[15px] pb-3 focus:outline-none focus:border-[#c41e3a] transition-colors resize-none placeholder:text-[#555]"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#c41e3a] text-white px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.08em] hover:bg-[#a31830] transition-colors duration-200"
              >
                Dërgo
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div
            className="lg:pl-12"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.2s',
            }}
          >
            <h3 className="text-xl font-medium mb-8">Informacion kontakti</h3>

            <div className="space-y-6">
              {contactItems.map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-start gap-4">
                  <Icon className="w-4 h-4 text-[#666] mt-1 flex-shrink-0" />
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
      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Logo light />
          <p className="text-[12px] text-[#555]">
            © {new Date().getFullYear()} Mantovani Beton sh.p.k. Të gjitha të drejtat e rezervuara.
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Kushtet', path: '/kushtet' },
              { label: 'Privatësia', path: '/privatesia' },
              { label: 'Cookies', path: '/cookies' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="text-[12px] text-[#555] hover:text-[#aaa] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Faleminderit!"
      >
        <p className="text-[#1a1a1a] text-lg">
          Mesazhi juaj u dërgua me sukses. Do t'ju kontaktojmë sa më shpejt të jetë e mundur.
        </p>
        <button
          onClick={() => setShowModal(false)}
          className="bg-[#c41e3a] text-white px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.08em] hover:bg-[#a31830] transition-colors duration-200 mt-6"
        >
          Mbyll
        </button>
      </Modal>
    </footer>
  );
};

export default Footer;
