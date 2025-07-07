import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import ukTranslations from './locales/uk.json';
import ruTranslations from './locales/ru.json';

const resources = {
  uk: {
    translation: ukTranslations,
  },
  ru: {
    translation: ruTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uk',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Экспортируем i18n в глобальную область для отладки
if (typeof window !== 'undefined') {
  (window as any).i18n = i18n;
}

export default i18n; 