import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useTranslation } from '@/lib/i18nContext';

gsap.registerPlugin(ScrollTrigger);

// Real company photos
const REAL_PHOTOS = [
  '/assets/gallery/52860.jpg',
  '/assets/gallery/53530.jpg',
  '/assets/gallery/53532.jpg',
  '/assets/gallery/20260427_144429.jpg',
];

function AnimatedStat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  const numRef = useRef<HTMLParagraphElement>(null);
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current || !numRef.current) return;
    hasAnimated.current = true;

    const suffix = value.replace(/[0-9]/g, '');
    const target = parseInt(value.replace(/[^0-9]/g, ''), 10);
    const el = numRef.current;
    const counter = { val: 0 };

    gsap.to(counter, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = Math.round(counter.val) + suffix;
      },
    });
  }, [inView, value]);

  return (
    <div ref={ref}>
      <p ref={numRef} className="text-[42px] font-light leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-[12px] text-[#999] uppercase tracking-wider mt-2">{label}</p>
    </div>
  );
}

export const About: React.FC = () => {
  const { t } = useTranslation();
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.15 });
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="w-full py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-20">

          {/* Text Content */}
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1), transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            <SectionLabel text={t('aboutLabel')} />
            <h2
              ref={headingRef}
              className="text-[clamp(32px,4vw,56px)] font-normal text-[#1a1a1a] leading-[1.05] tracking-tight mb-8"
            >
              {t('aboutHeading')}
            </h2>
            <p className="text-lg text-[#666] leading-relaxed">
              {t('aboutText')}
            </p>

            {/* Animated Stats */}
            <div className="mt-10 flex gap-10 lg:gap-12 flex-wrap">
              <AnimatedStat
                value={t('aboutStat1Value')}
                label={t('aboutStat1Label')}
                color="#c41e3a"
              />
              <AnimatedStat
                value={t('aboutStat2Value')}
                label={t('aboutStat2Label')}
                color="#c41e3a"
              />
              <AnimatedStat
                value={t('aboutStat3Value')}
                label={t('aboutStat3Label')}
                color="#c41e3a"
              />
            </div>
          </div>

          {/* Right column: main image + 3D cube */}
          <div
            className="flex flex-col gap-6"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0px)' : 'translateY(40px)',
              transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.2s, transform 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.2s',
            }}
          >
            {/* Featured image — concrete batching plant */}
            <div className="relative overflow-hidden">
              <img
                src={REAL_PHOTOS[0]}
                alt={t('aboutLabel')}
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
            </div>

          </div>
        </div>

        {/* Real company photo grid — 4 photos, 2×2 */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.3s, transform 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.3s',
          }}
        >
          {REAL_PHOTOS.map((src, index) => (
            <div key={index} className="overflow-hidden group aspect-[4/3]">
              <img
                src={src}
                alt={`${t('aboutLabel')} ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
