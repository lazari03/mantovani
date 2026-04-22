import React, { useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryImages = [
  { src: '/assets/gallery/gallery-1.jpg', alt: 'Puna me beton 1' },
  { src: '/assets/gallery/gallery-2.jpg', alt: 'Puna me beton 2' },
  { src: '/assets/gallery/gallery-3.jpg', alt: 'Puna me beton 3' },
  { src: '/assets/gallery/gallery-4.jpg', alt: 'Puna me beton 4' },
  { src: '/assets/gallery/gallery-5.jpg', alt: 'Puna me beton 5' },
  { src: '/assets/gallery/gallery-6.jpg', alt: 'Puna me beton 6' },
  { src: '/assets/gallery/gallery-7.jpg', alt: 'Puna me beton 7' },
  { src: '/assets/gallery/gallery-8.jpg', alt: 'Puna me beton 8' },
  { src: '/assets/gallery/gallery-9.jpg', alt: 'Puna me beton 9' },
  { src: '/assets/gallery/gallery-10.jpg', alt: 'Puna me beton 10' },
  { src: '/assets/gallery/gallery-12.jpg', alt: 'Puna me beton 11' },
  { src: '/assets/services/service-2.jpg', alt: 'Elemente betoni' },
];

export const Gallery: React.FC = () => {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.05 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImage(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="w-full py-16 lg:py-24 bg-[#f7f7f7]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10">
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            <SectionLabel text="GALERIA" />
            <h2 className="text-[clamp(28px,3vw,48px)] font-normal text-[#1a1a1a] leading-[1.1] tracking-tight">
              Puna jonë
            </h2>
          </div>
          <p
            className="text-[#666] text-[15px] mt-3 lg:mt-0 lg:text-right"
            style={{
              opacity: isInView ? 1 : 0,
              transition: 'opacity 0.6s ease 0.1s',
            }}
          >
            Disa nga projektet që kemi realizuar gjatë viteve.
          </p>
        </div>

        {/* Clean Grid - 4 columns on desktop, uniform sizes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {galleryImages.map((img, index) => (
            <div
              key={index}
              className="relative overflow-hidden group cursor-pointer bg-[#e5e5e5]"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s cubic-bezier(0.33, 1, 0.68, 1) ${index * 0.03}s`,
              }}
              onClick={() => openLightbox(index)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Navigation */}
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 lg:left-8 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 lg:right-8 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight size={40} />
          </button>

          {/* Image */}
          <img
            src={galleryImages[currentImage].src}
            alt={galleryImages[currentImage].alt}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {currentImage + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
