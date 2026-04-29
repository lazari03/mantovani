// Simple i18n utility
import al from '../locales/al.json';
import en from '../locales/en.json';
import it from '../locales/it.json';

const locales = { al, en, it };

let currentLang: keyof typeof locales = 'al';

export function setLang(lang: keyof typeof locales) {
  currentLang = lang;
}

export function t(key: keyof typeof al): string {
  return locales[currentLang][key] || key;
}
