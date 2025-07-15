import { useTranslation } from '../hooks/useTranslation';

// Интерфейс для объектов с локализованными полями
export interface LocalizableItem {
  name?: string;
  name_ru?: string;
  name_uk?: string;
  description?: string;
  description_ru?: string;
  description_uk?: string;
  address?: string;
  address_ru?: string;
  address_uk?: string;
}

/**
 * Получение локализованного названия для объекта
 * @param item - объект с локализованными полями
 * @param locale - язык (ru/uk), если не указан - берется из localStorage
 * @returns локализованное название с fallback логикой
 */
export const getLocalizedName = (
  item: LocalizableItem,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return item.name_uk || item.name_ru || item.name || '';
  }
  
  // Приоритет для русского языка (по умолчанию)
  return item.name_ru || item.name_uk || item.name || '';
};

/**
 * Хук для получения функции локализации названий
 * Автоматически использует текущий язык из системы переводов
 */
export const useLocalizedName = () => {
  const { currentLanguage } = useTranslation();
  
  return (item: LocalizableItem) => getLocalizedName(item, currentLanguage);
};

/**
 * Получение локализованного описания для объекта
 * @param item - объект с локализованными полями
 * @param locale - язык (ru/uk), если не указан - берется из localStorage
 * @returns локализованное описание с fallback логикой
 */
export const getLocalizedDescription = (
  item: LocalizableItem,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return item.description_uk || item.description_ru || item.description || '';
  }
  
  // Приоритет для русского языка (по умолчанию)
  return item.description_ru || item.description_uk || item.description || '';
};

/**
 * Получение локализованного адреса для объекта
 * @param item - объект с локализованными полями
 * @param locale - язык (ru/uk), если не указан - берется из localStorage
 * @returns локализованный адрес с fallback логикой
 */
export const getLocalizedAddress = (
  item: LocalizableItem,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return item.address_uk || item.address_ru || item.address || '';
  }
  
  // Приоритет для русского языка (по умолчанию)
  return item.address_ru || item.address_uk || item.address || '';
};

/**
 * Хук для получения функции локализации описаний
 * Автоматически использует текущий язык из системы переводов
 */
export const useLocalizedDescription = () => {
  const { currentLanguage } = useTranslation();
  
  return (item: LocalizableItem) => getLocalizedDescription(item, currentLanguage);
};

/**
 * Хук для получения функции локализации адресов
 * Автоматически использует текущий язык из системы переводов
 */
export const useLocalizedAddress = () => {
  const { currentLanguage } = useTranslation();
  
  return (item: LocalizableItem) => getLocalizedAddress(item, currentLanguage);
};

/**
 * Хук для получения локализованного названия с автоматическим обновлением при смене языка
 * @param item - объект с локализованными полями
 * @returns локализованное название
 */
export const useLocalizedItemName = (item: LocalizableItem): string => {
  const { currentLanguage } = useTranslation();
  return getLocalizedName(item, currentLanguage);
};

/**
 * Проверка наличия переводов для объекта
 * @param item - объект с локализованными полями
 * @returns объект с информацией о наличии переводов
 */
export const getTranslationStatus = (item: LocalizableItem) => {
  return {
    hasRussian: !!(item.name_ru && item.name_ru.trim()),
    hasUkrainian: !!(item.name_uk && item.name_uk.trim()),
    hasOriginal: !!(item.name && item.name.trim()),
    isComplete: !!(item.name_ru && item.name_ru.trim() && item.name_uk && item.name_uk.trim())
  };
};

/**
 * Получение всех доступных названий для объекта
 * @param item - объект с локализованными полями
 * @returns объект со всеми доступными переводами
 */
export const getAllTranslations = (item: LocalizableItem) => {
  return {
    original: item.name || '',
    russian: item.name_ru || '',
    ukrainian: item.name_uk || '',
    current: getLocalizedName(item)
  };
}; 