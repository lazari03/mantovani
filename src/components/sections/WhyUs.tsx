import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Shield, Clock, Award, Users, Settings } from 'lucide-react';
import { ConcreteParticleField } from '@/components/three/ConcreteParticleField';
import { useTranslation } from '@/lib/i18nContext';

gsap.registerPlugin(ScrollTrigger);

const REASON_ICONS = [Shield, Clock, Award, Users, Settings] as const;

export const WhyUs: React.FC = () => {
  const { t } = useTranslation();
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.1 });
  const headingRef = useRef<HTMLHeadingElement>(null);

  const reasons = [
    { num: '01', icon: REASON_ICONS[0], titleKey: 'r01Title' as const, descKey: 'r01Desc' as const },
    { num: '02', icon: REASON_ICONS[1], titleKey: 'r02Title' as const, descKey: 'r02Desc' as const },
    { num: '03', icon: REASON_ICONS[2], titleKey: 'r03Title' as const, descKey: 'r03Desc' as const },
    { num: '04', icon: REASON_ICONS[3], titleKey: 'r04Title' as const, descKey: 'r04Desc' as const },
    { num: '05', icon: REASON_ICONS[4], titleKey: 'r05Title' as const, descKey: 'r05Desc' as const },
  ];

  useEffect(() => {
    if (!headingRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="why-us"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-[#1a1a1a] overflow-hidden"
    >
      {/* 3D particle field background */}
      <ConcreteParticleField />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-16">
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1), transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            <SectionLabel text={t('whyUsLabel')} color="#666" />
            <h2
              ref={headingRef}
              className="text-[clamp(32px,4vw,56px)] font-normal text-white leading-[1.05] tracking-tight"
            >
              {t('whyUsHeading')}
            </h2>
          </div>

          <div
            className="flex items-end"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.15s, transform 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.15s',
            }}
          >
            <p className="text-lg text-[#888] leading-relaxed">
              {t('whyUsSubtext')}
            </p>
          </div>
        </div>

        {/* Reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.num}
                className="group border border-[#2a2a2a] p-8 lg:p-10 hover:border-[#c41e3a]/60 transition-all duration-300 bg-[#111]/60 backdrop-blur-sm"
                style={{
                  opacity: isInView ? 1 : 0,
                  transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
                  transition: `opacity 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${0.2 + index * 0.08}s, transform 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${0.2 + index * 0.08}s`,
                }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center border border-[#333] group-hover:border-[#c41e3a] transition-colors duration-300">
                    <Icon className="w-5 h-5 text-[#c41e3a]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#555] uppercase tracking-widest block mb-2">
                      {reason.num}
                    </span>
                    <h3 className="text-[17px] font-medium text-white mb-3 leading-snug">
                      {t(reason.titleKey)}
                    </h3>
                    <p className="text-[14px] text-[#888] leading-relaxed">
                      {t(reason.descKey)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Fifth card spans full width on md */}
          {/* Handled by grid auto-placement — last card will span naturally */}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
