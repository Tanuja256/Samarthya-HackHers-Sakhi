import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import mr from './mr.json';

const savedLang = localStorage.getItem('sakhi-lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    mr: { translation: mr },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;
