import React, { createContext, useContext, useState, useCallback } from 'react';
import al from '../locales/al.json';
import en from '../locales/en.json';
import it from '../locales/it.json';

export type Lang = 'al' | 'en' | 'it';
export type TKeys = keyof typeof al;

type Locales = typeof al;
const locales: Record<Lang, Locales> = { al, en, it };

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKeys) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'al',
  setLang: () => {},
  t: (key) => key as string,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('mantovani_lang');
      if (saved === 'al' || saved === 'en' || saved === 'it') return saved;
    } catch {}
    return 'al';
  });

  const setLang = useCallback((newLang: Lang) => {
    try { localStorage.setItem('mantovani_lang', newLang); } catch {}
    setLangState(newLang);
  }, []);

  const t = useCallback((key: TKeys): string => {
    const val = locales[lang][key];
    return val ?? (key as string);
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
