import React from 'react';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';

const textBlocks = [
  {
    title: 'Ndërtojmë me besim',
    text: 'Misioni ynë është të ofrojmë produkte dhe shërbime cilësore që mbështesin zhvillimin e projekteve të sigurta, funksionale dhe afatgjata. Ne besojmë se çelësi i çdo ndërtimi të mirë është betoni cilësor dhe një ekip i përkushtuar.',
  },
  {
    title: 'Të jemi një partner i besueshëm në sektorin e ndërtimit',
    text: 'Synojmë të forcojmë pozicionin tonë si një kompani e respektuar në prodhimin e betonit dhe në punimet ndërtimore në rajon. Ne synojmë të zgjerohemi dhe të inovojmë vazhdimisht për të ofruar zgjidhje gjithnjë e më të mira.',
  },
  {
    title: 'Cilësia, korrektësia, inovacioni',
    text: 'Këto janë vlerat që na udhëheqin në çdo projekt. Ne investojmë në teknologji moderne, formim profesional, dhe marrëdhënie të forta me klientët tanë.',
  },
];

// Using construction/concrete images instead of people photos
const images = [
  '/assets/services/service-3.jpg',
  '/assets/services/service-4.jpg',
  '/assets/gallery/gallery-5.jpg',
];

export const Mission: React.FC = () => {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      id="mission"
      ref={sectionRef}
      className="w-full py-24 lg:py-32 bg-[#111]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <SectionLabel text="MISIONI" color="#888" />

        <h2
          className="text-[clamp(32px,4vw,56px)] font-normal text-white leading-[1.05] tracking-tight mb-16"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0px)' : 'translateY(50px)',
            transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1), transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
            willChange: isInView ? 'auto' : 'opacity, transform',
          }}
        >
          Misioni ynë
        </h2>

        {/* Two equal-height columns */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Images Column - equal height to text */}
          <div className="lg:w-[45%] flex flex-col gap-4">
            {images.map((src, index) => {
              const [imgRef, imgInView] = useInView<HTMLDivElement>({
                threshold: 0.2,
              });

              return (
                <div
                  key={index}
                  ref={imgRef}
                  className="relative overflow-hidden flex-1 min-h-[200px]"
                  style={{
                    opacity: imgInView ? 1 : 0,
                    transition: 'opacity 0.6s ease',
                  }}
                >
                  {/* Mask reveal animation */}
                  <div
                    className="absolute inset-0 bg-[#111] z-10"
                    style={{
                      transform: imgInView ? 'scaleY(0)' : 'scaleY(1)',
                      transformOrigin: 'bottom',
                      transition: `transform 1s cubic-bezier(0.87, 0, 0.13, 1) ${index * 0.15}s`,
                    }}
                  />
                  <img
                    src={src}
                    alt={`Misioni ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ minHeight: '200px' }}
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block w-px bg-[#333] self-stretch" />

          {/* Text Column */}
          <div className="lg:w-[55%] flex flex-col justify-between">
            {textBlocks.map((block, index) => {
              const [blockRef, blockInView] = useInView<HTMLDivElement>({
                threshold: 0.3,
              });

              return (
                <div
                  key={index}
                  ref={blockRef}
                  className={`py-8 ${index > 0 ? 'border-t border-[#333]' : ''}`}
                  style={{
                    opacity: blockInView ? 1 : 0,
                    transform: blockInView ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
                  }}
                >
                  <h3 className="text-[clamp(24px,3vw,36px)] font-normal text-white mb-5 leading-tight">
                    {block.title}
                  </h3>
                  <p className="text-[17px] text-[#999] leading-relaxed">
                    {block.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
