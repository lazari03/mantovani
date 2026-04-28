import React from 'react';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Shield, Clock, Award, Users, Settings } from 'lucide-react';

const reasons = [
  {
    num: '01',
    title: 'Cilësi dhe qëndrueshmëri në çdo projekt',
    desc: 'Ne përdorim materiale të certifikuara dhe procese të kontrolluara për të garantuar maksimumin e qëndrueshmërisë.',
    icon: Shield,
  },
  {
    num: '02',
    title: 'Korrektësi në afate dhe furnizim',
    desc: 'Respektimi i afateve është prioriteti ynë. Ne dimë sa e rëndësishme është koha në një projekt ndërtim.',
    icon: Clock,
  },
  {
    num: '03',
    title: 'Eksperiencë në punime ndërtimi dhe infrastrukture',
    desc: 'Me vite përvojë në sektor, kemi ndërtuar ekspertizë në çdo lloj projekti.',
    icon: Award,
  },
  {
    num: '04',
    title: 'Shërbim profesional dhe bashkëpunim serioz',
    desc: 'Ekipi ynë është i përkushtuar për të ofruar shërbim të shkëlqyer në çdo fazë të projektit.',
    icon: Users,
  },
  {
    num: '05',
    title: 'Zgjidhje të përshtatura sipas nevojave të klientit',
    desc: 'Çdo projekt është unik. Ne ofrojmë zgjidhje të personalizuara për çdo nevojë specifike.',
    icon: Settings,
  },
];

export const WhyUs: React.FC = () => {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      id="why-us"
      ref={sectionRef}
      className="w-full py-24 lg:py-32 bg-[#1a1a1a]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-16">
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1), transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
              willChange: isInView ? 'auto' : 'opacity, transform',
            }}
          >
            <SectionLabel text="PSE NE" color="#999" />
            <h2 className="text-[clamp(32px,4vw,56px)] font-normal text-white leading-[1.05] tracking-tight">
              Pse të zgjidhni Mantovani Beton
            </h2>
          </div>
          <div
            className="flex items-end"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.15s, transform 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.15s',
              willChange: isInView ? 'auto' : 'opacity, transform',
            }}
          >
            <p className="text-lg text-[#888] leading-relaxed">
              Mbi 15 vite eksperiencë në prodhimin e betonit dhe realizimin e projekteve
              ndërtimore në Shkodër dhe rajonin përreth. Cilësia jonë flet përmes çdo
              projekti të përfunduar.
            </p>
          </div>
        </div>

        {/* Reasons - 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.num}
                className="group border border-[#333] p-8 lg:p-10 hover:border-[#c41e3a]/50 transition-colors duration-300"
                style={{
                  opacity: isInView ? 1 : 0,
                  transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
                  transition: `opacity 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${0.2 + index * 0.08}s, transform 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${0.2 + index * 0.08}s`,
                  willChange: isInView ? 'auto' : 'opacity, transform',
                }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center border border-[#444] group-hover:border-[#c41e3a] transition-colors duration-300">
                    <Icon className="w-5 h-5 text-[#c41e3a]" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#666] uppercase tracking-widest block mb-2">
                      {reason.num}
                    </span>
                    <h3 className="text-lg font-medium text-white mb-3 leading-snug">
                      {reason.title}
                    </h3>
                    <p className="text-[15px] text-[#888] leading-relaxed">
                      {reason.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
