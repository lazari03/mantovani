import type { TKeys } from '@/lib/i18nContext';

export interface ServiceDetail {
  num: string;
  title: string;
  desc: string;
  image: string;
  fullDescription: string;
  features: string[];
  applications: string[];
  benefits: string[];
}

type TFn = (key: TKeys) => string;

export function getServicesData(t: TFn): ServiceDetail[] {
  return [
    {
      num: '01',
      title: t('s01Title'),
      desc: t('s01Desc'),
      image: '/assets/services/service-1.jpg',
      fullDescription: t('s01FullDesc'),
      features: [t('s01F1'), t('s01F2'), t('s01F3'), t('s01F4'), t('s01F5')],
      applications: [t('s01A1'), t('s01A2'), t('s01A3'), t('s01A4'), t('s01A5')],
      benefits: [t('s01B1'), t('s01B2'), t('s01B3'), t('s01B4'), t('s01B5')],
    },
    {
      num: '02',
      title: t('s02Title'),
      desc: t('s02Desc'),
      image: '/assets/services/service-2.jpg',
      fullDescription: t('s02FullDesc'),
      features: [t('s02F1'), t('s02F2'), t('s02F3'), t('s02F4'), t('s02F5')],
      applications: [t('s02A1'), t('s02A2'), t('s02A3'), t('s02A4'), t('s02A5')],
      benefits: [t('s02B1'), t('s02B2'), t('s02B3'), t('s02B4'), t('s02B5')],
    },
    {
      num: '03',
      title: t('s03Title'),
      desc: t('s03Desc'),
      image: '/assets/services/service-3.jpg',
      fullDescription: t('s03FullDesc'),
      features: [t('s03F1'), t('s03F2'), t('s03F3'), t('s03F4'), t('s03F5')],
      applications: [t('s03A1'), t('s03A2'), t('s03A3'), t('s03A4'), t('s03A5')],
      benefits: [t('s03B1'), t('s03B2'), t('s03B3'), t('s03B4'), t('s03B5')],
    },
    {
      num: '04',
      title: t('s04Title'),
      desc: t('s04Desc'),
      image: '/assets/services/service-4.jpg',
      fullDescription: t('s04FullDesc'),
      features: [t('s04F1'), t('s04F2'), t('s04F3'), t('s04F4'), t('s04F5')],
      applications: [t('s04A1'), t('s04A2'), t('s04A3'), t('s04A4'), t('s04A5')],
      benefits: [t('s04B1'), t('s04B2'), t('s04B3'), t('s04B4'), t('s04B5')],
    },
    {
      num: '05',
      title: t('s05Title'),
      desc: t('s05Desc'),
      image: '/assets/gallery/53530.jpg',
      fullDescription: t('s05FullDesc'),
      features: [t('s05F1'), t('s05F2'), t('s05F3'), t('s05F4'), t('s05F5')],
      applications: [t('s05A1'), t('s05A2'), t('s05A3'), t('s05A4'), t('s05A5')],
      benefits: [t('s05B1'), t('s05B2'), t('s05B3'), t('s05B4'), t('s05B5')],
    },
  ];
}

export function getServiceById(id: string, t: TFn): ServiceDetail | undefined {
  return getServicesData(t).find((s) => s.num === id);
}
