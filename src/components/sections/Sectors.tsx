import React from 'react';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useTranslation, type TKeys } from '@/lib/i18nContext';
import {
  Home,
  Store,
  Milestone,
  Factory,
  Landmark,
  Building2,
} from 'lucide-react';

interface SectorItem {
  icon: React.ElementType;
  titleKey: TKeys;
  descKey: TKeys;
  accent: string;
}

const sectors: SectorItem[] = [
  { icon: Home,      titleKey: 'sec1Title', descKey: 'sec1Desc', accent: '#c41e3a' },
  { icon: Store,     titleKey: 'sec2Title', descKey: 'sec2Desc', accent: '#c41e3a' },
  { icon: Milestone, titleKey: 'sec3Title', descKey: 'sec3Desc', accent: '#c41e3a' },
  { icon: Factory,   titleKey: 'sec4Title', descKey: 'sec4Desc', accent: '#c41e3a' },
  { icon: Landmark,  titleKey: 'sec5Title', descKey: 'sec5Desc', accent: '#c41e3a' },
  { icon: Building2, titleKey: 'sec6Title', descKey: 'sec6Desc', accent: '#c41e3a' },
];

function SectorCard({
  sector,
  index,
}: {
  sector: SectorItem;
  index: number;
}) {
  const { t } = useTranslation();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const Icon = sector.icon;

  return (
    <div
      ref={ref}
      className="group relative border border-[#e8e8e8] bg-white p-8 lg:p-10 hover:border-[#c41e3a]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-400 cursor-default overflow-hidden"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0px)' : 'translateY(32px)',
        transition: `opacity 0.65s cubic-bezier(0.33,1,0.68,1) ${index * 0.08}s, transform 0.65s cubic-bezier(0.33,1,0.68,1) ${index * 0.08}s, border-color 0.3s, box-shadow 0.3s`,
      }}
    >
      {/* Background accent line on hover */}
      <div
        className="absolute left-0 top-0 w-[3px] h-0 bg-[#c41e3a] group-hover:h-full transition-all duration-300 ease-out"
      />

      {/* Icon */}
      <div className="mb-6 inline-flex items-center justify-center w-12 h-12 bg-[#f7f7f7] group-hover:bg-[#c41e3a]/8 transition-colors duration-300">
        <Icon
          className="w-5 h-5 transition-colors duration-300"
          style={{ color: sector.accent }}
          strokeWidth={1.5}
        />
      </div>

      {/* Number */}
      <div className="absolute top-6 right-8 text-[11px] font-medium tracking-widest text-[#d0d0d0]">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Content */}
      <h3 className="text-[18px] font-medium text-[#1a1a1a] mb-3 leading-snug group-hover:text-[#c41e3a] transition-colors duration-300">
        {t(sector.titleKey)}
      </h3>
      <p className="text-[14px] text-[#888] leading-relaxed">
        {t(sector.descKey)}
      </p>
    </div>
  );
}

export const Sectors: React.FC = () => {
  const { t } = useTranslation();
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      id="sectors"
      ref={sectionRef}
      className="w-full py-24 lg:py-32 bg-[#f7f7f7]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.7s cubic-bezier(0.33,1,0.68,1), transform 0.7s cubic-bezier(0.33,1,0.68,1)',
            }}
          >
            <SectionLabel text={t('sectorsLabel')} />
            <h2 className="text-[clamp(30px,3.5vw,52px)] font-normal text-[#1a1a1a] leading-[1.05] tracking-tight">
              {t('sectorsHeading')}
            </h2>
          </div>

          <p
            className="text-[#888] text-[15px] max-w-[380px] mt-4 lg:mt-0 lg:text-right leading-relaxed"
            style={{
              opacity: isInView ? 1 : 0,
              transition: 'opacity 0.7s ease 0.15s',
            }}
          >
            {t('sectorsSubtext')}
          </p>
        </div>

        {/* 3-column grid, 2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sectors.map((sector, index) => (
            <SectorCard key={sector.titleKey} sector={sector} index={index} />
          ))}
        </div>

        {/* Bottom divider line */}
        <div
          className="mt-16 border-t border-[#e0e0e0]"
          style={{
            opacity: isInView ? 1 : 0,
            transition: 'opacity 0.7s ease 0.5s',
          }}
        />
      </div>
    </section>
  );
};

export default Sectors;
