import React from 'react';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useTranslation, type TKeys } from '@/lib/i18nContext';

const missionImages = [
  '/assets/gallery/52860.jpg',
  '/assets/gallery/53532.jpg',
  '/assets/gallery/20260427_144429.jpg',
];

// Extracted so hooks are called at component top-level, not inside a loop
function MissionImage({ src, index, altText }: { src: string; index: number; altText: string }) {
  const [imgRef, imgInView] = useInView<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div
      ref={imgRef}
      className="relative overflow-hidden flex-1 min-h-[200px]"
      style={{ opacity: imgInView ? 1 : 0, transition: 'opacity 0.6s ease' }}
    >
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
        alt={altText}
        className="w-full h-full object-cover"
        style={{ minHeight: '200px' }}
        loading="lazy"
      />
    </div>
  );
}

function MissionBlock({
  titleKey,
  textKey,
  hasBorderTop,
}: {
  titleKey: TKeys;
  textKey: TKeys;
  hasBorderTop: boolean;
}) {
  const { t } = useTranslation();
  const [blockRef, blockInView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  return (
    <div
      ref={blockRef}
      className={`py-8 ${hasBorderTop ? 'border-t border-[#2a2a2a]' : ''}`}
      style={{
        opacity: blockInView ? 1 : 0,
        transform: blockInView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <h3 className="text-[clamp(22px,2.8vw,34px)] font-normal text-white mb-5 leading-tight">
        {t(titleKey)}
      </h3>
      <p className="text-[16px] text-[#999] leading-relaxed">
        {t(textKey)}
      </p>
    </div>
  );
}

const textBlocks: { titleKey: TKeys; textKey: TKeys }[] = [
  { titleKey: 'm1Title', textKey: 'm1Text' },
  { titleKey: 'm2Title', textKey: 'm2Text' },
  { titleKey: 'm3Title', textKey: 'm3Text' },
];

export const Mission: React.FC = () => {
  const { t } = useTranslation();
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.1 });

  return (
    <section id="mission" ref={sectionRef} className="w-full py-24 lg:py-32 bg-[#111]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <SectionLabel text={t('missionLabel')} color="#888" />

        <h2
          className="text-[clamp(32px,4vw,56px)] font-normal text-white leading-[1.05] tracking-tight mb-16"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0px)' : 'translateY(50px)',
            transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1), transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
          }}
        >
          {t('missionHeading')}
        </h2>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Images column */}
          <div className="lg:w-[45%] flex flex-col gap-4">
            {missionImages.map((src, index) => (
              <MissionImage
                key={src}
                src={src}
                index={index}
                altText={`${t('missionLabel')} ${index + 1}`}
              />
            ))}
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-[#2a2a2a] self-stretch" />

          {/* Text column */}
          <div className="lg:w-[55%] flex flex-col justify-between">
            {textBlocks.map((block, index) => (
              <MissionBlock
                key={block.titleKey}
                titleKey={block.titleKey}
                textKey={block.textKey}
                hasBorderTop={index > 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
