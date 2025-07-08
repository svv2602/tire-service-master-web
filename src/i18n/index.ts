import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import main translation files
import ukTranslations from './locales/uk.json';
import ruTranslations from './locales/ru.json';

// Import form translation files
import settingsRuTranslations from './locales/forms/settings/settings-ru.json';
import settingsUkTranslations from './locales/forms/settings/settings-uk.json';
import clientRuTranslations from './locales/forms/client/client-ru.json';
import clientUkTranslations from './locales/forms/client/client-uk.json';
import modalsRuTranslations from './locales/forms/modals/modals-ru.json';
import modalsUkTranslations from './locales/forms/modals/modals-uk.json';
import partnerRuTranslations from './locales/forms/partners/partner-ru.json';
import partnerUkTranslations from './locales/forms/partners/partner-uk.json';
import tireCalculatorRuTranslations from './locales/forms/tire-calculator/tire-calculator-ru.json';
import tireCalculatorUkTranslations from './locales/forms/tire-calculator/tire-calculator-uk.json';

// Import new form translation files
import commonRuTranslations from './locales/forms/common/common-ru.json';
import commonUkTranslations from './locales/forms/common/common-uk.json';
import userRuTranslations from './locales/forms/user/user-ru.json';
import userUkTranslations from './locales/forms/user/user-uk.json';
import bookingRuTranslations from './locales/forms/booking/booking-ru.json';
import bookingUkTranslations from './locales/forms/booking/booking-uk.json';

// Deep merge utility function
function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

const resources = {
  uk: {
    translation: deepMerge(
      deepMerge(
        deepMerge(
          deepMerge(
            deepMerge(
              deepMerge(
                deepMerge(
                  deepMerge(
                    deepMerge(ukTranslations, settingsUkTranslations),
                    clientUkTranslations
                  ),
                  modalsUkTranslations
                ),
                partnerUkTranslations
              ),
              tireCalculatorUkTranslations
            ),
            commonUkTranslations
          ),
          userUkTranslations
        ),
        bookingUkTranslations
      ),
      {} // Placeholder for future form translations
    ),
  },
  ru: {
    translation: deepMerge(
      deepMerge(
        deepMerge(
          deepMerge(
            deepMerge(
              deepMerge(
                deepMerge(
                  deepMerge(
                    deepMerge(ruTranslations, settingsRuTranslations),
                    clientRuTranslations
                  ),
                  modalsRuTranslations
                ),
                partnerRuTranslations
              ),
              tireCalculatorRuTranslations
            ),
            commonRuTranslations
          ),
          userRuTranslations
        ),
        bookingRuTranslations
      ),
      {} // Placeholder for future form translations
    ),
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'uk',
    fallbackLng: 'uk',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 