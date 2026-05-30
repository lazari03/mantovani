import React from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '@/hooks/useInView';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ArrowRight } from 'lucide-react';
import { getServicesData, type ServiceDetail } from '@/data/servicesData';
import { useTranslation } from '@/lib/i18nContext';

export const Services: React.FC = () => {
  const { t } = useTranslation();
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.1 });
  const services = getServicesData(t);

  return (
    <section id="services" ref={sectionRef} className="w-full py-24 lg:py-32 bg-[#f7f7f7]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0px)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1), transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            <SectionLabel text={t('servicesLabel')} />
            <h2 className="text-[clamp(32px,4vw,56px)] font-normal text-[#1a1a1a] leading-[1.05] tracking-tight">
              {t('servicesHeading')}
            </h2>
          </div>
          <p
            className="text-[#666] max-w-[400px] mt-4 lg:mt-0 lg:text-right"
            style={{
              opacity: isInView ? 1 : 0,
              transition: 'opacity 0.8s ease 0.2s',
            }}
          >
            {t('servicesSubtext')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.num} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

function ServiceCard({ service, index }: { service: ServiceDetail; index: number }) {
  const { t } = useTranslation();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0px)' : 'translateY(40px)',
        transition: `opacity 0.7s cubic-bezier(0.33, 1, 0.68, 1) ${index * 0.1}s, transform 0.7s cubic-bezier(0.33, 1, 0.68, 1) ${index * 0.1}s`,
      }}
    >
      <Link
        to={`/services/${service.num}`}
        className="group bg-white overflow-hidden cursor-pointer block"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5">
            <span className="text-[11px] font-medium tracking-wider text-[#1a1a1a]">
              {service.num}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          <h3 className="text-xl font-medium text-[#1a1a1a] mb-3 group-hover:text-[#c41e3a] transition-colors duration-300">
            {service.title}
          </h3>
          <p className="text-[15px] text-[#666] leading-relaxed mb-4">
            {service.desc}
          </p>
          <div className="flex items-center gap-2 text-[#c41e3a] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[12px] font-medium uppercase tracking-wider">{t('servicesReadMore')}</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Services;
