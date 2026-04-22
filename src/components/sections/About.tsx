import React from 'react';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';

const images = Array.from({ length: 9 }, (_, i) => `/assets/about/about-${i + 1}.jpg`);

export const About: React.FC = () => {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="w-full py-24 lg:py-32 bg-white"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Two-column layout: text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-20">
          {/* Text Content */}
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            <SectionLabel text="RRETH NESH" />
            <h2 className="text-[clamp(32px,4vw,56px)] font-normal text-[#1a1a1a] leading-[1.05] tracking-tight mb-8">
              Eksperiencë dhe seriozitet në ndërtim
            </h2>
            <p className="text-lg text-[#666] leading-relaxed">
              Mantovani Beton sh.p.k është një kompani e specializuar në prodhimin dhe
              furnizimin me beton, si edhe në realizimin e punimeve të ndryshme ndërtimore
              dhe infrastrukturore. Me fokus te cilësia, korrektësia dhe afatet, kompania
              i shërben klientëve privatë, bizneseve dhe institucioneve.
            </p>
            <div className="mt-10 flex gap-12">
              <div>
                <p className="text-[42px] font-light text-[#c41e3a] leading-none">15+</p>
                <p className="text-[13px] text-[#999] uppercase tracking-wider mt-2">Vite Eksperiencë</p>
              </div>
              <div>
                <p className="text-[42px] font-light text-[#c41e3a] leading-none">500+</p>
                <p className="text-[13px] text-[#999] uppercase tracking-wider mt-2">Projekte të Realizuara</p>
              </div>
              <div>
                <p className="text-[42px] font-light text-[#c41e3a] leading-none">50+</p>
                <p className="text-[13px] text-[#999] uppercase tracking-wider mt-2">Klientë të Kënaqur</p>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div
            className="relative"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.2s',
            }}
          >
            <img
              src="/assets/about/about-1.jpg"
              alt="Elemente betoni"
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Image Grid - organized masonry */}
        <div
          className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.3s',
          }}
        >
          {images.map((src, index) => (
            <div
              key={index}
              className={`overflow-hidden group ${
                index === 0 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <img
                src={src}
                alt={`Element betoni ${index + 1}`}
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  index === 0 ? 'aspect-square' : 'aspect-square'
                }`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
