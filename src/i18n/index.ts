import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import main translation files
import ukTranslations from './locales/uk.json';
import ruTranslations from './locales/ru.json';

// Import form translation files
import settingsRuTranslations from './locales/forms/settings/settings-ru.json';
import settingsUkTranslations from './locales/forms/settings/settings-uk.json';
import clientAdminRuTranslations from './locales/forms/client-admin/client-ru.json';
import clientAdminUkTranslations from './locales/forms/client-admin/client-uk.json';
import clientClientRuTranslations from './locales/forms/client-client/client-ru.json';
import clientClientUkTranslations from './locales/forms/client-client/client-uk.json';
import partnersRuTranslations from './locales/forms/partners/partners-ru.json';
import partnersUkTranslations from './locales/forms/partners/partners-uk.json';
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
import articlesRuTranslations from './locales/forms/articles/articles-ru.json';
import articlesUkTranslations from './locales/forms/articles/articles-uk.json';
import authRuTranslations from './locales/forms/auth/auth-ru.json';
import authUkTranslations from './locales/forms/auth/auth-uk.json';
import bookingsRuTranslations from './locales/forms/bookings/bookings-ru.json';
import bookingsUkTranslations from './locales/forms/bookings/bookings-uk.json';
import dashboardRuTranslations from './locales/forms/dashboard/dashboard-ru.json';
import dashboardUkTranslations from './locales/forms/dashboard/dashboard-uk.json';
import servicePointsRuTranslations from './locales/forms/service-points/service-points-ru.json';
import servicePointsUkTranslations from './locales/forms/service-points/service-points-uk.json';
import regionsRuTranslations from './locales/forms/regions/region-ru.json';
import regionsUkTranslations from './locales/forms/regions/region-uk.json';
import reviewsRuTranslations from './locales/forms/reviews/reviews-ru.json';
import reviewsUkTranslations from './locales/forms/reviews/reviews-uk.json';
import reviewRuTranslations from './locales/forms/reviews/review-ru.json';
import reviewUkTranslations from './locales/forms/reviews/review-uk.json';

// Client Service Points
import clientServicePointsRuTranslations from './locales/forms/client-service-points/client-service-points-ru.json';
import clientServicePointsUkTranslations from './locales/forms/client-service-points/client-service-points-uk.json';

// Profile
import profileRuTranslations from './locales/forms/profile/profile-ru.json';
import profileUkTranslations from './locales/forms/profile/profile-uk.json';

// Car Brands
import carBrandsRuTranslations from './locales/forms/car-brands/car-brands-ru.json';
import carBrandsUkTranslations from './locales/forms/car-brands/car-brands-uk.json';

// Components translations
import componentsRuTranslations from './locales/components/ru.json';
import componentsUkTranslations from './locales/components/uk.json';

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

// Ukrainian translation modules
const ukTranslationModules = [
  ukTranslations,
  settingsUkTranslations,
  clientAdminUkTranslations,
  clientClientUkTranslations,
  partnersUkTranslations,
  modalsUkTranslations,
  partnerUkTranslations,
  tireCalculatorUkTranslations,
  commonUkTranslations,
  userUkTranslations,
  bookingUkTranslations,
  articlesUkTranslations,
  authUkTranslations,
  bookingsUkTranslations,
  dashboardUkTranslations,
  servicePointsUkTranslations,
  regionsUkTranslations,
  reviewsUkTranslations,
  reviewUkTranslations,
  clientServicePointsUkTranslations,
  profileUkTranslations,
  carBrandsUkTranslations,
];

// Russian translation modules
const ruTranslationModules = [
  ruTranslations,
  settingsRuTranslations,
  clientAdminRuTranslations,
  clientClientRuTranslations,
  partnersRuTranslations,
  modalsRuTranslations,
  partnerRuTranslations,
  tireCalculatorRuTranslations,
  commonRuTranslations,
  userRuTranslations,
  bookingRuTranslations,
  articlesRuTranslations,
  authRuTranslations,
  bookingsRuTranslations,
  dashboardRuTranslations,
  servicePointsRuTranslations,
  regionsRuTranslations,
  reviewsRuTranslations,
  reviewRuTranslations,
  clientServicePointsRuTranslations,
  profileRuTranslations,
  carBrandsRuTranslations,
];

const resources = {
  uk: {
    translation: ukTranslationModules.reduce((acc, curr) => deepMerge(acc, curr), {}),
    components: componentsUkTranslations,
  },
  ru: {
    translation: ruTranslationModules.reduce((acc, curr) => deepMerge(acc, curr), {}),
    components: componentsRuTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'ru', // Используем сохраненный язык или русский по умолчанию
    fallbackLng: 'ru',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // ТОЛЬКО localStorage для определения языка
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    // Белый список поддерживаемых языков
    supportedLngs: ['ru', 'uk'],
    // Не загружать язык из кода страны
    load: 'languageOnly',
    // Проверяем поддерживаемые языки
    nonExplicitSupportedLngs: false,
  });

// Устанавливаем русский язык по умолчанию только если localStorage пуст
if (!localStorage.getItem('i18nextLng')) {
  localStorage.setItem('i18nextLng', 'ru');
}

export default i18n; 