import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

const menuItems = [
  { label: 'Ballina', section: 'cover' },
  { label: 'Rreth Nesh', section: 'about' },
  { label: 'Shërbimet', section: 'services' },
  { label: 'Pse Ne', section: 'why-us' },
  { label: 'Galeria', section: 'gallery' },
  { label: 'Misioni', section: 'mission' },
  { label: 'Ekipi', section: 'team' },
  { label: 'Kontakti', section: 'footer' },
];

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current || !itemsRef.current) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(sidebarRef.current, {
        x: 0,
        duration: 0.4,
        ease: 'power3.out',
      });

      const items = itemsRef.current.querySelectorAll('.menu-item');
      gsap.fromTo(
        items,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.2,
        }
      );
    } else {
      gsap.to(sidebarRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          document.body.style.overflow = '';
        },
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-deep-black z-50 flex flex-col"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Close button */}
        <div className="flex justify-end p-6">
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center text-white hover:text-electric-blue transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu items */}
        <div ref={itemsRef} className="flex-1 flex flex-col justify-center px-12 gap-2">
          {menuItems.map((item) => (
            <button
              key={item.section}
              className="menu-item text-left text-white text-h3 font-normal py-3 group relative opacity-0"
              onClick={() => onNavigate(item.section)}
            >
              <span className="relative">
                {item.label}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-electric-blue transition-all duration-200 group-hover:w-full" />
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-12 pb-8">
          <p className="text-concrete-medium text-label uppercase tracking-widest">
            Mantovani Beton sh.p.k
          </p>
          <p className="text-concrete-medium text-sm mt-2">
            Shkodër, Shqipëri
          </p>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
