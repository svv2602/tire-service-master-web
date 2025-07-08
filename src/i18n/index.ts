import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import ukTranslations from './locales/uk.json';
import ruTranslations from './locales/ru.json';
import settingsRuTranslations from './locales/settings-ru.json';
import settingsUkTranslations from './locales/settings-uk.json';
import clientRuTranslations from './locales/client-ru.json';
import clientUkTranslations from './locales/client-uk.json';
import modalsRuTranslations from './locales/modals-ru.json';
import modalsUkTranslations from './locales/modals-uk.json';

// Функция для глубокого объединения объектов
const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

const resources = {
  uk: {
    translation: deepMerge(
      deepMerge(
        deepMerge(ukTranslations, settingsUkTranslations),
        clientUkTranslations
      ),
      modalsUkTranslations
    ),
  },
  ru: {
    translation: deepMerge(
      deepMerge(
        deepMerge(ruTranslations, settingsRuTranslations),
        clientRuTranslations
      ),
      modalsRuTranslations
    ),
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